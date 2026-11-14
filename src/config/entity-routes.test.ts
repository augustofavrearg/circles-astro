import { describe, expect, it } from "vitest";
import { ENTITY_ROUTE_EXPOSURE, resolveEntityHref } from "./entity-routes";

describe("entity route registry", () => {
  it("resolves canonical detail routes", () => {
    expect(resolveEntityHref({ type: "room", key: "panoramic-loft", location: "barcelona" }))
      .toBe("/locations/barcelona/rooms/panoramic-loft");
    expect(resolveEntityHref({ type: "space", key: "restaurant", location: "andorra" }))
      .toBe("/locations/andorra/spaces/restaurant");
    expect(resolveEntityHref({ type: "event", key: "community-dinner" })).toBe("/events/community-dinner");
    expect(resolveEntityHref({ type: "post", key: "Life in Barcelona" })).toBe("/posts/Life%20in%20Barcelona");
  });

  it("uses collection, external and embedded exposure without inventing detail routes", () => {
    expect(ENTITY_ROUTE_EXPOSURE.deal).toBe("collection");
    expect(resolveEntityHref({ type: "deal", key: "member-rate" })).toBe("/deals");
    expect(resolveEntityHref({ type: "partner", key: "nomadico", externalUrl: "https://example.com" }))
      .toBe("https://example.com");
    expect(resolveEntityHref({ type: "person", key: "teagan" })).toBeUndefined();
  });

  it("requires location context for scoped entities", () => {
    expect(() => resolveEntityHref({ type: "room", key: "panoramic-loft" })).toThrow(/requires location context/);
  });
});
