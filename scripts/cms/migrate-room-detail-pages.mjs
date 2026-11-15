import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { roomDetailFields, roomDetailPilot } from "./room-detail-schema.mjs";
import { STAGING_SITE_ID } from "./staging-seed-data.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const apply = process.argv.includes("--apply");
const wixConfig = JSON.parse(await readFile(join(repositoryRoot, "wix.config.json"), "utf8"));
if (wixConfig.siteId !== STAGING_SITE_ID) {
  throw new Error("Migration blocked: Wix is not pointing to the approved staging site.");
}

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
    body: JSON.stringify({
      dataCollectionId: collectionId,
      query: { paging: { limit: 1000, offset: 0 } },
    }),
  });
  return response.dataItems ?? [];
}

async function readState() {
  const [collectionResponse, rooms, locations, pageSections] = await Promise.all([
    wixRequest("/wix-data/v2/collections?paging.limit=1000"),
    queryItems("CHRooms"),
    queryItems("CHLocations"),
    queryItems("CHPageSections"),
  ]);
  const collections = collectionResponse.collections ?? [];
  const collection = collections.find((candidate) => candidate.id === "CHRooms");
  const sectionCollection = collections.find((candidate) => candidate.id === "CHPageSections");
  if (!collection) throw new Error("Migration blocked: CHRooms does not exist.");
  if (!sectionCollection) throw new Error("Migration blocked: CHPageSections does not exist.");
  const location = locations.find((candidate) => candidate.data?.slug === roomDetailPilot.location);
  const room = rooms.find((candidate) => candidate.data?.slug === roomDetailPilot.slug);
  if (!location?.id || !room?.id || room.data?.location !== location.id) {
    throw new Error("Migration blocked: the P2 pilot room or its Barcelona relationship is missing.");
  }
  const roomSections = pageSections.filter((section) => section.data?.componentKey === "location.rooms");
  if (roomSections.length === 0) {
    throw new Error("Migration blocked: no location.rooms Sections exist.");
  }
  if (roomSections.some((section) => !section.id || !section.data?.sectionKey)) {
    throw new Error("Migration blocked: a location.rooms Section has no id or sectionKey.");
  }
  return { collection, sectionCollection, rooms, room, roomSections };
}

function validateDiscoverableRooms(rooms) {
  const discoverable = rooms.filter((room) => room.data?.discoverable === true);
  const routes = discoverable.map((room) => `${room.data?.location ?? ""}:${room.data?.slug ?? ""}`);
  const complete = discoverable.every((room) =>
    room.data?.published === true && room.data?.location && room.data?.slug && room.data?.name && room.data?.description && room.data?.bookingUrl);
  return {
    passed: complete && new Set(routes).size === routes.length,
    routes,
  };
}

const initial = await readState();
const existingFields = new Set(initial.collection.fields.map((field) => field.key));
const missingFields = roomDetailFields.filter((field) => !existingFields.has(field.key));
const sectionFields = new Set(initial.sectionCollection.fields.map((field) => field.key));
const missingPrerequisites = ["sourceMode", "sourceKey"].filter((field) => !sectionFields.has(field));
const sectionUpdates = initial.roomSections
  .filter((section) => section.data?.sourceMode !== "automatic" || section.data?.sourceKey !== "location.rooms")
  .map((section) => ({ sectionKey: section.data?.sectionKey, sourceMode: "automatic", sourceKey: "location.rooms" }));
console.log(JSON.stringify({
  mode: apply ? "apply" : "dry-run",
  site: "approved-staging",
  schema: { CHRooms: missingFields.map((field) => field.key) },
  prerequisites: missingPrerequisites.length === 0
    ? "editorial-composition-ready"
    : { missingCHPageSectionsFields: missingPrerequisites },
  updates: {
    rooms: initial.room.data?.discoverable === true ? [] : [{ ...roomDetailPilot, discoverable: true }],
    sections: sectionUpdates,
  },
  index: "not-created-global-quota-full",
}, null, 2));
if (!apply) process.exit(0);
if (missingPrerequisites.length > 0) {
  throw new Error("Migration blocked: apply cms:migrate:editorial-composition before P2.");
}

for (const field of missingFields) {
  await wixRequest("/wix-data/v2/collections/create-field", {
    method: "POST",
    body: JSON.stringify({ dataCollectionId: "CHRooms", field }),
  });
}
if (initial.room.data?.discoverable !== true) {
  await wixRequest("/wix-data/v2/items/update", {
    method: "POST",
    body: JSON.stringify({
      dataCollectionId: "CHRooms",
      dataItem: {
        id: initial.room.id,
        data: { ...initial.room.data, discoverable: true },
      },
    }),
  });
}
for (const sectionUpdate of sectionUpdates) {
  const section = initial.roomSections.find((candidate) => candidate.data?.sectionKey === sectionUpdate.sectionKey);
  await wixRequest("/wix-data/v2/items/update", {
    method: "POST",
    body: JSON.stringify({
      dataCollectionId: "CHPageSections",
      dataItem: {
        id: section.id,
        data: { ...section.data, sourceMode: "automatic", sourceKey: "location.rooms" },
      },
    }),
  });
}

const verified = await readState();
const validation = validateDiscoverableRooms(verified.rooms);
const schemaPassed = roomDetailFields.every((field) =>
  verified.collection.fields.some((candidate) => candidate.key === field.key));
const pilotPassed = verified.room.data?.discoverable === true;
const sectionsPassed = verified.roomSections.every((section) =>
  section.data?.sourceMode === "automatic" && section.data?.sourceKey === "location.rooms");
const passed = schemaPassed && pilotPassed && sectionsPassed && validation.passed;
console.log(JSON.stringify({
  verification: passed ? "passed" : "failed",
  discoverableRoutes: validation.routes,
  automaticRoomSections: verified.roomSections.map((section) => section.data?.sectionKey),
}, null, 2));
if (!passed) throw new Error("Post-migration verification failed.");
