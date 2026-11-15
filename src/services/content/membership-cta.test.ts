import { describe, expect, it } from "vitest";
import { whatsappLinks } from "../../lib/whatsapp";
import { normalizeMembershipCta } from "./membership-cta";

describe("membership CTA normalization", () => {
  const communityCta = { label: "Join on WhatsApp", href: whatsappLinks.community };

  it("supplies the canonical community CTA when Wix omits it from memberships.intro", () => {
    expect(normalizeMembershipCta(undefined, "memberships.intro")).toEqual(communityCta);
  });

  it("supplies the same fallback to the other required Hub conversion sections", () => {
    expect(normalizeMembershipCta(undefined, "home.memberships")).toEqual(communityCta);
    expect(normalizeMembershipCta(undefined, "memberships.hub")).toEqual(communityCta);
    expect(normalizeMembershipCta(undefined, "memberships.band")).toEqual(communityCta);
  });

  it("replaces legacy membership and authentication destinations", () => {
    expect(normalizeMembershipCta({ label: "Apply", href: "/memberships" })).toEqual(communityCta);
    expect(normalizeMembershipCta({ label: "Login", href: "/api/auth/login" })).toEqual(communityCta);
  });

  it("does not invent CTAs for unrelated sections or replace unrelated links", () => {
    expect(normalizeMembershipCta(undefined, "memberships.benefits")).toBeUndefined();
    expect(normalizeMembershipCta({ label: "Book", href: "/rooms" }, "rooms.band")).toEqual({ label: "Book", href: "/rooms" });
  });
});
