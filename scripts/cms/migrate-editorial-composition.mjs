import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { editorialCompositionFields } from "./editorial-composition-schema.mjs";
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

async function readCollections() {
  const response = await wixRequest("/wix-data/v2/collections?paging.limit=1000");
  return response.collections ?? [];
}

function migrationPlan(collections) {
  return Object.fromEntries(Object.entries(editorialCompositionFields).map(([collectionId, fields]) => {
    const collection = collections.find((candidate) => candidate.id === collectionId);
    if (!collection) throw new Error(`Migration blocked: ${collectionId} does not exist.`);
    const existing = new Set(collection.fields.map((field) => field.key));
    return [collectionId, fields.filter((field) => !existing.has(field.key))];
  }));
}

const initialCollections = await readCollections();
const plan = migrationPlan(initialCollections);
console.log(JSON.stringify({
  mode: apply ? "apply" : "dry-run",
  site: "approved-staging",
  additions: Object.fromEntries(Object.entries(plan).map(([collectionId, fields]) => [
    collectionId,
    fields.map((field) => field.key),
  ])),
  dataUpdates: 0,
}, null, 2));
if (!apply) process.exit(0);

for (const [collectionId, fields] of Object.entries(plan)) {
  for (const field of fields) {
    await wixRequest("/wix-data/v2/collections/create-field", {
      method: "POST",
      body: JSON.stringify({ dataCollectionId: collectionId, field }),
    });
  }
}

const verifiedCollections = await readCollections();
const remaining = migrationPlan(verifiedCollections);
const passed = Object.values(remaining).every((fields) => fields.length === 0);
console.log(JSON.stringify({
  verification: passed ? "passed" : "failed",
  remaining: Object.fromEntries(Object.entries(remaining).map(([collectionId, fields]) => [
    collectionId,
    fields.map((field) => field.key),
  ])),
}, null, 2));
if (!passed) throw new Error("Post-migration verification failed.");
