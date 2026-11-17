import { describe, expect, it } from "vitest";
import { partnershipsPageFixture } from "./fixtures";
import { requireCompletePartnershipsPage } from "./partnerships-contract";

describe("Partnerships page contract", () => {
  it("accepts the complete Figma-backed fixture", () => {
    expect(requireCompletePartnershipsPage(partnershipsPageFixture)).toBe(partnershipsPageFixture);
  });

  it("rejects a page without the membership band", () => {
    const { membership: _membership, ...incomplete } = partnershipsPageFixture;
    expect(() => requireCompletePartnershipsPage(incomplete)).toThrow(
      'missing the required "partnerships.membership" content',
    );
  });

  it("rejects a page without FAQ items", () => {
    expect(() => requireCompletePartnershipsPage({
      ...partnershipsPageFixture,
      faq: { ...partnershipsPageFixture.faq!, items: [] },
    })).toThrow("requires at least one FAQ");
  });
});
