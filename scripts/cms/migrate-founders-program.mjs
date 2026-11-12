import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { STAGING_SITE_ID } from "./staging-seed-data.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const apply = process.argv.includes("--apply");
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

async function updateItem(collectionId, item) {
  return wixRequest("/wix-data/v2/items/update", {
    method: "POST",
    body: JSON.stringify({
      dataCollectionId: collectionId,
      dataItem: { id: item.id, data: item.data },
    }),
  });
}

async function insertItem(collectionId, data) {
  return wixRequest("/wix-data/v2/items", {
    method: "POST",
    body: JSON.stringify({ dataCollectionId: collectionId, dataItem: { data } }),
  });
}

const eventSlugs = [
  "movie-night-2027-06",
  "hiit-workout-2027-06",
  "spanish-conversation-club-2027-06",
];
const [programs, events, navigationItems] = await Promise.all([
  queryItems("CHPrograms"),
  queryItems("CHEvents"),
  queryItems("CHNavigationItems"),
]);

const program = programs.find((item) => item.data?.slug === "founders-month");
if (!program?.id) throw new Error('Migration blocked: CHPrograms "founders-month" was not found.');

const targetEvents = eventSlugs.map((slug) => {
  const event = events.find((item) => item.data?.slug === slug);
  if (!event?.id) throw new Error(`Migration blocked: CHEvents "${slug}" was not found.`);
  if (event.data?.location !== program.data?.location) {
    throw new Error(`Migration blocked: CHEvents "${slug}" and founders-month use different locations.`);
  }
  return event;
});

const navigationKey = "header.founders-month";
const existingNavigation = navigationItems.find((item) => item.data?.itemKey === navigationKey);
const headerSortOrders = navigationItems
  .filter((item) => item.data?.area === "header")
  .map((item) => Number(item.data?.sortOrder))
  .filter(Number.isFinite);
const navigationData = {
  ...(existingNavigation?.data ?? {}),
  itemKey: navigationKey,
  area: "header",
  label: "Founders Month",
  status: "active",
  routeKey: "program",
  routeParam: "founders-month",
  published: true,
  sortOrder: existingNavigation?.data?.sortOrder ?? Math.max(0, ...headerSortOrders) + 1,
};

const plan = {
  mode: apply ? "apply" : "dry-run",
  site: "approved-staging",
  program: "founders-month",
  events: targetEvents.map((event) => ({
    slug: event.data.slug,
    action: event.data.program === program.id ? "unchanged" : "set-program-reference",
  })),
  navigation: {
    itemKey: navigationKey,
    action: existingNavigation ? "reconcile" : "insert",
    destination: "/programs/founders-month",
  },
};
console.log(JSON.stringify(plan, null, 2));
if (!apply) process.exit(0);

const changedEvents = [];
try {
  for (const event of targetEvents) {
    if (event.data.program === program.id) continue;
    const original = structuredClone(event);
    await updateItem("CHEvents", {
      ...event,
      data: { ...event.data, program: program.id },
    });
    changedEvents.push(original);
  }

  if (existingNavigation) {
    await updateItem("CHNavigationItems", {
      ...existingNavigation,
      data: navigationData,
    });
  } else {
    await insertItem("CHNavigationItems", navigationData);
  }
} catch (error) {
  const rollbackFailures = [];
  for (const event of changedEvents.reverse()) {
    try {
      await updateItem("CHEvents", event);
    } catch (rollbackError) {
      rollbackFailures.push(event.data?.slug ?? event.id);
    }
  }
  if (rollbackFailures.length > 0) {
    throw new Error(`Migration failed and rollback also failed for: ${rollbackFailures.join(", ")}.`, { cause: error });
  }
  throw new Error("Migration failed; updated event references were restored.", { cause: error });
}

const [verifiedEvents, verifiedNavigation] = await Promise.all([
  queryItems("CHEvents"),
  queryItems("CHNavigationItems"),
]);
const eventVerification = eventSlugs.map((slug) => ({
  slug,
  linked: verifiedEvents.find((item) => item.data?.slug === slug)?.data?.program === program.id,
}));
const navVerification = verifiedNavigation.find((item) => item.data?.itemKey === navigationKey)?.data;
const passed = eventVerification.every((event) => event.linked) &&
  navVerification?.routeKey === "program" &&
  navVerification?.routeParam === "founders-month" &&
  navVerification?.published === true;

console.log(JSON.stringify({
  verification: passed ? "passed" : "failed",
  events: eventVerification,
  navigation: navVerification
    ? { itemKey: navVerification.itemKey, routeKey: navVerification.routeKey, routeParam: navVerification.routeParam, published: navVerification.published }
    : null,
}, null, 2));
if (!passed) throw new Error("Post-migration verification failed.");
