import { describe, expect, it } from "vitest";
import { fixtureRepository } from "./repository";

describe("event discovery repository contract", () => {
  it("uses OR within a filter dimension and AND across dimensions", async () => {
    const events = await fixtureRepository.getEvents({
      locations: ["barcelona", "andorra"],
      programs: ["founders-month"],
      month: "2027-06",
    });

    expect(events).toHaveLength(3);
    expect(events.every((event) => event.city === "barcelona")).toBe(true);
    expect(events.every((event) => event.program?.slug === "founders-month")).toBe(true);
    expect(events.every((event) => event.monthKey === "2027-06")).toBe(true);

    await expect(fixtureRepository.getEvents({
      locations: ["andorra"],
      programs: ["founders-month"],
    })).resolves.toEqual([]);
  });

  it("resolves canonical events and location-period stay campaigns independently", async () => {
    await expect(fixtureRepository.getEvent("movie-night-2027-06")).resolves.toMatchObject({
      city: "barcelona",
      program: { slug: "founders-month" },
    });
    await expect(fixtureRepository.getStayCampaign("barcelona", "2027-06")).resolves.toMatchObject({
      campaignKey: "barcelona-2027-06",
      legacyRouteParam: "june",
    });
    await expect(fixtureRepository.getStayCampaignByLegacySlug("june")).resolves.toMatchObject({
      period: "2027-06",
    });
  });

  it("exposes only discoverable spaces within their location", async () => {
    await expect(fixtureRepository.getLocationSpaces("barcelona")).resolves.toMatchObject([
      { routeSlug: "rooftop", location: { slug: "barcelona" } },
    ]);
    await expect(fixtureRepository.getLocationSpaces("andorra")).resolves.toHaveLength(2);
    await expect(fixtureRepository.getLocationSpace("andorra", "restaurant")).resolves.toMatchObject({
      slug: "andorra-restaurant",
      status: "comingSoon",
    });
    await expect(fixtureRepository.getLocationSpace("barcelona", "booths")).resolves.toBeUndefined();
  });
});
