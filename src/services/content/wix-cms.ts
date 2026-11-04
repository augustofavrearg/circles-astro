import { items } from "@wix/data";
import type {
  AmbassadorsPage,
  ContentRepository,
  CoworkingPage,
  EventsPage,
  ForInvestorsPage,
  HomePage,
  LifePage,
  LocationPage,
  MembershipsPage,
  MonthPage,
  PartnershipsPage,
  TeamPage,
  WhatIsCirclesPage,
} from "@/domain/content";
import {
  asBoolean,
  asText,
  hasPersonType,
  mapCmsLink,
  mapDeal,
  mapEvent,
  mapRoom,
  mapSiteSettings,
  mapTeamMember,
  resolveCmsHref,
  wixGallery,
  wixUrl,
  type LocationLookup,
  type WixRecord,
} from "./wix-mappers";

export const COLLECTIONS = {
  siteSettings: "CHSiteSettings",
  interfaceCopy: "CHInterfaceCopy",
  pages: "CHPages",
  amenities: "CHAmenities",
  locations: "CHLocations",
  people: "CHPeople",
  stayPrograms: "CHStayPrograms",
  pageSections: "CHPageSections",
  sectionItems: "CHSectionItems",
  socialLinks: "CHSocialLinks",
  navigationItems: "CHNavigationItems",
  spaces: "CHSpaces",
  rooms: "CHRooms",
  events: "CHEvents",
  newsArticles: "CHNewsArticles",
  deals: "CHDeals",
  testimonials: "CHTestimonials",
  partners: "CHPartners",
  faqs: "CHFaqs",
  membershipPlans: "CHMembershipPlans",
  legalPages: "CHLegalPages",
} as const;

type PageIdentity = { pageKey?: string; routeKey?: string; routeParam?: string };

async function findOne(collectionId: string, field: string, value: string): Promise<WixRecord | undefined> {
  const result = await items.query(collectionId).eq(field, value).limit(1).find({ consistentRead: true });
  return result.items[0] as WixRecord | undefined;
}

async function getRequiredSingleton(collectionId: string, key = "global"): Promise<WixRecord> {
  const item = await findOne(collectionId, "key", key);
  if (!item) throw new Error(`Wix CMS collection "${collectionId}" does not contain the "${key}" singleton.`);
  return item;
}

async function getPublishedLocations(): Promise<WixRecord[]> {
  const result = await items.query(COLLECTIONS.locations).eq("published", true).ascending("sortOrder").limit(100).find({ consistentRead: true });
  return result.items as WixRecord[];
}

function buildLocationLookup(locations: WixRecord[]): LocationLookup {
  return new Map(
    locations.flatMap((location) => {
      const id = asText(location._id);
      const slug = asText(location.slug);
      if (!id || !slug) return [];
      return [[id, { slug, name: asText(location.name) || asText(location.shortName) || slug, timezone: asText(location.timezone) }]];
    }),
  );
}

function sectionName(section: WixRecord): string {
  const componentKey = asText(section.componentKey);
  if (componentKey) return componentKey.split(".").at(-1) || componentKey;
  return asText(section.sectionKey).split(".").at(-1) || "section";
}

function contentFields(record: WixRecord) {
  const image = wixUrl(record.image);
  const gallery = wixGallery(record.gallery);
  const link = mapCmsLink(record);
  return {
    label: asText(record.label),
    title: asText(record.title),
    subtitle: asText(record.subtitle),
    text: asText(record.text),
    value: asText(record.value),
    image: image || undefined,
    gallery,
    images: gallery,
    icon: asText(record.iconKey),
    iconKey: asText(record.iconKey),
    link,
    href: link?.href,
    highlighted: asBoolean(record.highlighted),
    wide: asBoolean(record.wide),
    size: asText(record.size) || undefined,
  };
}

function splitParagraphs(value: string): string[] {
  return value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

function composeSection(section: WixRecord, sectionItems: WixRecord[]): Record<string, unknown> {
  const primaryCta = mapCmsLink(section, "primary");
  const secondaryCta = mapCmsLink(section, "secondary");
  const body = asText(section.body);
  const gallery = wixGallery(section.gallery);
  const mappedItems = sectionItems.map(contentFields);
  const name = sectionName(section);
  const result: Record<string, unknown> = {
    eyebrow: asText(section.eyebrow),
    title: asText(section.title),
    subtitle: asText(section.subtitle),
    lead: asText(section.lead),
    body,
    text: body,
    description: body,
    note: asText(section.note) || undefined,
    image: wixUrl(section.image) || undefined,
    gallery,
    images: gallery,
    layoutVariant: asText(section.layoutVariant) || undefined,
    cta: primaryCta,
    primaryCta,
    secondaryCta,
    items: mappedItems,
  };

  if (name === "faq") {
    result.items = mappedItems.map((item) => ({
      question: item.title,
      answer: splitParagraphs(item.text).map((text) => ({ type: "paragraph" as const, text })),
    }));
  }
  if (name === "manifesto" || name === "manager") result.paragraphs = splitParagraphs(body);
  if (name === "partners") {
    result.items = sectionItems.map((item) => ({
      slug: asText(item.itemKey).split(".").at(-1) || asText(item._id),
      name: asText(item.title),
      description: asText(item.text),
      logo: wixUrl(item.image) || undefined,
      href: resolveCmsHref(item.routeKey, item.routeParam, item.anchor, item.externalUrl) || undefined,
      featured: asBoolean(item.highlighted),
    }));
  }
  return result;
}

function pageIdentityLabel({ pageKey, routeKey, routeParam }: PageIdentity): string {
  return pageKey ?? [routeKey, routeParam].filter(Boolean).join(":");
}

async function getPageRecord({ pageKey, routeKey, routeParam }: PageIdentity): Promise<WixRecord | undefined> {
  let query = items.query(COLLECTIONS.pages).eq("published", true).limit(1);
  if (pageKey) query = query.eq("pageKey", pageKey);
  if (routeKey) query = query.eq("routeKey", routeKey);
  if (routeParam) query = query.eq("routeParam", routeParam);
  const result = await query.find({ consistentRead: true });
  return result.items[0] as WixRecord | undefined;
}

async function composePage<T>(identity: PageIdentity, optional = false): Promise<T | undefined> {
  const { routeParam } = identity;
  const pageLabel = pageIdentityLabel(identity);
  const page = await getPageRecord(identity);
  if (!page) {
    if (optional) return undefined;
    throw new Error(`CHPages does not contain the published page "${pageLabel}".`);
  }
  const pageId = asText(page._id);
  if (!pageId) throw new Error(`CHPages item "${pageLabel}" has no _id.`);

  const sectionResult = await items
    .query(COLLECTIONS.pageSections)
    .eq("page", pageId)
    .eq("enabled", true)
    .ascending("sortOrder")
    .limit(100)
    .find({ consistentRead: true });
  const sections = sectionResult.items as WixRecord[];
  const sectionItems = await Promise.all(
    sections.map(async (section) => {
      const sectionId = asText(section._id);
      if (!sectionId) return [];
      const result = await items
        .query(COLLECTIONS.sectionItems)
        .eq("section", sectionId)
        .eq("published", true)
        .ascending("sortOrder")
        .limit(100)
        .find({ consistentRead: true });
      return result.items as WixRecord[];
    }),
  );

  const document: Record<string, unknown> = { seo: { title: asText(page.seoTitle), description: asText(page.seoDescription) } };
  if (routeParam) {
    document.slug = routeParam;
    document.city = routeParam;
  }
  sections.forEach((section, index) => {
    document[sectionName(section)] = composeSection(section, sectionItems[index]);
  });
  return document as T;
}

async function requirePage<T>(identity: PageIdentity): Promise<T> {
  const page = await composePage<T>(identity);
  if (!page) throw new Error(`Unable to compose Wix CMS page "${pageIdentityLabel(identity)}".`);
  return page;
}

export const wixCmsRepository: ContentRepository = {
  async getSiteSettings() {
    const [settings, socialResult] = await Promise.all([
      getRequiredSingleton(COLLECTIONS.siteSettings),
      items.query(COLLECTIONS.socialLinks).eq("published", true).ascending("sortOrder").limit(50).find({ consistentRead: true }),
    ]);
    return mapSiteSettings(settings, socialResult.items as WixRecord[]);
  },
  getHomePage: () => requirePage<HomePage>({ pageKey: "home" }),
  getAmbassadorsPage: () => requirePage<AmbassadorsPage>({ pageKey: "ambassadors" }),
  getPartnershipsPage: () => requirePage<PartnershipsPage>({ pageKey: "partnerships" }),
  getForInvestorsPage: () => requirePage<ForInvestorsPage>({ pageKey: "for-investors" }),
  getTeamPage: () => requirePage<TeamPage>({ pageKey: "team" }),
  getWhatIsCirclesPage: () => requirePage<WhatIsCirclesPage>({ pageKey: "what-is-circles" }),
  getMembershipsPage: () => requirePage<MembershipsPage>({ pageKey: "memberships" }),
  getLifePage: () => requirePage<LifePage>({ pageKey: "life-at-circles" }),
  getCoworkingPage: (city) => composePage<CoworkingPage>({ routeKey: "coworking", routeParam: city }, true),
  getLocationPage: (slug) => composePage<LocationPage>({ routeKey: "location", routeParam: slug }, true),
  getMonthPage: (slug) => composePage<MonthPage>({ routeKey: "month", routeParam: slug }, true),
  async getTeamMembers() {
    const result = await items.query(COLLECTIONS.people).eq("published", true).ascending("sortOrder").limit(100).find({ consistentRead: true });
    return (result.items as WixRecord[]).filter((item) => hasPersonType(item, "team")).map(mapTeamMember);
  },
  async getEventsPage() {
    const [page, locations] = await Promise.all([requirePage<EventsPage>({ pageKey: "events" }), getPublishedLocations()]);
    const cities = locations.map((location) => ({ slug: asText(location.slug), name: asText(location.shortName) || asText(location.city) }));
    return {
      ...page,
      cities,
      eyebrows: page.eyebrows ?? Object.fromEntries([["all", "Happening now"], ...cities.map((city) => [city.slug, `Happening now in ${city.name}`])]),
    };
  },
  async getEvents(city) {
    const locations = await getPublishedLocations();
    const lookup = buildLocationLookup(locations);
    let query = items.query(COLLECTIONS.events).eq("published", true).ascending("sortOrder").limit(100);
    if (city) {
      const location = locations.find((item) => asText(item.slug) === city);
      if (!location) return [];
      query = query.eq("location", asText(location._id));
    }
    const result = await query.find({ consistentRead: true });
    return (result.items as WixRecord[]).map((item) => mapEvent(item, lookup));
  },
  async getDeals() {
    const result = await items.query(COLLECTIONS.deals).eq("published", true).ascending("sortOrder").limit(50).find({ consistentRead: true });
    return (result.items as WixRecord[]).map(mapDeal);
  },
  async getRooms(location) {
    const locations = await getPublishedLocations();
    const lookup = buildLocationLookup(locations);
    let query = items.query(COLLECTIONS.rooms).eq("published", true).ascending("sortOrder").limit(100);
    if (location) {
      const locationItem = locations.find((item) => asText(item.slug) === location);
      if (!locationItem) return [];
      query = query.eq("location", asText(locationItem._id));
    }
    const result = await query.find({ consistentRead: true });
    return (result.items as WixRecord[]).map((item) => mapRoom(item, lookup));
  },
};
