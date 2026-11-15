import { describe, expect, it } from "vitest";
import { whatsappLinks } from "../../lib/whatsapp";
import {
  coworkingPagesFixture,
  dealsFixture,
  homePageFixture,
  lifePageFixture,
  locationPagesFixture,
  membershipsPageFixture,
  partnershipsPageFixture,
  roomsPageFixture,
  siteSettingsFixture,
  stayCampaignTemplateFixture,
  teamPageFixture,
} from "./fixtures";

describe("WhatsApp content entry points", () => {
  it("connects the footer, coworking, referrals and community to their dedicated flows", () => {
    const coworking = coworkingPagesFixture.find(({ city }) => city === "barcelona");
    const referral = dealsFixture.find(({ slug }) => slug === "give-10-get-10");

    expect(siteSettingsFixture.socials.find(({ network }) => network === "whatsapp")?.href).toBe(whatsappLinks.general);
    expect(coworking?.hero.cta?.href).toBe(whatsappLinks.coworkingTour);
    expect(coworking?.pricing.plans.every(({ cta }) => cta?.href === whatsappLinks.coworkingPass)).toBe(true);
    expect(referral?.cta?.href).toBe(whatsappLinks.referral);
    expect(membershipsPageFixture.hub.cta?.href).toBe(whatsappLinks.community);
  });

  it("uses the Entrepreneur Hub invitation for every membership conversion", () => {
    const membershipCtas = [
      homePageFixture.memberships.cta,
      roomsPageFixture.band.primaryCta,
      partnershipsPageFixture.membership?.primaryCta,
      teamPageFixture.band?.primaryCta,
      membershipsPageFixture.intro.cta,
      membershipsPageFixture.hub.cta,
      membershipsPageFixture.band.primaryCta,
      stayCampaignTemplateFixture.band.primaryCta,
      coworkingPagesFixture[0]?.band.primaryCta,
      lifePageFixture.band.primaryCta,
      ...locationPagesFixture.map(({ band }) => band.primaryCta),
    ].filter(Boolean);

    expect(membershipCtas.length).toBeGreaterThan(0);
    expect(membershipCtas.every((cta) => cta?.label === "Join on WhatsApp")).toBe(true);
    expect(membershipCtas.every((cta) => cta?.href === whatsappLinks.community)).toBe(true);
  });
});
