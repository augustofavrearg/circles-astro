export const embeddedDealsPage = {
  pageKey: "deals",
  pageType: "static",
  routeKey: "deals",
  seoTitle: "Deals · Circles House",
  seoDescription: "Current Circles House offers for coliving and coworking stays in Barcelona and Andorra.",
  noIndex: true,
  published: true,
};

export const embeddedEntitySections = [
  {
    sectionKey: "partnerships.partners",
    pageKey: "partnerships",
    componentKey: "partnerships.partners",
    sourceMode: "automatic",
    sourceKey: "partners.published",
    eyebrow: "Why join",
    title: "Why partner with Circles?",
    subtitle: "Partner of the month",
  },
  {
    sectionKey: "deals.list",
    pageKey: "deals",
    componentKey: "deals.list",
    sourceMode: "automatic",
    sourceKey: "deals.active",
    eyebrow: "Current offers",
    title: "Stay longer, experience more.",
    body: "There are no deals available right now.",
  },
];
