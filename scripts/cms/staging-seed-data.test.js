import { describe, expect, it } from "vitest";
import {
  multiReferenceTargets,
  richContent,
  seedCollections,
} from "./staging-seed-data.mjs";

const expectedCollections = [
  "CHSiteSettings",
  "CHInterfaceCopy",
  "CHPages",
  "CHAmenities",
  "CHLocations",
  "CHPeople",
  "CHSocialLinks",
  "CHNavigationItems",
  "CHPageSections",
  "CHSectionItems",
  "CHPrograms",
  "CHSpaces",
  "CHRooms",
  "CHEvents",
  "CHNewsArticles",
  "CHDeals",
  "CHTestimonials",
  "CHPartners",
  "CHFaqs",
  "CHMembershipPlans",
  "CHLegalPages",
];

function collectReferences(value, references = []) {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectReferences(entry, references));
    return references;
  }
  if (!value || typeof value !== "object") return references;
  if (value.$seedReference) references.push(value.$seedReference);
  else Object.values(value).forEach((entry) => collectReferences(entry, references));
  return references;
}

describe("Wix staging seed manifest", () => {
  it("covers every canonical collection with 143 uniquely keyed records", () => {
    expect(seedCollections.map(({ collectionId }) => collectionId)).toEqual(
      expectedCollections,
    );
    expect(seedCollections.flatMap(({ items }) => items)).toHaveLength(143);

    for (const { collectionId, keyField, items } of seedCollections) {
      const keys = items.map(({ key }) => key);
      expect(new Set(keys).size, `${collectionId} has duplicate seed keys`).toBe(
        keys.length,
      );
      for (const item of items) {
        expect(item.data[keyField], `${collectionId}:${item.key}`).toBe(item.key);
      }
    }
  });

  it("only references records that are available earlier in the load order", () => {
    const available = new Set();
    for (const { collectionId, items } of seedCollections) {
      for (const item of items) {
        for (const reference of collectReferences(item.data)) {
          expect(
            available.has(`${reference.collectionId}:${reference.key}`),
            `${collectionId}:${item.key} has unresolved reference ${reference.collectionId}:${reference.key}`,
          ).toBe(true);
        }
      }
      items.forEach(({ key }) => available.add(`${collectionId}:${key}`));
    }
  });

  it("composes the Barcelona coworking page from page sections, plans and reusable spaces", () => {
    const sections = seedCollections.find(({ collectionId }) => collectionId === "CHPageSections");
    const items = seedCollections.find(({ collectionId }) => collectionId === "CHSectionItems");
    const spaces = seedCollections.find(({ collectionId }) => collectionId === "CHSpaces");

    expect(sections?.items.map(({ key }) => key)).toEqual(
      expect.arrayContaining([
        "coworking-barcelona.hero",
        "coworking-barcelona.spaces",
        "coworking-barcelona.pricing",
        "coworking-barcelona.band",
        "coworking-barcelona.faq",
      ]),
    );
    expect(items?.items.filter(({ key }) => key.startsWith("coworking-barcelona.pricing."))).toHaveLength(4);
    expect(spaces?.items.filter(({ data }) => data.location?.$seedReference?.key === "barcelona" && data.spaceType === "coworking")).toHaveLength(4);
  });

  it("composes Memberships from editorial sections and reusable entities", () => {
    const sections = seedCollections.find(({ collectionId }) => collectionId === "CHPageSections");
    const people = seedCollections.find(({ collectionId }) => collectionId === "CHPeople");
    const plans = seedCollections.find(({ collectionId }) => collectionId === "CHMembershipPlans");

    expect(sections?.items.filter(({ key }) => key.startsWith("memberships."))).toHaveLength(7);
    expect(people?.items.some(({ data }) => data.personTypes?.includes("member"))).toBe(true);
    expect(plans?.items).toHaveLength(1);
    expect(JSON.stringify(plans?.items)).not.toMatch(/sandbox/i);
  });

  it("resolves every declared multi-reference target", () => {
    const keysByCollection = new Map(
      seedCollections.map(({ collectionId, items }) => [
        collectionId,
        new Set(items.map(({ key }) => key)),
      ]),
    );

    for (const { collectionId, items } of seedCollections) {
      for (const item of items) {
        for (const [field, targetKeys] of Object.entries(
          item.multiReferences ?? {},
        )) {
          const target = multiReferenceTargets[collectionId]?.[field];
          expect(target, `${collectionId}.${field} has no target metadata`).toBeDefined();
          for (const key of targetKeys) {
            expect(
              keysByCollection.get(target.collectionId)?.has(key),
              `${collectionId}:${item.key}.${field} has missing target ${target.collectionId}:${key}`,
            ).toBe(true);
          }
        }
      }
    }
  });

  it("creates valid minimal Ricos paragraph nesting", () => {
    const document = richContent("First paragraph", "Second paragraph");
    expect(document.nodes.map(({ type }) => type)).toEqual([
      "PARAGRAPH",
      "PARAGRAPH",
      "PARAGRAPH",
    ]);
    expect(document.nodes[0].nodes[0]).toEqual({
      type: "TEXT",
      textData: { text: "First paragraph", decorations: [] },
    });
    expect(document.nodes[1]).toEqual({ type: "PARAGRAPH" });
  });

  it("uses only canonical event origin types", () => {
    const events = seedCollections.find(({ collectionId }) => collectionId === "CHEvents");
    expect(events?.items.map(({ data }) => data.eventType)).toEqual(
      expect.arrayContaining(["circles"]),
    );
    expect(events?.items.every(({ data }) => ["circles", "external"].includes(data.eventType))).toBe(true);
  });

  it("uses canonical space statuses from the Wix schema", () => {
    const spaces = seedCollections.find(({ collectionId }) => collectionId === "CHSpaces");
    expect(
      spaces?.items.every(({ data }) =>
        ["hidden", "active", "comingSoon"].includes(data.status),
      ),
    ).toBe(true);
  });

  it("keeps sandbox copy out of the Figma-backed Home records", () => {
    const homeRecords = seedCollections.flatMap(({ collectionId, items }) =>
      items
        .filter(({ editorialStatus }) => editorialStatus?.startsWith("figma"))
        .map(({ data }) => ({ collectionId, data })),
    );

    expect(JSON.stringify(homeRecords)).not.toMatch(/sandbox/i);
  });
});
