import { describe, expect, it } from "vitest";
import { sectionDocumentKey } from "./wix-composition";

describe("Wix page composition", () => {
  it("maps the Deals list section to the DealsPage.deals contract", () => {
    expect(sectionDocumentKey("deals.list", "deals.list")).toBe("deals");
  });

  it("keeps the conventional final component segment for other sections", () => {
    expect(sectionDocumentKey("partnerships.partners", "partnerships.partners")).toBe("partners");
    expect(sectionDocumentKey("", "memberships.faq")).toBe("faq");
  });
});
