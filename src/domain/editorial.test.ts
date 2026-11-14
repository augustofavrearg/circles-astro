import { describe, expect, it } from "vitest";
import {
  assertSectionSourceContext,
  parseEditorialEntityReference,
  parseSectionSource,
} from "./editorial";

describe("editorial composition contract", () => {
  it("keeps existing sections manual by default", () => {
    expect(parseSectionSource({})).toEqual({ mode: "manual" });
  });

  it("accepts controlled automatic and curated sources", () => {
    expect(parseSectionSource({
      sourceMode: "automatic",
      sourceKey: "location.rooms",
      sourceLimit: 6,
    })).toEqual({ mode: "automatic", key: "location.rooms", limit: 6 });
    expect(parseSectionSource({
      sourceMode: "curated",
      sourceKey: "partners.published",
    })).toEqual({ mode: "curated", key: "partners.published" });
  });

  it("rejects arbitrary source configuration", () => {
    expect(() => parseSectionSource({ sourceMode: "automatic" })).toThrow(/requires sourceKey/);
    expect(() => parseSectionSource({ sourceMode: "automatic", sourceKey: "rooms.anything" })).toThrow(/Unknown editorial sourceKey/);
    expect(() => parseSectionSource({ sourceMode: "manual", sourceKey: "location.rooms" })).toThrow(/cannot declare sourceKey/);
    expect(() => parseSectionSource({ sourceMode: "automatic", sourceKey: "location.rooms", sourceLimit: 101 })).toThrow(/between 1 and 100/);
  });

  it("validates context required by location and program sources", () => {
    const rooms = parseSectionSource({ sourceMode: "automatic", sourceKey: "location.rooms" });
    expect(() => assertSectionSourceContext(rooms, {})).toThrow(/requires location context/);
    expect(() => assertSectionSourceContext(rooms, { location: "barcelona" })).not.toThrow();
  });

  it("parses entity references only when type and key are complete", () => {
    expect(parseEditorialEntityReference({})).toBeUndefined();
    expect(parseEditorialEntityReference({ entityType: "room", entityKey: "panoramic-loft" })).toEqual({
      type: "room",
      key: "panoramic-loft",
    });
    expect(() => parseEditorialEntityReference({ entityType: "room" })).toThrow(/both entityType and entityKey/);
    expect(() => parseEditorialEntityReference({ entityType: "unknown", entityKey: "x" })).toThrow(/Unknown editorial entityType/);
  });
});
