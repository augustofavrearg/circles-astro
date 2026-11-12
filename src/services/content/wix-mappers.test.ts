import { describe, expect, it } from "vitest";
import {
  asDateOnly,
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
  validateEventProgramReference,
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
    expect(resolveCmsHref("events", "barcelona")).toBe("/events?location=barcelona");
    expect(resolveCmsHref("memberships")).toBe("/memberships");
    expect(resolveCmsHref("month", "june")).toBe("/months/june");
    expect(resolveCmsHref("program", "founders-month")).toBe("/programs/founders-month");
    expect(() => resolveCmsHref("co-owners")).toThrow(/Unknown Wix CMS routeKey/);
  });

  it("normalizes Wix program dates", () => {
    expect(asDateOnly("2027-06-01")).toBe("2027-06-01");
    expect(asDateOnly({ $date: "2027-06-30T00:00:00.000Z" })).toBe("2027-06-30");
    expect(asDateOnly("not-a-date")).toBeUndefined();
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

  it("accepts Wix extended-date payloads and rejects invalid timezones", () => {
    const event = mapEvent(
      {
        slug: "christmas-innovation-jam",
        title: "Christmas Innovation Jam",
        location: "location-id",
        startsAt: { $date: "2026-12-25T03:00:00.000Z" },
        endsAt: { $date: "2026-12-25T20:00:00.000Z" },
        timezone: "Europe/Madrid",
      },
      locations,
    );

    expect(event).toMatchObject({ month: "Dec", day: "25" });
    expect(() =>
      mapEvent(
        {
          slug: "invalid-timezone",
          title: "Invalid timezone",
          location: "location-id",
          startsAt: "2026-12-25T03:00:00.000Z",
          timezone: "Europe/Barcelona",
        },
        locations,
      ),
    ).toThrow('CHEvents item "invalid-timezone" is missing a valid timezone.');
  });

  it("validates optional CHPrograms references and their location", () => {
    const programs = new Map([
      ["program-id", { _id: "program-id", location: "location-id" }],
      ["andorra-program", { _id: "andorra-program", location: "andorra-id" }],
    ]);

    expect(() => validateEventProgramReference({ slug: "standalone" }, programs)).not.toThrow();
    expect(() =>
      validateEventProgramReference({ slug: "linked", location: "location-id", program: "program-id" }, programs),
    ).not.toThrow();
    expect(() =>
      validateEventProgramReference({ slug: "missing", location: "location-id", program: "missing-id" }, programs),
    ).toThrow('CHEvents item "missing" references a missing or unpublished CHPrograms item.');
    expect(() =>
      validateEventProgramReference({ slug: "wrong-location", location: "location-id", program: "andorra-program" }, programs),
    ).toThrow('CHEvents item "wrong-location" must use a location selected by its CHPrograms item.');

    const multiLocationPrograms = new Map([
      ["multi", { _id: "multi", locationScope: "selected", locations: ["location-id", "andorra-id"] }],
      ["global", { _id: "global", locationScope: "all" }],
    ]);
    expect(() => validateEventProgramReference({ slug: "multi", location: "andorra-id", program: "multi" }, multiLocationPrograms)).not.toThrow();
    expect(() => validateEventProgramReference({ slug: "global", location: "third-id", program: "global" }, multiLocationPrograms)).not.toThrow();
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
    expect(mapNavigationItem({ label: "Barcelona rooms", status: "link", routeKey: "rooms", routeParam: "barcelona" })).toEqual({
      status: "link",
      label: "Barcelona rooms",
      href: "/rooms/barcelona",
      image: undefined,
      menuLabel: undefined,
      children: undefined,
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
