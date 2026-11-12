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

async function queryNavigation() {
  const response = await wixRequest("/wix-data/v2/items/query", {
    method: "POST",
    body: JSON.stringify({ dataCollectionId: "CHNavigationItems", query: { paging: { limit: 1000, offset: 0 } } }),
  });
  return response.dataItems ?? [];
}

async function save(item, data) {
  const path = item ? "/wix-data/v2/items/update" : "/wix-data/v2/items";
  return wixRequest(path, {
    method: "POST",
    body: JSON.stringify({
      dataCollectionId: "CHNavigationItems",
      dataItem: item ? { id: item.id, data } : { data },
    }),
  });
}

const desired = [
  { itemKey: "header.events.all", label: "All events", routeKey: "events", sortOrder: 1 },
  { itemKey: "header.events.barcelona", label: "Barcelona", routeKey: "events", routeParam: "barcelona", sortOrder: 2 },
  { itemKey: "header.month.june", label: "June", routeKey: "month", routeParam: "june", sortOrder: 3 },
  { itemKey: "header.founders-month", label: "Founders Month", routeKey: "program", routeParam: "founders-month", sortOrder: 4 },
].map((item) => ({
  ...item,
  area: "header",
  parentKey: "header.events",
  status: "active",
  published: true,
}));

const before = await queryNavigation();
const root = before.find((item) => item.data?.itemKey === "header.events");
if (!root?.id) throw new Error('Migration blocked: root navigation item "header.events" was not found.');

const plan = desired.map((data) => {
  const existing = before.find((item) => item.data?.itemKey === data.itemKey);
  return { itemKey: data.itemKey, action: existing ? "reconcile" : "insert", parentKey: data.parentKey, routeKey: data.routeKey, routeParam: data.routeParam };
});
console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", site: "approved-staging", navigation: plan }, null, 2));
if (!apply) process.exit(0);

for (const data of desired) {
  const existing = before.find((item) => item.data?.itemKey === data.itemKey);
  await save(existing, { ...(existing?.data ?? {}), ...data });
}

const after = await queryNavigation();
const verification = desired.map((expected) => {
  const actual = after.find((item) => item.data?.itemKey === expected.itemKey)?.data;
  return {
    itemKey: expected.itemKey,
    passed: Boolean(actual) && actual.parentKey === expected.parentKey && actual.routeKey === expected.routeKey && actual.routeParam === expected.routeParam,
  };
});
console.log(JSON.stringify({ verification: verification.every((item) => item.passed) ? "passed" : "failed", items: verification }, null, 2));
if (verification.some((item) => !item.passed)) throw new Error("Post-migration verification failed.");
