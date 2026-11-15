import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  legacyJuneKeys,
  stayCampaignTemplatePage,
  stayCampaignTemplateSections,
} from "./stay-campaign-template.mjs";
import { STAGING_SITE_ID } from "./staging-seed-data.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const apply = process.argv.includes("--apply");
const deleteLegacy = process.argv.includes("--delete-legacy");
if (deleteLegacy && !apply) throw new Error("--delete-legacy requires --apply.");

const wixConfig = JSON.parse(await readFile(join(repositoryRoot, "wix.config.json"), "utf8"));
if (wixConfig.siteId !== STAGING_SITE_ID) {
  throw new Error("Migration blocked: Wix is not pointing to the approved staging site.");
}
const wixCli = join(repositoryRoot, "node_modules", ".bin", "wix");
const providedToken = process.env.WIX_ACCESS_TOKEN?.trim();
const tokenResult = providedToken
  ? undefined
  : spawnSync(wixCli, ["token", "--site", wixConfig.siteId], {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
    });
if (tokenResult && tokenResult.status !== 0) {
  throw new Error(`Unable to obtain a site-scoped Wix token: ${tokenResult.stderr.trim()}`);
}
const token = providedToken || tokenResult?.stdout.trim();
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

async function queryItems(dataCollectionId) {
  const response = await wixRequest("/wix-data/v2/items/query", {
    method: "POST",
    body: JSON.stringify({ dataCollectionId, query: { paging: { limit: 1000, offset: 0 } } }),
  });
  return response.dataItems ?? [];
}

async function saveItem(dataCollectionId, existing, data) {
  return wixRequest(existing ? "/wix-data/v2/items/update" : "/wix-data/v2/items", {
    method: "POST",
    body: JSON.stringify({ dataCollectionId, dataItem: existing ? { id: existing.id, data } : { data } }),
  });
}

function withoutSystemFields(data = {}) {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !key.startsWith("_")),
  );
}

async function removeItem(dataCollectionId, item) {
  if (!item?.id) return;
  await wixRequest(`/wix-data/v2/items/${item.id}?dataCollectionId=${dataCollectionId}`, { method: "DELETE" });
}

async function readState() {
  const [pages, sections, items, campaigns, programs] = await Promise.all([
    queryItems("CHPages"),
    queryItems("CHPageSections"),
    queryItems("CHSectionItems"),
    queryItems("CHStayCampaigns"),
    queryItems("CHPrograms"),
  ]);
  return { pages, sections, items, campaigns, programs };
}

const initial = await readState();
const existingTemplate = initial.pages.find((item) => item.data?.pageKey === stayCampaignTemplatePage.pageKey);
const junePage = initial.pages.find((item) => item.data?.pageKey === legacyJuneKeys.page);
const legacySections = initial.sections.filter((item) => legacyJuneKeys.sections.includes(item.data?.sectionKey));
const legacyItems = initial.items.filter((item) => legacyJuneKeys.items.includes(item.data?.itemKey));

console.log(JSON.stringify({
  mode: apply ? (deleteLegacy ? "apply-and-delete-legacy" : "apply-safe") : "dry-run",
  site: "approved-staging",
  templatePage: existingTemplate ? "update" : "create",
  templateSections: stayCampaignTemplateSections.map(({ sectionKey }) => ({
    sectionKey,
    action: initial.sections.some((item) => item.data?.sectionKey === sectionKey) ? "update" : "create",
  })),
  referencesToClear: {
    campaigns: initial.campaigns.filter((item) => item.data?.page).length,
    programs: initial.programs.filter((item) => item.data?.page).length,
  },
  legacyInventory: {
    page: junePage ? 1 : 0,
    sections: legacySections.length,
    items: legacyItems.length,
    deletionAuthorized: deleteLegacy,
  },
}, null, 2));
if (!apply) process.exit(0);

const pageResult = await saveItem("CHPages", existingTemplate, {
  ...(existingTemplate?.data ?? {}),
  ...stayCampaignTemplatePage,
});
const templatePageId = existingTemplate?.id ?? pageResult.dataItem?.id;
if (!templatePageId) throw new Error("Migration failed to resolve the reusable template Page id.");

for (const [index, desired] of stayCampaignTemplateSections.entries()) {
  const existing = initial.sections.find((item) => item.data?.sectionKey === desired.sectionKey);
  const legacy = legacySections.find((item) => item.data?.componentKey === desired.componentKey);
  await saveItem("CHPageSections", existing, {
    ...withoutSystemFields(legacy?.data),
    ...(existing?.data ?? {}),
    ...desired,
    page: templatePageId,
    eyebrow: existing?.data?.eyebrow ?? legacy?.data?.eyebrow,
    body: existing?.data?.body ?? legacy?.data?.body,
    sortOrder: existing?.data?.sortOrder ?? index + 1,
  });
}

for (const item of initial.campaigns.filter((candidate) => candidate.data?.page)) {
  await saveItem("CHStayCampaigns", item, { ...item.data, page: null });
}
for (const item of initial.programs.filter((candidate) => candidate.data?.page)) {
  await saveItem("CHPrograms", item, { ...item.data, page: null });
}

if (deleteLegacy) {
  for (const item of legacyItems) await removeItem("CHSectionItems", item);
  for (const item of legacySections) await removeItem("CHPageSections", item);
  await removeItem("CHPages", junePage);
}

const verified = await readState();
const verifiedPage = verified.pages.find((item) => item.data?.pageKey === stayCampaignTemplatePage.pageKey);
const sectionsPassed = stayCampaignTemplateSections.every((desired) => {
  const actual = verified.sections.find((item) => item.data?.sectionKey === desired.sectionKey);
  return actual?.data?.page === verifiedPage?.id && actual.data?.componentKey === desired.componentKey && actual.data?.enabled === true;
});
const referencesCleared = [...verified.campaigns, ...verified.programs].every((item) => !item.data?.page);
const legacyRemoved = !deleteLegacy || (
  !verified.pages.some((item) => item.data?.pageKey === legacyJuneKeys.page) &&
  !verified.sections.some((item) => legacyJuneKeys.sections.includes(item.data?.sectionKey)) &&
  !verified.items.some((item) => legacyJuneKeys.items.includes(item.data?.itemKey))
);
const passed = Boolean(verifiedPage?.id) && sectionsPassed && referencesCleared && legacyRemoved;
console.log(JSON.stringify({ verification: passed ? "passed" : "failed", sectionsPassed, referencesCleared, legacyRemoved }, null, 2));
if (!passed) throw new Error("Post-migration verification failed.");
