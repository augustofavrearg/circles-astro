import { describe, expect, it } from "vitest";
import { googleMapsEmbedUrl, googleMapsSearchUrl } from "./google-maps";

describe("Google Maps URLs", () => {
  it("builds an encoded public directions link", () => {
    expect(googleMapsSearchUrl("Camí de Vallvidrera 5, Barcelona")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Cam%C3%AD%20de%20Vallvidrera%205%2C%20Barcelona",
    );
  });

  it("builds an Embed API place URL only when the key and address exist", () => {
    expect(googleMapsEmbedUrl("Camí de Vallvidrera 5, Barcelona", "maps-key")).toBe(
      "https://www.google.com/maps/embed/v1/place?key=maps-key&q=Cam%C3%AD+de+Vallvidrera+5%2C+Barcelona&language=en",
    );
    expect(googleMapsEmbedUrl("Barcelona", "")).toBeUndefined();
    expect(googleMapsEmbedUrl("", "maps-key")).toBeUndefined();
  });
});
