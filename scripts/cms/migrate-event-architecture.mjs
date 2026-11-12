import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { STAGING_SITE_ID } from "./staging-seed-data.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const apply = process.argv.includes("--apply");
const wixConfig = JSON.parse(await readFile(join(repositoryRoot, "wix.config.json"), "utf8"));
if (wixConfig.siteId !== STAGING_SITE_ID) throw new Error("Migration blocked: Wix is not pointing to the approved staging site.");

const wixCli = join(repositoryRoot, "node_modules", ".bin", "wix");
const tokenResult = spawnSync(wixCli, ["token", "--site", wixConfig.siteId], {
  cwd: repositoryRoot,
  encoding: "utf8",
  env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
});
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
  if (!response.ok) {
    const error = new Error(`${response.status} ${response.statusText} from ${path}`);
    error.details = parsed;
    throw error;
  }
  return parsed;
}

async function queryItems(collectionId) {
  const response = await wixRequest("/wix-data/v2/items/query", {
    method: "POST",
    body: JSON.stringify({ dataCollectionId: collectionId, query: { paging: { limit: 1000, offset: 0 } } }),
  });
  return response.dataItems ?? [];
}

async function updateItem(collectionId, item) {
  return wixRequest("/wix-data/v2/items/update", {
    method: "POST",
    body: JSON.stringify({ dataCollectionId: collectionId, dataItem: { id: item.id, data: item.data } }),
  });
}

const collectionResponse = await wixRequest("/wix-data/v2/collections?paging.limit=1000");
const collections = collectionResponse.collections ?? [];
const programsCollection = collections.find((collection) => collection.id === "CHPrograms");
if (!programsCollection) throw new Error("Migration blocked: CHPrograms does not exist.");
const programFieldKeys = new Set(programsCollection.fields.map((field) => field.key));
const stayCampaignsCollection = collections.find((collection) => collection.id === "CHStayCampaigns");
const [programs, locations, pages, navigationItems] = await Promise.all([
  queryItems("CHPrograms"),
  queryItems("CHLocations"),
  queryItems("CHPages"),
  queryItems("CHNavigationItems"),
]);
const barcelona = locations.find((item) => item.data?.slug === "barcelona");
const junePage = pages.find((item) => item.data?.pageKey === "june");
if (!barcelona?.id || !junePage?.id) throw new Error("Migration blocked: Barcelona or the June page is missing.");

const plan = {
  mode: apply ? "apply" : "dry-run",
  site: "approved-staging",
  schema: {
    CHPrograms: ["locationScope", "locations"].filter((field) => !programFieldKeys.has(field)),
    CHStayCampaigns: stayCampaignsCollection ? "unchanged" : "create",
  },
  programs: programs.map((program) => ({ slug: program.data?.slug, locationScope: "selected", location: program.data?.location })),
  campaign: "barcelona-2027-06",
  navigation: navigationItems.filter((item) => item.data?.routeKey === "month").map((item) => ({ itemKey: item.data?.itemKey, action: "hide-legacy-month-link" })),
};
console.log(JSON.stringify(plan, null, 2));
if (!apply) process.exit(0);

async function createField(field) {
  return wixRequest("/wix-data/v2/collections/create-field", {
    method: "POST",
    body: JSON.stringify({ dataCollectionId: "CHPrograms", field }),
  });
}

if (!programFieldKeys.has("locationScope")) {
  await createField({ key: "locationScope", displayName: "Location Scope", type: "TEXT" });
}
if (!programFieldKeys.has("locations")) {
  await createField({
    key: "locations",
    displayName: "Locations",
    type: "MULTI_REFERENCE",
    typeMetadata: {
      multiReference: {
        referencedCollectionId: "CHLocations",
        referencingFieldKey: "programs",
        referencingDisplayName: "Programs",
      },
    },
  });
}

if (!stayCampaignsCollection) {
  await wixRequest("/wix-data/v2/collections", {
    method: "POST",
    body: JSON.stringify({
      collection: {
        id: "CHStayCampaigns",
        displayName: "Stay Campaigns",
        displayField: "name",
        fields: [
          { key: "campaignKey", displayName: "Campaign Key", type: "TEXT" },
          { key: "name", displayName: "Name", type: "TEXT" },
          { key: "period", displayName: "Period", type: "TEXT" },
          { key: "legacyRouteParam", displayName: "Legacy Route Param", type: "TEXT" },
          { key: "location", displayName: "Location", type: "REFERENCE", typeMetadata: { reference: { referencedCollectionId: "CHLocations" } } },
          { key: "page", displayName: "Page", type: "REFERENCE", typeMetadata: { reference: { referencedCollectionId: "CHPages" } } },
          { key: "published", displayName: "Published", type: "BOOLEAN", typeMetadata: { boolean: { defaultValue: false } } },
          { key: "sortOrder", displayName: "Sort Order", type: "NUMBER" },
        ],
        permissions: { read: "ANYONE", insert: "ADMIN", update: "ADMIN", remove: "ADMIN" },
      },
    }),
  });
}

for (const program of programs) {
  if (!program.id || !program.data?.location) throw new Error(`Program ${program.data?.slug ?? "unknown"} has no location.`);
  if (program.data.locationScope !== "selected") {
    await updateItem("CHPrograms", { ...program, data: { ...program.data, locationScope: "selected" } });
  }
}

await wixRequest("/wix-data/v2/bulk/items/insert-references", {
  method: "POST",
  body: JSON.stringify({
    dataCollectionId: "CHPrograms",
    dataItemReferences: programs.map((program) => ({
      referringItemFieldName: "locations",
      referringItemId: program.id,
      referencedItemId: program.data.location,
    })),
  }),
});

const existingCampaigns = await queryItems("CHStayCampaigns");
const campaignPairs = new Set();
const campaignKeys = new Set();
const legacyRouteParams = new Set();
for (const campaign of existingCampaigns) {
  const pair = `${campaign.data?.location ?? ""}:${campaign.data?.period ?? ""}`;
  if (campaignPairs.has(pair)) throw new Error(`Duplicate CHStayCampaigns location/period pair: ${pair}.`);
  campaignPairs.add(pair);
  if (campaignKeys.has(campaign.data?.campaignKey)) throw new Error(`Duplicate CHStayCampaigns campaignKey: ${campaign.data?.campaignKey}.`);
  campaignKeys.add(campaign.data?.campaignKey);
  if (campaign.data?.legacyRouteParam) {
    if (legacyRouteParams.has(campaign.data.legacyRouteParam)) throw new Error(`Duplicate CHStayCampaigns legacyRouteParam: ${campaign.data.legacyRouteParam}.`);
    legacyRouteParams.add(campaign.data.legacyRouteParam);
  }
}
if (!existingCampaigns.some((item) => item.data?.campaignKey === "barcelona-2027-06")) {
  await wixRequest("/wix-data/v2/items", {
    method: "POST",
    body: JSON.stringify({
      dataCollectionId: "CHStayCampaigns",
      dataItem: { data: {
        campaignKey: "barcelona-2027-06",
        name: "June at Circles House Barcelona",
        period: "2027-06",
        legacyRouteParam: "june",
        location: barcelona.id,
        page: junePage.id,
        published: true,
        sortOrder: 1,
      } },
    }),
  });
}

for (const item of navigationItems.filter((candidate) => candidate.data?.routeKey === "month" && candidate.data?.status !== "hidden")) {
  await updateItem("CHNavigationItems", { ...item, data: { ...item.data, status: "hidden" } });
}

const [verifiedCollections, verifiedPrograms, verifiedCampaigns] = await Promise.all([
  wixRequest("/wix-data/v2/collections?paging.limit=1000"),
  queryItems("CHPrograms"),
  queryItems("CHStayCampaigns"),
]);
const verifiedProgramSchema = verifiedCollections.collections.find((collection) => collection.id === "CHPrograms");
const verifiedCampaignSchema = verifiedCollections.collections.find((collection) => collection.id === "CHStayCampaigns");
const passed = ["locationScope", "locations"].every((key) => verifiedProgramSchema?.fields.some((field) => field.key === key)) &&
  Boolean(verifiedCampaignSchema) &&
  verifiedPrograms.every((program) => program.data?.locationScope === "selected") &&
  verifiedCampaigns.some((campaign) => campaign.data?.campaignKey === "barcelona-2027-06");
console.log(JSON.stringify({ verification: passed ? "passed" : "failed", collectionCount: verifiedCollections.collections.length }, null, 2));
if (!passed) throw new Error("Post-migration verification failed.");
