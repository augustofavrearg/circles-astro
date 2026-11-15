import { describe, expect, it } from "vitest";
import { roomDetailFields, roomDetailPilot } from "./room-detail-schema.mjs";

describe("room detail Wix schema", () => {
  it("uses one explicit opt-in field", () => {
    expect(roomDetailFields).toEqual([
      expect.objectContaining({
        key: "discoverable",
        type: "BOOLEAN",
        typeMetadata: { boolean: { defaultValue: false } },
      }),
    ]);
  });

  it("limits P2 activation to the approved Barcelona pilot room", () => {
    expect(roomDetailPilot).toEqual({
      location: "barcelona",
      slug: "king-studio-terrace-sea-view",
    });
  });
});
