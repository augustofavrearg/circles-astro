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

const teamSlugs = ["natalia-juncosa", "enric-sole", "loic-malsch", "karen-prats", "vanina-arballo", "gui-perdrix"];
const fromManifest = (collectionId) => seedCollections.find((collection) => collection.collectionId === collectionId)?.items ?? [];
const desiredPeople = fromManifest("CHPeople").filter(({ key }) => teamSlugs.includes(key));
const desiredSections = fromManifest("CHPageSections").filter(({ key }) => key.startsWith("team."));
const desiredItems = fromManifest("CHSectionItems").filter(({ key }) => key.startsWith("team."));

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

const withoutSystemFields = (data = {}) => Object.fromEntries(Object.entries(data).filter(([key]) => !key.startsWith("_")));
const resolveReferences = (data, references) => Object.fromEntries(Object.entries(data).map(([key, value]) => {
  if (!value?.$seedReference) return [key, value];
  const referenceKey = `${value.$seedReference.collectionId}:${value.$seedReference.key}`;
  const id = references.get(referenceKey);
  if (!id) throw new Error(`Migration cannot resolve ${referenceKey}.`);
  return [key, id];
}));

async function readState() {
  const [pages, locations, people, sections, items] = await Promise.all([
    queryItems("CHPages"),
    queryItems("CHLocations"),
    queryItems("CHPeople"),
    queryItems("CHPageSections"),
    queryItems("CHSectionItems"),
  ]);
  return { pages, locations, people, sections, items };
}

const initial = await readState();
const teamPage = initial.pages.find((item) => item.data?.pageKey === "team");
const barcelona = initial.locations.find((item) => item.data?.slug === "barcelona");
if (!teamPage?.id || !barcelona?.id) throw new Error("Migration blocked: Team page or Barcelona location is missing.");

console.log(JSON.stringify({
  mode: apply ? "apply" : "dry-run",
  site: "approved-staging",
  people: desiredPeople.map(({ key }) => ({ key, action: initial.people.some((item) => item.data?.slug === key) ? "update" : "create" })),
  sections: desiredSections.map(({ key }) => ({ key, action: initial.sections.some((item) => item.data?.sectionKey === key) ? "update" : "create" })),
  items: desiredItems.map(({ key }) => ({ key, action: initial.items.some((item) => item.data?.itemKey === key) ? "update" : "create" })),
}, null, 2));
if (!apply) process.exit(0);

const rootReferences = new Map([
  ["CHPages:team", teamPage.id],
  ["CHLocations:barcelona", barcelona.id],
]);

for (const manifest of desiredPeople) {
  const existing = initial.people.find((item) => item.data?.slug === manifest.key);
  await saveItem("CHPeople", existing, {
    ...withoutSystemFields(existing?.data),
    ...resolveReferences(manifest.data, rootReferences),
  });
}

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

const verified = await readState();
const peoplePassed = desiredPeople.every(({ key }) => {
  const item = verified.people.find((candidate) => candidate.data?.slug === key);
  return item?.data?.published === true && Boolean(item.data?.photo) && Boolean(item.data?.bio);
});
const sectionsPassed = desiredSections.every(({ key, data }) => {
  const item = verified.sections.find((candidate) => candidate.data?.sectionKey === key);
  return item?.data?.page === teamPage.id && item.data?.componentKey === data.componentKey && item.data?.enabled === true;
});
const sectionIds = new Map(verified.sections.map((item) => [item.data?.sectionKey, item.id]));
const itemsPassed = desiredItems.every(({ key, data }) => {
  const item = verified.items.find((candidate) => candidate.data?.itemKey === key);
  return item?.data?.section === sectionIds.get(data.section.$seedReference.key) && item.data?.published === true;
});
const passed = peoplePassed && sectionsPassed && itemsPassed;
console.log(JSON.stringify({ verification: passed ? "passed" : "failed", peoplePassed, sectionsPassed, itemsPassed }, null, 2));
if (!passed) throw new Error("Post-migration verification failed.");
