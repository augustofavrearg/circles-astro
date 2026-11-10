import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  STAGING_SITE_ID,
  multiReferenceTargets,
  seedCollections,
} from "./cms/staging-seed-data.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apply = process.argv.includes("--apply");
const wixConfig = JSON.parse(
  await readFile(join(repositoryRoot, "wix.config.json"), "utf8"),
);

if (wixConfig.siteId !== STAGING_SITE_ID) {
  throw new Error(
    `Seed blocked: wix.config.json points to ${wixConfig.siteId}, not the approved staging site ${STAGING_SITE_ID}.`,
  );
}

const planSummary = seedCollections.map(({ collectionId, items }) => ({
  collectionId,
  itemCount: items.length,
  editorialStatuses: Object.fromEntries(
    Map.groupBy(items, (item) => item.editorialStatus ?? "unclassified")
      .entries()
      .map(([status, statusItems]) => [status, statusItems.length]),
  ),
}));
const plannedItemCount = planSummary.reduce(
  (total, collection) => total + collection.itemCount,
  0,
);

if (!apply) {
  console.log(
    JSON.stringify(
      {
        mode: "dry-run",
        siteId: wixConfig.siteId,
        collectionCount: planSummary.length,
        plannedItemCount,
        collections: planSummary,
        warning:
          "This seed is additive by default. Existing keys are skipped unless the manifest marks the record for scoped reconciliation. Provisional editorial data must be reviewed before production.",
        next:
          "Create and review a live create/update plan before running `npm run cms:seed:staging`.",
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const wixCli = join(repositoryRoot, "node_modules", ".bin", "wix");
const tokenResult = spawnSync(wixCli, ["token", "--site", wixConfig.siteId], {
  cwd: repositoryRoot,
  encoding: "utf8",
  env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
});

if (tokenResult.status !== 0) {
  throw new Error(
    `Unable to obtain a site-scoped Wix token: ${tokenResult.stderr.trim()}`,
  );
}

const token = tokenResult.stdout.trim();
if (!token) throw new Error("The Wix CLI returned an empty access token.");

async function wixRequest(path, init = {}, retried = false) {
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
  let parsedBody;
  try {
    parsedBody = body ? JSON.parse(body) : {};
  } catch {
    parsedBody = { raw: body };
  }

  if (!response.ok) {
    const transient =
      response.status >= 500 ||
      response.status === 403 ||
      JSON.stringify(parsedBody).includes("WDE0117");
    if (transient && !retried) {
      await new Promise((done) => setTimeout(done, 3000));
      return wixRequest(path, init, true);
    }
    const error = new Error(`${response.status} ${response.statusText} from ${path}`);
    error.details = parsedBody;
    throw error;
  }
  return parsedBody;
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

async function validateCollections() {
  const response = await wixRequest(
    "/wix-data/v2/collections?paging.limit=1000",
  );
  const available = new Set(
    (response.collections ?? []).map((collection) => collection.id),
  );
  const missing = seedCollections
    .map(({ collectionId }) => collectionId)
    .filter((collectionId) => !available.has(collectionId));
  if (missing.length > 0) {
    throw new Error(`Seed blocked: missing collections: ${missing.join(", ")}.`);
  }
}

const itemIds = new Map();
const results = [];

function itemMapKey(collectionId, key) {
  return `${collectionId}:${key}`;
}

function compact(value) {
  if (Array.isArray(value)) return value.map(compact);
  if (!value || typeof value !== "object") return value;
  if (value.$seedReference) {
    const { collectionId, key } = value.$seedReference;
    const id = itemIds.get(itemMapKey(collectionId, key));
    if (!id) {
      throw new Error(`Unresolved seed reference ${collectionId}:${key}.`);
    }
    return id;
  }
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, compact(entry)]),
  );
}

await validateCollections();

for (const collection of seedCollections) {
  const existing = await queryItems(collection.collectionId);
  const existingByKey = new Map(
    existing.map((item) => [String(item.data?.[collection.keyField]), item]),
  );
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of collection.items) {
    const existingItem = existingByKey.get(item.key);
    if (existingItem) {
      const existingId = existingItem.id ?? existingItem.data?._id;
      if (!existingId) {
        throw new Error(
          `${collection.collectionId}:${item.key} exists without an item id.`,
        );
      }
      itemIds.set(itemMapKey(collection.collectionId, item.key), existingId);
      if (item.reconcile) {
        await wixRequest("/wix-data/v2/items/update", {
          method: "POST",
          body: JSON.stringify({
            dataCollectionId: collection.collectionId,
            dataItem: { id: existingId, data: compact(item.data) },
          }),
        });
        updated += 1;
        continue;
      }
      skipped += 1;
      continue;
    }

    const response = await wixRequest("/wix-data/v2/items", {
      method: "POST",
      body: JSON.stringify({
        dataCollectionId: collection.collectionId,
        dataItem: { data: compact(item.data) },
      }),
    });
    const inserted = response.dataItem;
    const insertedId = inserted?.id ?? inserted?.data?._id;
    if (!insertedId) {
      throw new Error(
        `Insert ${collection.collectionId}:${item.key} returned no item id.`,
      );
    }
    itemIds.set(itemMapKey(collection.collectionId, item.key), insertedId);
    created += 1;
  }
  results.push({ collectionId: collection.collectionId, created, updated, skipped });
}

const referenceRequests = [];
for (const collection of seedCollections) {
  const fieldTargets = multiReferenceTargets[collection.collectionId];
  if (!fieldTargets) continue;
  for (const item of collection.items) {
    for (const [field, targetKeys] of Object.entries(
      item.multiReferences ?? {},
    )) {
      const target = fieldTargets[field];
      if (!target) {
        throw new Error(
          `No multi-reference target configured for ${collection.collectionId}.${field}.`,
        );
      }
      const referringItemId = itemIds.get(
        itemMapKey(collection.collectionId, item.key),
      );
      for (const targetKey of targetKeys) {
        const referencedItemId = itemIds.get(
          itemMapKey(target.collectionId, targetKey),
        );
        if (!referringItemId || !referencedItemId) {
          throw new Error(
            `Unresolved multi-reference ${collection.collectionId}:${item.key}.${field} -> ${target.collectionId}:${targetKey}.`,
          );
        }
        referenceRequests.push({
          collectionId: collection.collectionId,
          referringItemFieldName: field,
          referringItemId,
          referencedItemId,
        });
      }
    }
  }
}

for (const [collectionId, requests] of Map.groupBy(
  referenceRequests,
  (request) => request.collectionId,
)) {
  const response = await wixRequest(
    "/wix-data/v2/bulk/items/insert-references",
    {
      method: "POST",
      body: JSON.stringify({
        dataCollectionId: collectionId,
        dataItemReferences: requests.map(({ collectionId: _, ...request }) =>
          request,
        ),
      }),
    },
  );
  const failures = (response.results ?? []).filter(
    (result) => result.error && result.error.status !== "ALREADY_EXISTS",
  );
  if (failures.length > 0) {
    const error = new Error(
      `Some multi-references failed for ${collectionId}.`,
    );
    error.details = failures;
    throw error;
  }
}

const verification = [];
for (const collection of seedCollections) {
  const items = await queryItems(collection.collectionId);
  const keys = new Set(
    items.map((item) => String(item.data?.[collection.keyField])),
  );
  const missing = collection.items
    .map((item) => item.key)
    .filter((key) => !keys.has(key));
  verification.push({
    collectionId: collection.collectionId,
    expectedSeedItems: collection.items.length,
    actualItems: items.length,
    missing,
  });
}

const failedVerification = verification.filter(
  (collection) => collection.missing.length > 0,
);
if (failedVerification.length > 0) {
  const error = new Error("Seed verification failed.");
  error.details = failedVerification;
  throw error;
}

console.log(
  JSON.stringify(
    {
      mode: "applied",
      siteId: wixConfig.siteId,
      plannedItemCount,
      createdItemCount: results.reduce((sum, result) => sum + result.created, 0),
      updatedItemCount: results.reduce((sum, result) => sum + result.updated, 0),
      skippedItemCount: results.reduce((sum, result) => sum + result.skipped, 0),
      multiReferenceCount: referenceRequests.length,
      collections: results,
      verification,
    },
    null,
    2,
  ),
);
