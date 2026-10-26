import { describe, expect, it } from "vitest";
import { createCloudbedsProvider } from "./cloudbeds";

const room = {
  id: "garden-room",
  name: "Garden Room",
  locationId: "barcelona",
  locationName: "Circles House Barcelona",
  bookingUrl: "https://hotels.cloudbeds.com/reservation/example",
};

describe("Cloudbeds booking provider", () => {
  it("returns a verified HTTPS URL", () => {
    const provider = createCloudbedsProvider("https://hotels.cloudbeds.com");
    expect(provider.getRedirect(room).toString()).toBe(room.bookingUrl);
  });

  it("rejects non-HTTPS links", () => {
    const provider = createCloudbedsProvider();
    expect(() => provider.getRedirect({ ...room, bookingUrl: "http://example.com" })).toThrow(/HTTPS/);
  });

  it("rejects a different origin when an allowlist is configured", () => {
    const provider = createCloudbedsProvider("https://hotels.cloudbeds.com");
    expect(() => provider.getRedirect({ ...room, bookingUrl: "https://example.com/book" })).toThrow(/configured origin/);
  });
});
