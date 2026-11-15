import { describe, expect, it } from "vitest";
import {
  legacyJuneKeys,
  stayCampaignTemplatePage,
  stayCampaignTemplateSections,
} from "./stay-campaign-template.mjs";

describe("reusable stay campaign template", () => {
  it("uses one stable Page with reusable structural sections", () => {
    expect(stayCampaignTemplatePage.pageKey).toBe("stay-campaign-template");
    expect(stayCampaignTemplateSections.map(({ sectionKey }) => sectionKey)).toEqual([
      "stay-campaign.hero",
      "stay-campaign.form",
      "stay-campaign.space",
      "stay-campaign.rooms",
      "stay-campaign.band",
      "stay-campaign.events",
      "stay-campaign.faq",
    ]);
  });

  it("does not preserve copied monthly event carousels in the template", () => {
    expect(stayCampaignTemplateSections.some(({ sectionKey }) => /external|seasonal/.test(sectionKey))).toBe(false);
    expect(legacyJuneKeys.sections).toHaveLength(9);
    expect(legacyJuneKeys.items).toHaveLength(6);
  });
});
