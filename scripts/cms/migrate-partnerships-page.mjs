import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { seedCollections, STAGING_SITE_ID } from "./staging-seed-data.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const apply = process.argv.includes("--apply");
const wixConfig = JSON.parse(await readFile(join(repositoryRoot, "wix.config.json"), "utf8"));
if (wixConfig.siteId !== STAGING_SITE_ID) {
  throw new Error("Migration blocked: Wix is not pointing to the approved staging site.");
}

const fromManifest = (collectionId) =>
  seedCollections.find((collection) => collection.collectionId === collectionId)?.items ?? [];
const desiredSections = fromManifest("CHPageSections").filter(({ key }) => key.startsWith("partnerships."));
const desiredItems = fromManifest("CHSectionItems").filter(({ key }) => key.startsWith("partnerships."));
const desiredPartner = fromManifest("CHPartners").find(({ key }) => key === "barcelona-tech-city");
if (!desiredPartner) throw new Error("Migration manifest is missing Barcelona Tech City.");

const wixCli = join(repositoryRoot, "node_modules", ".bin", "wix");
const tokenResult = spawnSync(wixCli, ["token", "--site", wixConfig.siteId], {
  cwd: repositoryRoot,
  encoding: "utf8",
  env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
});
if (tokenResult?.error) throw new Error(`Unable to start the Wix CLI: ${tokenResult.error.message}`);
if (tokenResult.status !== 0) throw new Error(`Unable to obtain a site-scoped Wix token: ${tokenResult.stderr.trim()}`);
const token = tokenResult.stdout.trim();
if (!token) throw new Error("The Wix CLI returned an empty access token.");

async function wixRequest(path, init = {}) {
  const response = await fetch(`https://www.wixapis.com${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token,
      "wix-site-id": wixConfig.siteId,
      ...(init.headers ?? {}),
    },
  });
  const body = await response.text();
  const parsed = body ? JSON.parse(body) : {};
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} from ${path}: ${body}`);
  return parsed;
}

async function queryItems(dataCollectionId) {
  const response = await wixRequest("/wix-data/v2/items/query", {
    method: "POST",
    body: JSON.stringify({ dataCollectionId, query: { paging: { limit: 1000, offset: 0 } } }),
  });
  return response.dataItems ?? [];
}

async function saveItem(dataCollectionId, existing, data) {
  return wixRequest(existing ? "/wix-data/v2/items/update" : "/wix-data/v2/items", {
    method: "POST",
    body: JSON.stringify({ dataCollectionId, dataItem: existing ? { id: existing.id, data } : { data } }),
  });
}

const withoutSystemFields = (data = {}) =>
  Object.fromEntries(Object.entries(data).filter(([key]) => !key.startsWith("_")));
const resolveReferences = (data, references) => Object.fromEntries(Object.entries(data).map(([key, value]) => {
  if (!value?.$seedReference) return [key, value];
  const referenceKey = `${value.$seedReference.collectionId}:${value.$seedReference.key}`;
  const id = references.get(referenceKey);
  if (!id) throw new Error(`Migration cannot resolve ${referenceKey}.`);
  return [key, id];
}));

async function readState() {
  const [pages, sections, items, partners] = await Promise.all([
    queryItems("CHPages"),
    queryItems("CHPageSections"),
    queryItems("CHSectionItems"),
    queryItems("CHPartners"),
  ]);
  return { pages, sections, items, partners };
}

const initial = await readState();
const page = initial.pages.find((item) => item.data?.pageKey === "partnerships");
if (!page?.id) throw new Error('Migration blocked: CHPages item "partnerships" does not exist.');
const sandboxPartner = initial.partners.find((item) => item.data?.slug === "sandbox-community-partner");

console.log(JSON.stringify({
  mode: apply ? "apply" : "dry-run",
  site: "approved-staging",
  sections: desiredSections.map(({ key }) => ({
    key,
    action: initial.sections.some((item) => item.data?.sectionKey === key) ? "update" : "create",
  })),
  items: desiredItems.map(({ key }) => ({
    key,
    action: initial.items.some((item) => item.data?.itemKey === key) ? "update" : "create",
  })),
  partners: [
    { key: desiredPartner.key, action: initial.partners.some((item) => item.data?.slug === desiredPartner.key) ? "update" : "create" },
    ...(sandboxPartner?.data?.published ? [{ key: "sandbox-community-partner", action: "unpublish" }] : []),
  ],
}, null, 2));
if (!apply) process.exit(0);

const rootReferences = new Map([["CHPages:partnerships", page.id]]);
const sectionReferences = new Map();
for (const manifest of desiredSections) {
  const existing = initial.sections.find((item) => item.data?.sectionKey === manifest.key);
  const response = await saveItem("CHPageSections", existing, {
    ...withoutSystemFields(existing?.data),
    ...resolveReferences(manifest.data, rootReferences),
  });
  const id = existing?.id ?? response.dataItem?.id;
  if (!id) throw new Error(`Migration could not resolve CHPageSections:${manifest.key}.`);
  sectionReferences.set(`CHPageSections:${manifest.key}`, id);
}

for (const manifest of desiredItems) {
  const existing = initial.items.find((item) => item.data?.itemKey === manifest.key);
  await saveItem("CHSectionItems", existing, {
    ...withoutSystemFields(existing?.data),
    ...resolveReferences(manifest.data, sectionReferences),
  });
}

const existingDesiredPartner = initial.partners.find((item) => item.data?.slug === desiredPartner.key);
await saveItem("CHPartners", existingDesiredPartner, {
  ...withoutSystemFields(existingDesiredPartner?.data),
  ...desiredPartner.data,
});
if (sandboxPartner?.data?.published) {
  await saveItem("CHPartners", sandboxPartner, {
    ...withoutSystemFields(sandboxPartner.data),
    published: false,
  });
}

const verified = await readState();
const sectionsPassed = desiredSections.every(({ key, data }) => {
  const item = verified.sections.find((candidate) => candidate.data?.sectionKey === key);
  return item?.data?.page === page.id && item.data?.componentKey === data.componentKey && item.data?.enabled === true;
});
const sectionIds = new Map(verified.sections.map((item) => [item.data?.sectionKey, item.id]));
const itemsPassed = desiredItems.every(({ key, data }) => {
  const item = verified.items.find((candidate) => candidate.data?.itemKey === key);
  return item?.data?.section === sectionIds.get(data.section.$seedReference.key) && item.data?.published === true;
});
const partner = verified.partners.find((item) => item.data?.slug === desiredPartner.key);
const partnerPassed = partner?.data?.published === true && partner.data?.featured === true;
const sandboxPassed = !verified.partners.some((item) =>
  item.data?.slug === "sandbox-community-partner" && item.data?.published === true);
const passed = sectionsPassed && itemsPassed && partnerPassed && sandboxPassed;
console.log(JSON.stringify({
  verification: passed ? "passed" : "failed",
  sectionsPassed,
  itemsPassed,
  partnerPassed,
  sandboxPassed,
}, null, 2));
if (!passed) throw new Error("Post-migration verification failed.");
