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

const pageKeys = ["what-is-circles", "life-at-circles"];
const prefixes = pageKeys.map((key) => `${key}.`);
const hasTargetPrefix = (key) => prefixes.some((prefix) => String(key).startsWith(prefix));
const manifestSections = seedCollections
  .find(({ collectionId }) => collectionId === "CHPageSections")
  ?.items.filter(({ key }) => hasTargetPrefix(key)) ?? [];
const manifestItems = seedCollections
  .find(({ collectionId }) => collectionId === "CHSectionItems")
  ?.items.filter(({ key }) => hasTargetPrefix(key)) ?? [];

const wixCli = join(repositoryRoot, "node_modules", ".bin", "wix");
const tokenResult = spawnSync(wixCli, ["token", "--site", wixConfig.siteId], {
  cwd: repositoryRoot,
  encoding: "utf8",
  env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
});
if (tokenResult.status !== 0) {
  throw new Error(`Unable to obtain a site-scoped Wix token: ${tokenResult.stderr.trim()}`);
}
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
    body: JSON.stringify({
      dataCollectionId,
      dataItem: existing ? { id: existing.id, data } : { data },
    }),
  });
}

function withoutSystemFields(data = {}) {
  return Object.fromEntries(Object.entries(data).filter(([key]) => !key.startsWith("_")));
}

function desiredData(data, references) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => {
    if (!value?.$seedReference) return [key, value];
    const referenceKey = `${value.$seedReference.collectionId}:${value.$seedReference.key}`;
    const id = references.get(referenceKey);
    if (!id) throw new Error(`Migration cannot resolve ${referenceKey}.`);
    return [key, id];
  }));
}

async function readState() {
  const [pages, sections, items] = await Promise.all([
    queryItems("CHPages"),
    queryItems("CHPageSections"),
    queryItems("CHSectionItems"),
  ]);
  return { pages, sections, items };
}

const initial = await readState();
const pageIds = new Map(pageKeys.map((pageKey) => {
  const page = initial.pages.find((item) => item.data?.pageKey === pageKey);
  if (!page?.id) throw new Error(`Migration blocked: CHPages item "${pageKey}" does not exist.`);
  return [`CHPages:${pageKey}`, page.id];
}));

console.log(JSON.stringify({
  mode: apply ? "apply" : "dry-run",
  site: "approved-staging",
  pages: pageKeys,
  sections: manifestSections.map(({ key }) => ({
    key,
    action: initial.sections.some((item) => item.data?.sectionKey === key) ? "update" : "create",
  })),
  items: manifestItems.map(({ key }) => ({
    key,
    action: initial.items.some((item) => item.data?.itemKey === key) ? "update" : "create",
  })),
}, null, 2));

if (!apply) process.exit(0);

const sectionIds = new Map();
for (const manifest of manifestSections) {
  const existing = initial.sections.find((item) => item.data?.sectionKey === manifest.key);
  const data = {
    ...withoutSystemFields(existing?.data),
    ...desiredData(manifest.data, pageIds),
  };
  const response = await saveItem("CHPageSections", existing, data);
  const id = existing?.id ?? response.dataItem?.id;
  if (!id) throw new Error(`Migration could not resolve CHPageSections:${manifest.key}.`);
  sectionIds.set(`CHPageSections:${manifest.key}`, id);
}

for (const manifest of manifestItems) {
  const existing = initial.items.find((item) => item.data?.itemKey === manifest.key);
  await saveItem("CHSectionItems", existing, {
    ...withoutSystemFields(existing?.data),
    ...desiredData(manifest.data, sectionIds),
  });
}

const verified = await readState();
const sectionsPassed = manifestSections.every(({ key, data }) => {
  const actual = verified.sections.find((item) => item.data?.sectionKey === key);
  const expectedPageId = pageIds.get(`CHPages:${data.page.$seedReference.key}`);
  return actual?.data?.page === expectedPageId && actual.data?.componentKey === data.componentKey && actual.data?.enabled === true;
});
const verifiedSectionIds = new Map(verified.sections.map((item) => [item.data?.sectionKey, item.id]));
const itemsPassed = manifestItems.every(({ key, data }) => {
  const actual = verified.items.find((item) => item.data?.itemKey === key);
  return actual?.data?.section === verifiedSectionIds.get(data.section.$seedReference.key) && actual.data?.published === true;
});

console.log(JSON.stringify({
  verification: sectionsPassed && itemsPassed ? "passed" : "failed",
  sectionsPassed,
  itemsPassed,
}, null, 2));
if (!sectionsPassed || !itemsPassed) throw new Error("Post-migration verification failed.");
