import type { Link } from "../../domain/content";
import { routes } from "../../config/navigation";
import { whatsappLinks } from "../../lib/whatsapp";

const requiredMembershipCtaSections = new Set([
  "home.memberships",
  "memberships.intro",
  "memberships.hub",
  "memberships.band",
]);

const communityCta = (): Link => ({
  label: "Join on WhatsApp",
  href: whatsappLinks.community,
});

export function normalizeMembershipCta(link: Link | undefined, componentKey?: string): Link | undefined {
  if (!link) return componentKey && requiredMembershipCtaSections.has(componentKey) ? communityCta() : undefined;
  if (link.href !== routes.memberships && !link.href.startsWith("/api/auth")) return link;
  return communityCta();
}
