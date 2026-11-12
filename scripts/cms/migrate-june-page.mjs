import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { STAGING_SITE_ID, seedCollections } from "./staging-seed-data.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const apply = process.argv.includes("--apply");
const metadataOnly = process.argv.includes("--metadata-only");
const wixConfig = JSON.parse(await readFile(join(repositoryRoot, "wix.config.json"), "utf8"));
if (wixConfig.siteId !== STAGING_SITE_ID) {
  throw new Error("Migration blocked: wix.config.json does not point to the approved staging site.");
}

const wixCli = join(repositoryRoot, "node_modules", ".bin", "wix");
const tokenResult = spawnSync(wixCli, ["token", "--site", wixConfig.siteId], {
  cwd: repositoryRoot,
  encoding: "utf8",
  env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
});
if (tokenResult.status !== 0) throw new Error(`Unable to obtain a Wix token: ${tokenResult.stderr.trim()}`);
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
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} from ${path}`);
  return parsed;
}

async function queryItems(collectionId) {
  const response = await wixRequest("/wix-data/v2/items/query", {
    method: "POST",
    body: JSON.stringify({ dataCollectionId: collectionId, query: { paging: { limit: 1000, offset: 0 } } }),
  });
  return response.dataItems ?? [];
}

async function saveItem(collectionId, existing, data) {
  if (existing) {
    const response = await wixRequest("/wix-data/v2/items/update", {
      method: "POST",
      body: JSON.stringify({ dataCollectionId: collectionId, dataItem: { id: existing.id, data: { ...existing.data, ...data } } }),
    });
    return response.dataItem;
  }
  const response = await wixRequest("/wix-data/v2/items", {
    method: "POST",
    body: JSON.stringify({ dataCollectionId: collectionId, dataItem: { data } }),
  });
  return response.dataItem;
}

const sectionManifest = seedCollections.find(({ collectionId }) => collectionId === "CHPageSections");
const itemManifest = seedCollections.find(({ collectionId }) => collectionId === "CHSectionItems");
const pageManifest = seedCollections.find(({ collectionId }) => collectionId === "CHPages");
const desiredPage = pageManifest.items.find(({ key }) => key === "june");
const desiredSections = sectionManifest.items.filter(({ key }) => key.startsWith("june."));
const desiredItems = itemManifest.items.filter(({ key }) => key.startsWith("june."));

const [pages, sections, sectionItems] = await Promise.all([
  queryItems("CHPages"),
  queryItems("CHPageSections"),
  queryItems("CHSectionItems"),
]);
const junePage = pages.find((item) => item.data?.pageKey === "june");
if (!junePage?.id) throw new Error('Migration blocked: CHPages "june" was not found.');
const legacyProgramPage = pages.find((item) => item.data?.pageKey === "founders-month" && item.data?.routeKey === "month");
const sectionByKey = new Map(sections.map((item) => [item.data?.sectionKey, item]));
const itemByKey = new Map(sectionItems.map((item) => [item.data?.itemKey, item]));

const plan = {
  mode: apply ? "apply" : "dry-run",
  scope: metadataOnly ? "metadata-only" : "complete-page",
  site: "approved-staging",
  page: "june",
  pageMetadata: {
    action:
      junePage.data?.seoTitle === desiredPage.data.seoTitle && junePage.data?.seoDescription === desiredPage.data.seoDescription
        ? "unchanged"
        : "reconcile",
  },
  ...(metadataOnly ? {} : {
    sections: desiredSections.map(({ key }) => ({ key, action: sectionByKey.has(key) ? "reconcile" : "insert" })),
    sectionItems: desiredItems.map(({ key }) => ({ key, action: itemByKey.has(key) ? "reconcile" : "insert" })),
    legacyProgramPage: legacyProgramPage
      ? { pageKey: "founders-month", action: legacyProgramPage.data?.published ? "unpublish" : "unchanged" }
      : { pageKey: "founders-month", action: "not-found" },
  }),
};
console.log(JSON.stringify(plan, null, 2));
if (!apply) process.exit(0);

function resolveData(value, sectionIds) {
  if (Array.isArray(value)) return value.map((entry) => resolveData(entry, sectionIds));
  if (!value || typeof value !== "object") return value;
  if (value.$seedReference) {
    const { collectionId, key } = value.$seedReference;
    if (collectionId === "CHPages" && key === "june") return junePage.id;
    if (collectionId === "CHPageSections" && sectionIds.has(key)) return sectionIds.get(key);
    throw new Error(`Migration blocked: unexpected reference ${collectionId}:${key}.`);
  }
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, resolveData(entry, sectionIds)]),
  );
}

const sectionIds = new Map();
await saveItem("CHPages", junePage, resolveData(desiredPage.data, sectionIds));
if (metadataOnly) {
  const verifiedPages = await queryItems("CHPages");
  const verifiedJunePage = verifiedPages.find((item) => item.data?.pageKey === "june")?.data;
  const metadataMatches = verifiedJunePage?.seoTitle === desiredPage.data.seoTitle && verifiedJunePage?.seoDescription === desiredPage.data.seoDescription;
  console.log(JSON.stringify({ verification: metadataMatches ? "passed" : "failed", metadataMatches }, null, 2));
  if (!metadataMatches) throw new Error("Post-migration metadata verification failed.");
  process.exit(0);
}
for (const desired of desiredSections) {
  const saved = await saveItem(
    "CHPageSections",
    sectionByKey.get(desired.key),
    resolveData(desired.data, sectionIds),
  );
  const id = saved?.id ?? saved?.data?._id;
  if (!id) throw new Error(`Migration failed: section ${desired.key} returned no id.`);
  sectionIds.set(desired.key, id);
}

for (const desired of desiredItems) {
  await saveItem(
    "CHSectionItems",
    itemByKey.get(desired.key),
    resolveData(desired.data, sectionIds),
  );
}

if (legacyProgramPage?.data?.published) {
  await saveItem("CHPages", legacyProgramPage, { published: false });
}

const [verifiedPages, verifiedSections, verifiedItems] = await Promise.all([
  queryItems("CHPages"),
  queryItems("CHPageSections"),
  queryItems("CHSectionItems"),
]);
const verifiedSectionKeys = new Set(verifiedSections.filter((item) => item.data?.page === junePage.id && item.data?.enabled).map((item) => item.data?.sectionKey));
const verifiedItemKeys = new Set(verifiedItems.filter((item) => item.data?.published).map((item) => item.data?.itemKey));
const legacyPublished = verifiedPages.find((item) => item.data?.pageKey === "founders-month" && item.data?.routeKey === "month")?.data?.published === true;
const verifiedJunePage = verifiedPages.find((item) => item.data?.pageKey === "june")?.data;
const metadataMatches = verifiedJunePage?.seoTitle === desiredPage.data.seoTitle && verifiedJunePage?.seoDescription === desiredPage.data.seoDescription;
const missingSections = desiredSections.map(({ key }) => key).filter((key) => !verifiedSectionKeys.has(key));
const missingItems = desiredItems.map(({ key }) => key).filter((key) => !verifiedItemKeys.has(key));
const passed = metadataMatches && missingSections.length === 0 && missingItems.length === 0 && !legacyPublished;
console.log(JSON.stringify({
  verification: passed ? "passed" : "failed",
  sectionCount: desiredSections.length,
  sectionItemCount: desiredItems.length,
  metadataMatches,
  missingSections,
  missingItems,
  legacyProgramPagePublished: legacyPublished,
}, null, 2));
if (!passed) throw new Error("Post-migration verification failed.");
