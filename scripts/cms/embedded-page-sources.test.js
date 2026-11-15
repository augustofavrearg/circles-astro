import { describe, expect, it } from "vitest";
import { embeddedDealsPage, embeddedEntitySections } from "./embedded-page-sources.mjs";
import { SECTION_SOURCE_KEYS } from "../../src/domain/editorial";

describe("embedded entity Page contracts", () => {
  it("creates one stable Deals Page instead of one Page per Deal", () => {
    expect(embeddedDealsPage).toMatchObject({
      pageKey: "deals",
      routeKey: "deals",
      published: true,
    });
  });

  it("uses only controlled automatic sources", () => {
    expect(embeddedEntitySections.map(({ sectionKey, sourceKey }) => ({ sectionKey, sourceKey }))).toEqual([
      { sectionKey: "partnerships.partners", sourceKey: "partners.published" },
      { sectionKey: "deals.list", sourceKey: "deals.active" },
    ]);
    expect(embeddedEntitySections.every(({ sourceMode }) => sourceMode === "automatic")).toBe(true);
    expect(embeddedEntitySections.every(({ sourceKey }) => SECTION_SOURCE_KEYS.includes(sourceKey))).toBe(true);
  });
});
