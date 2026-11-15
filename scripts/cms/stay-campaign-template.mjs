export const stayCampaignTemplatePage = {
  pageKey: "stay-campaign-template",
  pageType: "month",
  routeKey: "month",
  seoTitle: "Stay at Circles House",
  seoDescription: "Explore rooms, spaces and community events for a Circles House stay.",
  noIndex: true,
  published: true,
};

export const stayCampaignTemplateSections = [
  ["hero", "A month of new experiences"],
  ["form", "Start your stay here"],
  ["space", "Modern private lofts and shared spaces to live, work & play."],
  ["rooms", "A room for your needs"],
  ["band", "Stay longer and save more"],
  ["events", "What you will say yes to"],
  ["faq", "What you need to know"],
].map(([key, title]) => ({
  sectionKey: `stay-campaign.${key}`,
  componentKey: `month.${key}`,
  title,
  enabled: true,
}));

export const legacyJuneKeys = {
  page: "june",
  sections: ["hero", "form", "space", "rooms", "band", "events", "external", "seasonal", "faq"]
    .map((key) => `june.${key}`),
  items: [
    "june.external.sonar",
    "june.external.design-week",
    "june.external.grec",
    "june.seasonal.rooftop",
    "june.seasonal.founders",
    "june.seasonal.midsummer",
  ],
};
