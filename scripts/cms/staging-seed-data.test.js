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
  "CHStayCampaigns",
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
  it("covers every canonical collection with 227 uniquely keyed records", () => {
    expect(seedCollections.map(({ collectionId }) => collectionId)).toEqual(
      expectedCollections,
    );
    expect(seedCollections.flatMap(({ items }) => items)).toHaveLength(227);

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

  it("composes the complete footer page contracts", () => {
    const sections = seedCollections.find(({ collectionId }) => collectionId === "CHPageSections");
    const items = seedCollections.find(({ collectionId }) => collectionId === "CHSectionItems");

    expect(sections?.items.filter(({ key }) => key.startsWith("what-is-circles.")).map(({ key }) => key)).toEqual([
      "what-is-circles.intro",
      "what-is-circles.purpose",
      "what-is-circles.values",
      "what-is-circles.edge",
      "what-is-circles.manifesto",
      "what-is-circles.faq",
    ]);
    expect(sections?.items.filter(({ key }) => key.startsWith("life-at-circles.")).map(({ key }) => key)).toEqual([
      "life-at-circles.intro",
      "life-at-circles.highlights",
      "life-at-circles.band",
      "life-at-circles.faq",
    ]);
    expect(items?.items.filter(({ key }) => key.startsWith("what-is-circles.values."))).toHaveLength(4);
    expect(items?.items.filter(({ key }) => key.startsWith("life-at-circles.highlights."))).toHaveLength(3);
    expect(items?.items.filter(({ key }) =>
      key === "what-is-circles.faq.getting-there" || key === "life-at-circles.faq.getting-there"
    )).toHaveLength(2);
  });

  it("composes Partnerships with the complete Figma-backed contract", () => {
    const sections = seedCollections.find(({ collectionId }) => collectionId === "CHPageSections");
    const items = seedCollections.find(({ collectionId }) => collectionId === "CHSectionItems");
    const partners = seedCollections.find(({ collectionId }) => collectionId === "CHPartners");

    expect(sections?.items.filter(({ key }) => key.startsWith("partnerships.")).map(({ key }) => key)).toEqual([
      "partnerships.intro",
      "partnerships.partners",
      "partnerships.membership",
      "partnerships.faq",
    ]);
    expect(items?.items.filter(({ key }) => key.startsWith("partnerships.faq."))).toHaveLength(5);
    expect(partners?.items.find(({ key }) => key === "barcelona-tech-city")?.data).toMatchObject({
      featured: true,
      published: true,
    });
    expect(partners?.items.filter(({ data }) => data.published && data.featured).map(({ key }) => key)).toEqual([
      "barcelona-tech-city",
    ]);
  });

  it("composes Team with complete editorial content and published biographies", () => {
    const sections = seedCollections.find(({ collectionId }) => collectionId === "CHPageSections");
    const items = seedCollections.find(({ collectionId }) => collectionId === "CHSectionItems");
    const people = seedCollections.find(({ collectionId }) => collectionId === "CHPeople");

    expect(sections?.items.filter(({ key }) => key.startsWith("team.")).map(({ key }) => key)).toEqual([
      "team.intro",
      "team.members",
      "team.band",
      "team.faq",
    ]);
    expect(items?.items.filter(({ key }) => key.startsWith("team.faq."))).toHaveLength(3);
    expect(people?.items.filter(({ data }) => data.personTypes?.includes("team") && data.published)).toHaveLength(6);
    expect(people?.items
      .filter(({ data }) => data.personTypes?.includes("team") && data.published)
      .every(({ data }) => Boolean(data.bio && data.photo))).toBe(true);
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
    expect(sections?.items.find(({ key }) => key === "coworking-barcelona.hero")?.data.primaryExternalUrl).toContain("wa.me/34623328787");
    expect(items?.items.filter(({ key }) => key.startsWith("coworking-barcelona.pricing.")).every(({ data }) => data.externalUrl?.includes("wa.me/34623328787"))).toBe(true);
  });

  it("keeps the general chat and community invitation as separate WhatsApp destinations", () => {
    const socialLinks = seedCollections.find(({ collectionId }) => collectionId === "CHSocialLinks");
    const sections = seedCollections.find(({ collectionId }) => collectionId === "CHPageSections");

    expect(socialLinks?.items.find(({ key }) => key === "whatsapp")?.data.url).toContain("wa.me/34623328787");
    expect(sections?.items.find(({ key }) => key === "memberships.intro")?.data.primaryExternalUrl).toContain("chat.whatsapp.com/");
    expect(sections?.items.find(({ key }) => key === "memberships.band")?.data.primaryExternalUrl).toContain("chat.whatsapp.com/");
    expect(sections?.items.find(({ key }) => key === "memberships.hub")?.data.primaryExternalUrl).toBeUndefined();
  });

  it("keeps the events intro aligned with the approved design copy", () => {
    const sections = seedCollections.find(({ collectionId }) => collectionId === "CHPageSections");
    const intro = sections?.items.find(({ key }) => key === "events.intro")?.data;

    expect(intro).toMatchObject({
      eyebrow: "Happening now",
      title: "Live Surrounded by Nature",
      subtitle:
        "See What Makes our Inspiring Coworking Spaces Perfect for Entrepreneurs and Innovators",
    });
    expect(intro?.body).toBeUndefined();
  });

  it("keeps the approved deals published with their Wix images", () => {
    const deals = seedCollections.find(({ collectionId }) => collectionId === "CHDeals");
    const approved = deals?.items.filter(({ key }) => ["book-3-get-1", "give-10-get-10"].includes(key));

    expect(approved).toHaveLength(2);
    expect(approved?.every(({ data }) => data.published === true && data.image?.startsWith("wix:image://"))).toBe(true);
  });

  it("composes the complete Barcelona location page contract", () => {
    const pages = seedCollections.find(({ collectionId }) => collectionId === "CHPages");
    const sections = seedCollections.find(({ collectionId }) => collectionId === "CHPageSections");
    const items = seedCollections.find(({ collectionId }) => collectionId === "CHSectionItems");
    const locationSectionKeys = sections?.items
      .filter(({ key }) => key.startsWith("location-barcelona."))
      .map(({ key }) => key);

    expect(locationSectionKeys).toEqual([
      "location-barcelona.hero",
      "location-barcelona.space",
      "location-barcelona.rooms",
      "location-barcelona.band",
      "location-barcelona.experiences",
      "location-barcelona.location",
      "location-barcelona.manager",
      "location-barcelona.faq",
    ]);
    expect(items?.items.filter(({ key }) => key.startsWith("location-barcelona.hero."))).toHaveLength(2);
    expect(items?.items.filter(({ key }) => key.startsWith("location-barcelona.experiences."))).toHaveLength(2);
    expect(pages?.items.find(({ key }) => key === "location-barcelona")?.data.seoTitle).toBe("Circles House Barcelona");
  });

  it("provides clearly provisional Andorra data for cross-location testing", () => {
    const pages = seedCollections.find(({ collectionId }) => collectionId === "CHPages");
    const sections = seedCollections.find(({ collectionId }) => collectionId === "CHPageSections");
    const items = seedCollections.find(({ collectionId }) => collectionId === "CHSectionItems");
    const rooms = seedCollections.find(({ collectionId }) => collectionId === "CHRooms");
    const events = seedCollections.find(({ collectionId }) => collectionId === "CHEvents");

    expect(pages?.items.find(({ key }) => key === "location-andorra")?.editorialStatus).toBe("provisional-test-data");
    expect(sections?.items.filter(({ key }) => key.startsWith("location-andorra."))).toHaveLength(8);
    expect(items?.items.filter(({ key }) => key.startsWith("location-andorra.hero."))).toHaveLength(2);
    expect(items?.items.filter(({ key }) => key.startsWith("location-andorra.experiences."))).toHaveLength(2);
    expect(rooms?.items.filter(({ data }) => data.location?.$seedReference?.key === "andorra")).toHaveLength(2);
    expect(events?.items.filter(({ data }) => data.location?.$seedReference?.key === "andorra")).toHaveLength(2);
    const andorra = seedCollections.find(({ collectionId }) => collectionId === "CHLocations")?.items.find(({ key }) => key === "andorra");
    const faqs = seedCollections.find(({ collectionId }) => collectionId === "CHFaqs");
    expect(andorra).toMatchObject({
      reconcile: true,
      data: { status: "open" },
      multiReferences: { amenities: ["community-kitchen", "high-speed-wifi"] },
    });
    expect(faqs?.items.some(({ multiReferences }) => multiReferences?.pages?.includes("location-andorra"))).toBe(true);
  });

  it("uses one reusable Page hierarchy for all stay campaigns", () => {
    const pages = seedCollections.find(({ collectionId }) => collectionId === "CHPages");
    const sections = seedCollections.find(({ collectionId }) => collectionId === "CHPageSections");
    const sectionItems = seedCollections.find(({ collectionId }) => collectionId === "CHSectionItems");
    const campaigns = seedCollections.find(({ collectionId }) => collectionId === "CHStayCampaigns");

    expect(pages?.items.some(({ key }) => key === "stay-campaign-template")).toBe(true);
    expect(pages?.items.some(({ key }) => key === "june")).toBe(false);
    expect(sections?.items.filter(({ key }) => key.startsWith("stay-campaign."))).toHaveLength(7);
    expect(sections?.items.some(({ key }) => key.startsWith("june."))).toBe(false);
    expect(sectionItems?.items.some(({ key }) => key.startsWith("june."))).toBe(false);
    expect(campaigns?.items.every(({ data }) => data.page === undefined)).toBe(true);
  });

  it("limits seed reconciliation to the approved location contracts", () => {
    const reconciled = seedCollections.flatMap(({ collectionId, items }) =>
      items.filter(({ reconcile }) => reconcile).map(({ key }) => `${collectionId}:${key}`),
    );

    expect(reconciled).toHaveLength(14);
    expect(reconciled.filter((key) => !key.includes("location-barcelona"))).toEqual(["CHLocations:andorra"]);
  });

  it("composes Memberships from editorial sections and reusable entities", () => {
    const sections = seedCollections.find(({ collectionId }) => collectionId === "CHPageSections");
    const people = seedCollections.find(({ collectionId }) => collectionId === "CHPeople");
    const plans = seedCollections.find(({ collectionId }) => collectionId === "CHMembershipPlans");

    expect(sections?.items.filter(({ key }) => key.startsWith("memberships."))).toHaveLength(7);
    expect(people?.items.some(({ data }) => data.personTypes?.includes("member"))).toBe(true);
    expect(plans?.items).toHaveLength(1);
    expect(JSON.stringify(plans?.items)).not.toMatch(/sandbox/i);
    expect(JSON.stringify(sections?.items)).not.toMatch(/\/api\/auth|"primaryRouteKey":"memberships"/);
    expect(sections?.items
      .filter(({ data }) => data.primaryCtaLabel === "Join on WhatsApp")
      .every(({ data }) => data.primaryExternalUrl?.includes("chat.whatsapp.com/")))
      .toBe(true);
    expect(plans?.items[0]?.data).toMatchObject({
      ctaLabel: "Join on WhatsApp",
      externalUrl: expect.stringContaining("chat.whatsapp.com/"),
    });
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

  it("opts only the P2 pilot room into detail routing", () => {
    const rooms = seedCollections.find(({ collectionId }) => collectionId === "CHRooms");
    const discoverable = rooms?.items.filter(({ data }) => data.discoverable === true);

    expect(discoverable?.map(({ key }) => key)).toEqual(["king-studio-terrace-sea-view"]);
    expect(discoverable?.[0]?.data.location?.$seedReference?.key).toBe("barcelona");
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

  it("publishes only intentional location spaces with location-scoped routes", () => {
    const spaces = seedCollections.find(({ collectionId }) => collectionId === "CHSpaces");
    const discoverable = spaces?.items.filter(({ data }) => data.discoverable);
    expect(discoverable?.map(({ data }) => `${data.location.$seedReference.key}:${data.routeSlug}`)).toEqual([
      "andorra:spa",
      "andorra:restaurant",
      "barcelona:rooftop",
    ]);
    expect(new Set(discoverable?.map(({ data }) => `${data.location.$seedReference.key}:${data.routeSlug}`)).size).toBe(discoverable?.length);
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
