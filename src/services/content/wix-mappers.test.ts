import { describe, expect, it } from "vitest";
import {
  mapCoworkingAmenityIcon,
  mapDeal,
  mapEvent,
  mapFaq,
  mapNavigationItem,
  mapNewsArticle,
  mapRoom,
  mapSiteSettings,
  isCurrentOrUpcomingEvent,
  resolveCmsHref,
  richContentBlocks,
  wixUrl,
  type LocationLookup,
} from "./wix-mappers";

const locations: LocationLookup = new Map([
  ["location-id", { slug: "barcelona", name: "Circles House Barcelona", timezone: "Europe/Madrid" }],
]);

describe("Wix CMS canonical mappers", () => {
  it("maps global newsletter content from CHSiteSettings", () => {
    expect(mapSiteSettings({
      newsletterTitle: "Stay in the circle",
      newsletterDescription: "News from Circles House.",
      newsletterConsentText: "I agree to receive updates.",
      copyrightTemplate: "© {year} Circles House",
    }, [])).toMatchObject({
      newsletter: {
        title: "Stay in the circle",
        description: "News from Circles House.",
        consentText: "I agree to receive updates.",
      },
    });
  });

  it("resolves internal route keys without storing internal URLs in Wix", () => {
    expect(resolveCmsHref("home")).toBe("/home");
    expect(resolveCmsHref("location", "barcelona", "rooms")).toBe("/locations/barcelona#rooms");
    expect(resolveCmsHref("events", "barcelona")).toBe("/events/barcelona");
    expect(resolveCmsHref("memberships")).toBe("/memberships");
    expect(resolveCmsHref("month", "june")).toBe("/months/june");
    expect(() => resolveCmsHref("co-owners")).toThrow(/Unknown Wix CMS routeKey/);
  });

  it("normalizes Wix image fields", () => {
    expect(wixUrl("wix:image://v1/abc123/photo.jpg#originWidth=1200")).toBe("https://static.wixstatic.com/media/abc123");
    expect(wixUrl({ image: { url: "https://static.wixstatic.com/media/example" } })).toBe("https://static.wixstatic.com/media/example");
  });

  it("maps CHRooms through its CHLocations reference", () => {
    expect(
      mapRoom(
        {
          slug: "garden-room",
          name: "Garden room",
          location: "location-id",
          bookingUrl: { url: "https://booking.example/room" },
          occupancyType: "private",
          features: ["Private bathroom", "Desk"],
          published: true,
        },
        locations,
      ),
    ).toMatchObject({
      id: "garden-room",
      locationId: "barcelona",
      locationName: "Circles House Barcelona",
      bookingUrl: "https://booking.example/room",
      occupancyType: "private",
      features: ["Private bathroom", "Desk"],
    });
  });

  it("maps CHDeals routeKey and externalUrl", () => {
    expect(mapDeal({ slug: "long-stay", title: "Long stay", ctaLabel: "See rooms", routeKey: "rooms" }).cta).toEqual({
      label: "See rooms",
      href: "/rooms",
    });
    expect(mapDeal({ slug: "partner", title: "Partner", ctaLabel: "Open", externalUrl: { url: "https://example.com" } }).cta).toEqual({
      label: "Open",
      href: "https://example.com",
    });
  });

  it("derives event labels and city from canonical event data", () => {
    const event = mapEvent(
      {
        slug: "movie-night",
        title: "Movie Night",
        location: { _id: "location-id" },
        startsAt: "2026-08-18T19:00:00.000Z",
        endsAt: "2026-08-18T21:30:00.000Z",
        timezone: "Europe/Madrid",
      },
      locations,
    );
    expect(event).toMatchObject({ slug: "movie-night", city: "barcelona", month: "Aug", day: "18" });
    expect(event.dateLabel).toContain("August 18");
  });

  it("keeps only events with valid current or future date windows", () => {
    const now = new Date("2026-11-06T12:00:00.000Z");

    expect(isCurrentOrUpcomingEvent({
      startsAt: "2026-11-01T10:00:00.000Z",
      endsAt: "2026-12-25T23:59:00.000Z",
    }, now)).toBe(true);
    expect(isCurrentOrUpcomingEvent({ startsAt: "2026-12-01T10:00:00.000Z" }, now)).toBe(true);
    expect(isCurrentOrUpcomingEvent({ startsAt: "2026-11-01T10:00:00.000Z" }, now)).toBe(false);
    expect(isCurrentOrUpcomingEvent({ startsAt: "not-a-date" }, now)).toBe(false);
    expect(isCurrentOrUpcomingEvent({
      startsAt: "2026-12-25T10:00:00.000Z",
      endsAt: "2026-12-24T10:00:00.000Z",
    }, now)).toBe(false);
  });

  it("maps Wix Rich Content paragraphs and lists into frontend FAQ blocks", () => {
    const answer = {
      nodes: [
        { type: "PARAGRAPH", nodes: [{ type: "TEXT", textData: { text: "First answer", decorations: [] } }] },
        {
          type: "BULLETED_LIST",
          nodes: [
            { type: "LIST_ITEM", nodes: [{ type: "PARAGRAPH", nodes: [{ type: "TEXT", textData: { text: "One", decorations: [] } }] }] },
            { type: "LIST_ITEM", nodes: [{ type: "PARAGRAPH", nodes: [{ type: "TEXT", textData: { text: "Two", decorations: [] } }] }] },
          ],
        },
      ],
    };
    expect(richContentBlocks(answer)).toEqual([
      { type: "paragraph", text: "First answer" },
      { type: "list", items: ["One", "Two"] },
    ]);
    expect(mapFaq({ question: "Question?", answer })).toEqual({
      question: "Question?",
      answer: [
        { type: "paragraph", text: "First answer" },
        { type: "list", items: ["One", "Two"] },
      ],
    });
  });

  it("maps CMS navigation status and route keys", () => {
    expect(mapNavigationItem({ label: "News", status: "link", routeKey: "news" })).toEqual({
      status: "link",
      label: "News",
      href: "/news",
      image: undefined,
      menuLabel: undefined,
      children: undefined,
    });
    expect(mapNavigationItem({ label: "Spa Andorra", status: "comingSoon", badge: "Coming soon" })).toEqual({
      status: "comingSoon",
      label: "Spa Andorra",
      badge: "Coming soon",
      image: undefined,
    });
  });

  it("normalizes CMS amenity icon aliases and safely handles unknown values", () => {
    expect(mapCoworkingAmenityIcon("phone-booth")).toBe("booths");
    expect(mapCoworkingAmenityIcon("meeting_room")).toBe("meeting");
    expect(mapCoworkingAmenityIcon("briefcase")).toBe("wifi");
  });

  it("maps only canonical CHNewsArticles content types", () => {
    expect(mapNewsArticle({
      slug: "community-living",
      title: "How community changes the way we live",
      excerpt: "A long-form article.",
      contentType: "feature",
      category: "Community",
      publishedAt: "2026-11-08T12:00:00.000Z",
      body: { nodes: [] },
    })).toMatchObject({
      slug: "community-living",
      contentType: "feature",
      category: "Community",
    });

    expect(() => mapNewsArticle({
      slug: "invalid",
      title: "Invalid",
      excerpt: "Invalid type.",
      contentType: "blog",
      category: "Community",
      publishedAt: "2026-11-08T12:00:00.000Z",
      body: { nodes: [] },
    })).toThrow('Unknown CHNewsArticles contentType "blog".');
  });
});
