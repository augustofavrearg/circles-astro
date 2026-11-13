import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const wixConfig = JSON.parse(
  await readFile(join(repositoryRoot, "wix.config.json"), "utf8"),
);
const wixCli = join(repositoryRoot, "node_modules", ".bin", "wix");

const providedToken = process.env.WIX_ACCESS_TOKEN?.trim();
const tokenResult = providedToken
  ? undefined
  : spawnSync(wixCli, ["token", "--site", wixConfig.siteId], {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
    });

if (tokenResult?.error) {
  throw new Error(
    `Unable to start the Wix CLI to obtain a site-scoped token: ${tokenResult.error.message}`,
  );
}

if (tokenResult && tokenResult.status !== 0) {
  throw new Error(
    `Unable to obtain a site-scoped Wix token: ${tokenResult.stderr.trim()}`,
  );
}

const token = providedToken || tokenResult?.stdout.trim();
if (!token) throw new Error("The Wix CLI returned an empty access token.");

async function wixRequest(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token,
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
    const error = new Error(
      `${response.status} ${response.statusText} from ${url}`,
    );
    error.status = response.status;
    error.details = parsedBody;
    throw error;
  }
  return parsedBody;
}

async function optionalRequest(url, init) {
  try {
    return { ok: true, data: await wixRequest(url, init) };
  } catch (error) {
    return {
      ok: false,
      status: error.status,
      error: error.details ?? error.message,
    };
  }
}

const collectionResponse = await wixRequest(
  "https://www.wixapis.com/wix-data/v2/collections?paging.limit=1000",
);
const allCollections = collectionResponse.collections ?? [];

if (process.env.CMS_AUDIT_LIST === "1") {
  console.log(
    JSON.stringify(
      allCollections.map(({ id, displayName, collectionType }) => ({
        id,
        displayName,
        collectionType,
      })),
      null,
      2,
    ),
  );
  process.exit(0);
}

const collectionFilter = process.env.CMS_AUDIT_COLLECTION?.trim();
const includeItems = process.env.CMS_AUDIT_ITEMS === "1";
const includedReferenceFields = (process.env.CMS_AUDIT_INCLUDE_REFERENCES ?? "")
  .split(",")
  .map((field) => field.trim())
  .filter(Boolean);
const exactIdMatches = collectionFilter
  ? allCollections.filter((collection) => collection.id === collectionFilter)
  : [];
const normalizedFilter = collectionFilter?.toLowerCase();
const collections = collectionFilter
  ? exactIdMatches.length > 0
    ? exactIdMatches
    : allCollections.filter(
        (collection) =>
          collection.id.toLowerCase() === normalizedFilter ||
          collection.displayName.toLowerCase() === normalizedFilter,
      )
  : allCollections;
const audit = [];

for (const collection of collections) {
  const collectionId = collection.id;
  const encodedId = encodeURIComponent(collectionId);
  const includeHealthItems = process.env.CMS_AUDIT_HEALTH === "1" && ["CHStayCampaigns", "CHSpaces"].includes(collectionId);
  const [permissions, indexes, itemQuery] = await Promise.all([
    optionalRequest(
      `https://www.wixapis.com/wix-data/v1/permissions?data_collection_id=${encodedId}`,
    ),
    optionalRequest(
      `https://www.wixapis.com/wix-data/v2/indexes?dataCollectionId=${encodedId}`,
    ),
    optionalRequest("https://www.wixapis.com/wix-data/v2/items/query", {
      method: "POST",
      body: JSON.stringify({
        dataCollectionId: collectionId,
        query: { paging: { limit: includeItems || includeHealthItems ? 100 : 1, offset: 0 } },
        includeReferencedItems: includedReferenceFields,
        returnTotalCount: true,
      }),
    }),
  ]);

  const itemData = itemQuery.ok ? itemQuery.data : undefined;
  audit.push({
    id: collectionId,
    displayName: collection.displayName,
    collectionType: collection.collectionType,
    displayField: collection.displayField,
    fields: (collection.fields ?? []).map((field) => ({
      key: field.key,
      displayName: field.displayName,
      type: field.type,
      typeMetadata: field.typeMetadata,
    })),
    plugins: collection.plugins ?? [],
    capabilities: collection.capabilities,
    permissions: permissions.ok ? permissions.data.dataPermissions : permissions,
    indexes: indexes.ok ? indexes.data.indexes ?? [] : indexes,
    itemCount:
      itemData?.pagingMetadata?.total ??
      itemData?.pagingMetadata?.count ??
      itemData?.totalCount ??
      null,
    items: includeItems || includeHealthItems
      ? (itemData?.dataItems ?? []).map((item) => item.data ?? item)
      : undefined,
    itemQueryError: itemQuery.ok ? undefined : itemQuery,
  });
}

if (process.env.CMS_AUDIT_SUMMARY === "1") {
  console.log(
    JSON.stringify(
      {
        auditedAt: new Date().toISOString(),
        collectionCount: audit.length,
        collections: audit.map((collection) => {
          const customFields = collection.fields.filter(
            (field) => !field.key.startsWith("_"),
          );
          return {
            id: collection.id,
            displayName: collection.displayName,
            displayField: collection.displayField,
            manualFields: customFields
              .filter((field) => !field.key.includes("_"))
              .map(({ key, type }) => ({ key, type })),
            generatedRelationFields: customFields
              .filter((field) => field.key.includes("_"))
              .map(({ key, type, typeMetadata }) => ({
                key,
                type,
                typeMetadata,
              })),
            permissions: collection.permissions,
            userIndexes: Array.isArray(collection.indexes)
              ? collection.indexes
                  .filter((index) => index.source === "USER")
                  .map(({ name, fields, status, unique }) => ({
                    name,
                    fields,
                    status,
                    unique,
                  }))
              : collection.indexes,
            itemCount: collection.itemCount,
          };
        }),
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (process.env.CMS_AUDIT_HEALTH === "1") {
  const expectedCollections = {
    CHSiteSettings: [15, "siteName"],
    CHInterfaceCopy: [4, "copyKey"],
    CHPages: [9, "pageKey"],
    CHAmenities: [7, "amenityKey"],
    CHLocations: [21, "name"],
    CHPeople: [10, "name"],
    CHPrograms: [12, "name"],
    CHStayCampaigns: [8, "name"],
    CHPageSections: [25, "sectionKey"],
    CHSectionItems: [20, "itemKey"],
    CHSocialLinks: [6, "label"],
    CHNavigationItems: [15, "label"],
    CHSpaces: [23, "title"],
    CHRooms: [17, "name"],
    CHEvents: [19, "title"],
    CHNewsArticles: [15, "title"],
    CHDeals: [13, "title"],
    CHTestimonials: [10, "authorName"],
    CHPartners: [8, "name"],
    CHFaqs: [7, "question"],
    CHMembershipPlans: [11, "label"],
    CHLegalPages: [9, "title"],
  };
  const expectedIds = new Set(Object.keys(expectedCollections));
  const customCollections = audit.filter(
    (collection) => collection.collectionType === "NATIVE",
  );
  const byId = new Map(customCollections.map((collection) => [collection.id, collection]));
  const missingCollections = [...expectedIds].filter((id) => !byId.has(id));
  const unexpectedCollections = customCollections
    .filter((collection) => !expectedIds.has(collection.id))
    .map(({ id, displayName, itemCount }) => ({ id, displayName, itemCount }));
  const issues = [];
  const generatedRelationFields = [];
  let manualFieldCount = 0;
  let userIndexCount = 0;
  let itemCount = 0;
  const nonEmptyCollections = [];

  const stayCampaignItems = byId.get("CHStayCampaigns")?.items ?? [];
  const stayCampaignPairs = stayCampaignItems.map((item) => `${item.location ?? ""}:${item.period ?? ""}`);
  if (new Set(stayCampaignPairs).size !== stayCampaignPairs.length) {
    issues.push({ collectionId: "CHStayCampaigns", issue: "duplicate-location-period" });
  }
  const campaignKeys = stayCampaignItems.map((item) => item.campaignKey);
  if (new Set(campaignKeys).size !== campaignKeys.length) {
    issues.push({ collectionId: "CHStayCampaigns", issue: "duplicate-campaign-key" });
  }
  const legacyRouteParams = stayCampaignItems.map((item) => item.legacyRouteParam).filter(Boolean);
  if (new Set(legacyRouteParams).size !== legacyRouteParams.length) {
    issues.push({ collectionId: "CHStayCampaigns", issue: "duplicate-legacy-route-param" });
  }
  if (stayCampaignItems.some((item) => !/^\d{4}-(0[1-9]|1[0-2])$/.test(item.period ?? ""))) {
    issues.push({ collectionId: "CHStayCampaigns", issue: "invalid-period" });
  }
  const discoverableSpaces = (byId.get("CHSpaces")?.items ?? []).filter((item) => item.discoverable === true);
  const spaceRoutes = discoverableSpaces.map((item) => `${item.location ?? ""}:${item.routeSlug ?? ""}`);
  if (discoverableSpaces.some((item) => !item.location || !item.routeSlug)) {
    issues.push({ collectionId: "CHSpaces", issue: "discoverable-space-missing-location-or-route-slug" });
  }
  if (discoverableSpaces.some((item) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.routeSlug ?? ""))) {
    issues.push({ collectionId: "CHSpaces", issue: "invalid-route-slug" });
  }
  if (new Set(spaceRoutes).size !== spaceRoutes.length) {
    issues.push({ collectionId: "CHSpaces", issue: "duplicate-location-route-slug" });
  }
  if (discoverableSpaces.some((item) => String(item.status ?? "").toLowerCase() === "hidden")) {
    issues.push({ collectionId: "CHSpaces", issue: "discoverable-space-is-hidden" });
  }

  for (const [id, [expectedFieldCount, expectedDisplayField]] of Object.entries(
    expectedCollections,
  )) {
    const collection = byId.get(id);
    if (!collection) continue;
    const collectionItemCount = Number(collection.itemCount ?? 0);
    itemCount += collectionItemCount;
    if (collectionItemCount > 0) {
      nonEmptyCollections.push({ collectionId: id, itemCount: collectionItemCount });
    }
    const customFields = collection.fields.filter(
      (field) => !field.key.startsWith("_"),
    );
    const manualFields = customFields.filter((field) => !field.key.includes("_"));
    const generatedFields = customFields.filter((field) => field.key.includes("_"));
    manualFieldCount += manualFields.length;
    generatedRelationFields.push(
      ...generatedFields.map((field) => ({ collectionId: id, fieldKey: field.key })),
    );
    if (manualFields.length !== expectedFieldCount) {
      issues.push({
        collectionId: id,
        issue: "manual-field-count",
        expected: expectedFieldCount,
        actual: manualFields.length,
      });
    }
    if (collection.displayField !== expectedDisplayField) {
      issues.push({
        collectionId: id,
        issue: "display-field",
        expected: expectedDisplayField,
        actual: collection.displayField,
      });
    }
    const permissions = collection.permissions;
    const expectedRemovePermission = id === "CHStayCampaigns" ? "CMS_EDITOR" : "PRIVILEGED";
    if (
      permissions?.itemRead !== "ANYONE" ||
      permissions?.itemInsert !== "CMS_EDITOR" ||
      permissions?.itemUpdate !== "CMS_EDITOR" ||
      permissions?.itemRemove !== expectedRemovePermission
    ) {
      issues.push({ collectionId: id, issue: "permissions", actual: permissions });
    }
    const userIndexes = Array.isArray(collection.indexes)
      ? collection.indexes.filter((index) => index.source === "USER")
      : [];
    userIndexCount += userIndexes.length;
    const inactiveIndexes = userIndexes
      .filter((index) => index.status !== "ACTIVE")
      .map(({ name, status }) => ({ name, status }));
    if (inactiveIndexes.length > 0) {
      issues.push({ collectionId: id, issue: "inactive-indexes", inactiveIndexes });
    }
    const uniqueIndexes = userIndexes.filter((index) => index.unique);
    const expectedUniqueIndexes = id === "CHStayCampaigns" ? 0 : 1;
    if (uniqueIndexes.length !== expectedUniqueIndexes) {
      issues.push({
        collectionId: id,
        issue: "unique-index-count",
        expected: expectedUniqueIndexes,
        actual: uniqueIndexes.length,
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        auditedAt: new Date().toISOString(),
        expectedCollectionCount: expectedIds.size,
        actualCustomCollectionCount: customCollections.length,
        expectedManualFieldCount: 284,
        actualManualFieldCount: manualFieldCount,
        userIndexCount,
        itemCount,
        nonEmptyCollections,
        missingCollections,
        unexpectedCollections,
        generatedRelationFields,
        issues,
        passed:
          missingCollections.length === 0 &&
          unexpectedCollections.length === 0 &&
          issues.length === 0 &&
          manualFieldCount === 284,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

console.log(
  JSON.stringify(
    {
      auditedAt: new Date().toISOString(),
      siteId: wixConfig.siteId,
      appId: wixConfig.appId,
      collectionCount: audit.length,
      collections: audit,
    },
    null,
    2,
  ),
);
