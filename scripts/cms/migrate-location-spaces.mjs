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
  let parsed;
  try {
    parsed = body ? JSON.parse(body) : {};
  } catch {
    parsed = { raw: body };
  }
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

async function updateItem(collectionId, item, patch) {
  return wixRequest("/wix-data/v2/items/update", {
    method: "POST",
    body: JSON.stringify({ dataCollectionId: collectionId, dataItem: { id: item.id, data: { ...item.data, ...patch } } }),
  });
}

const fieldDefinitions = [
  { key: "routeSlug", displayName: "Route Slug", type: "TEXT" },
  { key: "discoverable", displayName: "Discoverable", type: "BOOLEAN", typeMetadata: { boolean: { defaultValue: false } } },
  { key: "page", displayName: "Page", type: "REFERENCE", typeMetadata: { reference: { referencedCollectionId: "CHPages" } } },
  { key: "hours", displayName: "Hours", type: "TEXT" },
  { key: "ctaLabel", displayName: "CTA Label", type: "TEXT" },
  { key: "externalUrl", displayName: "External URL", type: "URL" },
];
const publicSpaces = new Map([
  ["andorra-restaurant", { routeSlug: "restaurant", discoverable: true }],
  ["andorra-spa", { routeSlug: "spa", discoverable: true }],
  ["barcelona-rooftop", { routeSlug: "rooftop", discoverable: true }],
]);

const collectionResponse = await wixRequest("/wix-data/v2/collections?paging.limit=1000");
const spacesCollection = (collectionResponse.collections ?? []).find((collection) => collection.id === "CHSpaces");
if (!spacesCollection) throw new Error("Migration blocked: CHSpaces does not exist.");
const existingFields = new Set(spacesCollection.fields.map((field) => field.key));
const [spaces, locations] = await Promise.all([queryItems("CHSpaces"), queryItems("CHLocations")]);
const locationIds = new Set(locations.map((location) => location.id));
for (const slug of publicSpaces.keys()) {
  const space = spaces.find((candidate) => candidate.data?.slug === slug);
  if (!space?.id || !locationIds.has(space.data?.location)) throw new Error(`Migration blocked: ${slug} or its CHLocations reference is missing.`);
}

const plannedRoutes = spaces.flatMap((space) => {
  const patch = publicSpaces.get(space.data?.slug);
  const discoverable = patch?.discoverable ?? space.data?.discoverable;
  const routeSlug = patch?.routeSlug ?? space.data?.routeSlug;
  return discoverable ? [`${space.data?.location ?? ""}:${routeSlug ?? ""}`] : [];
});
if (plannedRoutes.some((route) => route.endsWith(":") || !/^[^:]+:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(route)) || new Set(plannedRoutes).size !== plannedRoutes.length) {
  throw new Error("Migration blocked: discoverable CHSpaces routes are incomplete or duplicated.");
}

console.log(JSON.stringify({
  mode: apply ? "apply" : "dry-run",
  site: "approved-staging",
  schema: { CHSpaces: fieldDefinitions.filter((field) => !existingFields.has(field.key)).map((field) => field.key) },
  updates: [...publicSpaces].map(([slug, patch]) => ({ slug, ...patch })),
  index: "not-created-global-quota-full",
}, null, 2));
if (!apply) process.exit(0);

for (const field of fieldDefinitions.filter((candidate) => !existingFields.has(candidate.key))) {
  await wixRequest("/wix-data/v2/collections/create-field", {
    method: "POST",
    body: JSON.stringify({ dataCollectionId: "CHSpaces", field }),
  });
}
for (const [slug, patch] of publicSpaces) {
  const space = spaces.find((candidate) => candidate.data?.slug === slug);
  if (space.data?.routeSlug !== patch.routeSlug || space.data?.discoverable !== true) {
    await updateItem("CHSpaces", space, patch);
  }
}

const [verifiedCollections, verifiedSpaces] = await Promise.all([
  wixRequest("/wix-data/v2/collections?paging.limit=1000"),
  queryItems("CHSpaces"),
]);
const verifiedSchema = verifiedCollections.collections.find((collection) => collection.id === "CHSpaces");
const schemaPassed = fieldDefinitions.every((field) => verifiedSchema?.fields.some((candidate) => candidate.key === field.key));
const verifiedRoutes = verifiedSpaces.filter((space) => space.data?.discoverable === true).map((space) => `${space.data?.location ?? ""}:${space.data?.routeSlug ?? ""}`);
const dataPassed = [...publicSpaces].every(([slug, patch]) => verifiedSpaces.some((space) =>
  space.data?.slug === slug && space.data?.routeSlug === patch.routeSlug && space.data?.discoverable === true));
const uniquenessPassed = verifiedRoutes.every((route) => !route.endsWith(":")) && new Set(verifiedRoutes).size === verifiedRoutes.length;
const passed = schemaPassed && dataPassed && uniquenessPassed;
console.log(JSON.stringify({ verification: passed ? "passed" : "failed", manualFieldCount: verifiedSchema?.fields.filter((field) => !field.key.startsWith("_") && !field.key.includes("_")).length, discoverableRoutes: verifiedRoutes }, null, 2));
if (!passed) throw new Error("Post-migration verification failed.");
