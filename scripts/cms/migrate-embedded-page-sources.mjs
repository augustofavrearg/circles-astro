import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { embeddedDealsPage, embeddedEntitySections } from "./embedded-page-sources.mjs";
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

async function saveItem(collectionId, existing, data) {
  return wixRequest(existing ? "/wix-data/v2/items/update" : "/wix-data/v2/items", {
    method: "POST",
    body: JSON.stringify({
      dataCollectionId: collectionId,
      dataItem: existing ? { id: existing.id, data } : { data },
    }),
  });
}

async function readState() {
  const [collectionResponse, pages, sections] = await Promise.all([
    wixRequest("/wix-data/v2/collections?paging.limit=1000"),
    queryItems("CHPages"),
    queryItems("CHPageSections"),
  ]);
  const sectionCollection = (collectionResponse.collections ?? [])
    .find((collection) => collection.id === "CHPageSections");
  if (!sectionCollection) throw new Error("Migration blocked: CHPageSections does not exist.");
  const partnershipsPage = pages.find((page) => page.data?.pageKey === "partnerships");
  if (!partnershipsPage?.id) throw new Error("Migration blocked: the Partnerships Page is missing.");
  return { sectionCollection, pages, sections };
}

const initial = await readState();
const sectionFields = new Set(initial.sectionCollection.fields.map((field) => field.key));
const missingPrerequisites = ["sourceMode", "sourceKey"].filter((field) => !sectionFields.has(field));
const existingDealsPage = initial.pages.find((page) => page.data?.pageKey === embeddedDealsPage.pageKey);
const plannedSections = embeddedEntitySections.map((desired) => ({
  ...desired,
  action: initial.sections.some((section) => section.data?.sectionKey === desired.sectionKey) ? "update" : "create",
}));

console.log(JSON.stringify({
  mode: apply ? "apply" : "dry-run",
  site: "approved-staging",
  prerequisites: missingPrerequisites.length === 0
    ? "editorial-composition-ready"
    : { missingCHPageSectionsFields: missingPrerequisites },
  page: { pageKey: "deals", action: existingDealsPage ? "update" : "create" },
  sections: plannedSections,
  entityRoutesCreated: 0,
}, null, 2));
if (!apply) process.exit(0);
if (missingPrerequisites.length > 0) {
  throw new Error("Migration blocked: apply cms:migrate:editorial-composition before P3.");
}

const dealsPageResult = await saveItem("CHPages", existingDealsPage, {
  ...(existingDealsPage?.data ?? {}),
  ...embeddedDealsPage,
  seoTitle: existingDealsPage?.data?.seoTitle || embeddedDealsPage.seoTitle,
  seoDescription: existingDealsPage?.data?.seoDescription || embeddedDealsPage.seoDescription,
});
const dealsPageId = existingDealsPage?.id ?? dealsPageResult.dataItem?.id;
const partnershipsPageId = initial.pages.find((page) => page.data?.pageKey === "partnerships")?.id;
if (!dealsPageId || !partnershipsPageId) throw new Error("Migration failed to resolve Page ids.");

for (const [index, desired] of embeddedEntitySections.entries()) {
  const existing = initial.sections.find((section) => section.data?.sectionKey === desired.sectionKey);
  const pageId = desired.pageKey === "deals" ? dealsPageId : partnershipsPageId;
  await saveItem("CHPageSections", existing, {
    ...(existing?.data ?? {}),
    sectionKey: desired.sectionKey,
    page: pageId,
    componentKey: desired.componentKey,
    sourceMode: desired.sourceMode,
    sourceKey: desired.sourceKey,
    eyebrow: existing?.data?.eyebrow || desired.eyebrow,
    title: existing?.data?.title || desired.title,
    subtitle: existing?.data?.subtitle || desired.subtitle,
    body: existing?.data?.body || desired.body,
    enabled: true,
    sortOrder: existing?.data?.sortOrder ?? index + 1,
  });
}

const verified = await readState();
const verifiedDealsPage = verified.pages.find((page) => page.data?.pageKey === "deals");
const sectionsPassed = embeddedEntitySections.every((desired) => {
  const section = verified.sections.find((candidate) => candidate.data?.sectionKey === desired.sectionKey);
  const expectedPage = verified.pages.find((page) => page.data?.pageKey === desired.pageKey);
  return section?.data?.componentKey === desired.componentKey &&
    section.data?.sourceMode === desired.sourceMode &&
    section.data?.sourceKey === desired.sourceKey &&
    section.data?.page === expectedPage?.id &&
    section.data?.enabled === true;
});
const passed = Boolean(verifiedDealsPage?.id) && sectionsPassed;
console.log(JSON.stringify({
  verification: passed ? "passed" : "failed",
  page: verifiedDealsPage?.data?.pageKey,
  sections: embeddedEntitySections.map(({ sectionKey, sourceKey }) => ({ sectionKey, sourceKey })),
  entityRoutesCreated: 0,
}, null, 2));
if (!passed) throw new Error("Post-migration verification failed.");
