import { describe, expect, it } from "vitest";
import { mapDeal, mapEvent, mapRoom, resolveCmsHref, wixUrl, type LocationLookup } from "./wix-mappers";

const locations: LocationLookup = new Map([
  ["location-id", { slug: "barcelona", name: "Circles House Barcelona", timezone: "Europe/Madrid" }],
]);

describe("Wix CMS canonical mappers", () => {
  it("resolves internal route keys without storing internal URLs in Wix", () => {
    expect(resolveCmsHref("location", "barcelona", "rooms")).toBe("/locations/barcelona#rooms");
    expect(resolveCmsHref("events", "barcelona")).toBe("/events/barcelona");
    expect(resolveCmsHref("memberships")).toBe("/memberships");
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
});
