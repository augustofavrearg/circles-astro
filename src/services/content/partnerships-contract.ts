import type { PartnershipsPage } from "@/domain/content";

export function requireCompletePartnershipsPage(page: Partial<PartnershipsPage>): PartnershipsPage {
  const requiredSections = ["seo", "intro", "partners", "membership", "faq"] as const;
  for (const key of requiredSections) {
    if (!page[key] || typeof page[key] !== "object") {
      throw new Error(`CHPages item "partnerships" is missing the required "partnerships.${key}" content.`);
    }
  }
  if (!page.intro?.cta) {
    throw new Error('CHPageSections item "partnerships.intro" requires a primary CTA.');
  }
  if (!page.membership?.primaryCta) {
    throw new Error('CHPageSections item "partnerships.membership" requires a primary CTA.');
  }
  if (!page.faq?.items.length) {
    throw new Error('CHPages item "partnerships" requires at least one FAQ.');
  }
  return page as PartnershipsPage;
}
