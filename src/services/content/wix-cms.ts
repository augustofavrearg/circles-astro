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
  ProgramPage,
  RoomsPage,
  SpaceAmenity,
  TeamPage,
  WhatIsCirclesPage,
} from "@/domain/content";
import {
  asBoolean,
  asDateOnly,
  asText,
  hasPersonType,
  isCurrentOrUpcomingEvent,
  mapCmsLink,
  mapCoworkingAmenityIcon,
  mapDeal,
  mapEvent,
  mapFaq,
  mapLegalPage,
  mapMembershipPlan,
  mapNavigationItem,
  mapNewsArticle,
  mapNewsItem,
  mapPartner,
  mapRoom,
  mapSiteSettings,
  mapSpace,
  mapTeamMember,
  referenceId,
  resolveCmsHref,
  validateEventProgramReference,
  wixGallery,
  wixUrl,
  type LocationLookup,
  type WixRecord,
} from "./wix-mappers";
import { siteNavigation } from "@/config/navigation";
import type { NavigationItem, SiteNavigation } from "@/domain/navigation";

export const COLLECTIONS = {
  siteSettings: "CHSiteSettings",
  interfaceCopy: "CHInterfaceCopy",
  pages: "CHPages",
  amenities: "CHAmenities",
  locations: "CHLocations",
  people: "CHPeople",
  programs: "CHPrograms",
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
type EventsPageDocument = Partial<EventsPage> & {
  intro?: { title?: string; subtitle?: string };
};

const CMS_CACHE_TTL_MS = 30_000;
const cmsCache = new Map<string, { expiresAt: number; value: Promise<unknown> }>();

function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const existing = cmsCache.get(key);
  if (existing && existing.expiresAt > now) return existing.value as Promise<T>;

  const value = loader().catch((error) => {
    cmsCache.delete(key);
    throw error;
  });
  cmsCache.set(key, { expiresAt: now + CMS_CACHE_TTL_MS, value });
  return value;
}

async function queryPublished(collectionId: string, limit = 100, sortField: string | undefined = "sortOrder"): Promise<WixRecord[]> {
  return cached(`published:${collectionId}:${limit}:${sortField ?? "none"}`, async () => {
    let query = items
      .query(collectionId)
      .eq("published", true)
      .limit(limit);
    if (sortField) query = query.ascending(sortField);
    const result = await query.find({ consistentRead: true });
    return result.items as WixRecord[];
  });
}

async function queryReferences(collectionId: string, item: WixRecord, field: string): Promise<WixRecord[]> {
  const itemId = asText(item._id);
  if (!itemId) return [];
  return cached(`references:${collectionId}:${itemId}:${field}`, async () => {
    const result = await items.queryReferenced(collectionId, itemId, field, { consistentRead: true });
    return result.items as WixRecord[];
  });
}

async function findOne(collectionId: string, field: string, value: string): Promise<WixRecord | undefined> {
  return cached(`one:${collectionId}:${field}:${value}`, async () => {
    const result = await items.query(collectionId).eq(field, value).limit(1).find({ consistentRead: true });
    return result.items[0] as WixRecord | undefined;
  });
}

async function getRequiredSingleton(collectionId: string, key = "global"): Promise<WixRecord> {
  const item = await findOne(collectionId, "key", key);
  if (!item) throw new Error(`Wix CMS collection "${collectionId}" does not contain the "${key}" singleton.`);
  return item;
}

async function getPublishedLocations(): Promise<WixRecord[]> {
  return queryPublished(COLLECTIONS.locations);
}

function amenityLabels(records: WixRecord[]): string[] {
  return [...records]
    .filter((amenity) => asBoolean(amenity.published))
    .sort((left, right) => Number(left.sortOrder ?? 0) - Number(right.sortOrder ?? 0))
    .map((amenity) => asText(amenity.label))
    .filter((label, index, labels) => Boolean(label) && labels.indexOf(label) === index);
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
  const componentKey = asText(section.componentKey);
  const primaryCta = mapCmsLink(section, "primary");
  const secondaryCta = mapCmsLink(section, "secondary");
  const body = asText(section.body);
  const image = wixUrl(section.image);
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
    image: image || undefined,
    gallery,
    images: gallery,
    layoutVariant: asText(section.layoutVariant) || undefined,
    cta: primaryCta,
    primaryCta,
    secondaryCta,
    items: mappedItems,
  };

  if (componentKey === "home.hero") {
    const videoSrc = wixUrl(section.primaryExternalUrl);
    return {
      title: asText(section.title),
      description: body || asText(section.lead),
      ...(image || videoSrc
        ? {
            video: {
              label: asText(section.primaryCtaLabel) || asText(section.subtitle) || "Discover Circles House",
              poster: image || undefined,
              src: videoSrc || undefined,
            },
          }
        : {}),
    };
  }

  if (componentKey === "home.network") {
    return { eyebrow: asText(section.eyebrow), title: asText(section.title), spaces: [] };
  }

  if (componentKey === "home.happeningNow") {
    return {
      eyebrow: asText(section.eyebrow),
      title: asText(section.title),
      cities: [],
      viewAll: primaryCta,
      events: [],
    };
  }

  if (componentKey === "home.memberships") {
    return {
      eyebrow: asText(section.eyebrow),
      title: asText(section.title),
      description: body,
      cta: primaryCta,
      highlights: sectionItems.map((item) => asText(item.title) || asText(item.label)).filter(Boolean),
      image: image || undefined,
      thumbnail: gallery[0] || undefined,
    };
  }

  if (componentKey === "home.introduction") {
    return {
      title: asText(section.title),
      highlight: asText(section.subtitle),
      intro: asText(section.lead),
      body,
      cta: primaryCta,
      images: {
        main: image || undefined,
        left: gallery[0] || undefined,
        right: gallery[1] || undefined,
      },
    };
  }

  if (componentKey === "home.news") {
    return { eyebrow: asText(section.eyebrow), title: asText(section.title), items: [] };
  }

  if (componentKey === "memberships.intro") {
    return {
      eyebrow: asText(section.eyebrow),
      title: asText(section.title),
      body,
      cta: primaryCta,
      secondaryCta,
      image: image || undefined,
    };
  }

  if (componentKey === "memberships.benefits") {
    return {
      eyebrow: asText(section.eyebrow),
      title: asText(section.title),
      image: image || undefined,
      items: sectionItems.map((item) => ({ title: asText(item.title), text: asText(item.text) })),
    };
  }

  if (componentKey === "memberships.hub") {
    const topics = sectionItems.filter((item) => !asText(item.iconKey));
    const stats = sectionItems.filter((item) => asText(item.iconKey));
    return {
      eyebrow: asText(section.eyebrow),
      title: asText(section.title),
      subtitle: asText(section.subtitle),
      topics: topics.map((item) => asText(item.title)).filter(Boolean),
      text: body,
      images: gallery,
      stats: stats.map((item) => ({ icon: asText(item.iconKey), label: asText(item.label) })),
    };
  }

  if (componentKey === "memberships.pricing") {
    return {
      eyebrow: asText(section.eyebrow),
      title: asText(section.title),
      features: sectionItems.map((item) => asText(item.title)).filter(Boolean),
      plans: [],
      cta: primaryCta,
      secondaryCta,
      images: gallery,
    };
  }

  if (componentKey === "memberships.members") {
    return { eyebrow: asText(section.eyebrow), title: asText(section.title), items: [] };
  }

  if (componentKey === "location.hero") {
    const amenities = sectionItems
      .map((item) => asText(item.iconKey))
      .filter((amenity): amenity is SpaceAmenity => amenity === "coliving" || amenity === "coworking");
    return {
      eyebrow: asText(section.eyebrow),
      title: asText(section.title),
      image: image || undefined,
      card: {
        eyebrow: asText(section.lead),
        title: asText(section.subtitle),
        text: body,
        cta: primaryCta,
        amenities,
      },
    };
  }

  if (componentKey === "location.space") {
    return {
      title: asText(section.title),
      text: body,
      amenitiesLabel: asText(section.lead),
      amenities: [],
      image: image || undefined,
    };
  }

  if (componentKey === "coworking.pricing") {
    return {
      eyebrow: asText(section.eyebrow),
      title: asText(section.title),
      includesLabel: asText(section.lead) || "Includes access to:",
      plans: sectionItems.map((item) => ({
        title: asText(item.title),
        subtitle: asText(item.subtitle),
        includes: splitParagraphs(asText(item.text)),
        price: asText(item.value),
        highlighted: asBoolean(item.highlighted),
        cta: mapCmsLink(item),
      })),
    };
  }

  if (componentKey === "month.hero") {
    return {
      eyebrow: asText(section.eyebrow),
      title: asText(section.title),
      body,
      cta: primaryCta,
      image: image || undefined,
    };
  }

  if (componentKey === "month.form") {
    return {
      eyebrow: asText(section.eyebrow),
      title: asText(section.title),
      subtitle: asText(section.subtitle),
      image: image || undefined,
    };
  }

  if (componentKey === "month.external" || componentKey === "month.seasonal") {
    return {
      eyebrow: asText(section.eyebrow),
      title: asText(section.title),
      items: sectionItems.map((item) => ({
        title: asText(item.title),
        venue: asText(item.text),
        dateLabel: asText(item.label),
        timeLabel: asText(item.value),
        image: wixUrl(item.image) || undefined,
        href: resolveCmsHref(item.routeKey, item.routeParam, item.anchor, item.externalUrl) || undefined,
      })),
    };
  }

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
  return Object.fromEntries(
    Object.entries(result).filter(([, value]) => value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0)),
  );
}

function pageIdentityLabel({ pageKey, routeKey, routeParam }: PageIdentity): string {
  return pageKey ?? [routeKey, routeParam].filter(Boolean).join(":");
}

async function getPageRecord({ pageKey, routeKey, routeParam }: PageIdentity): Promise<WixRecord | undefined> {
  return cached(`page:${pageKey ?? ""}:${routeKey ?? ""}:${routeParam ?? ""}`, async () => {
    let query = items.query(COLLECTIONS.pages).eq("published", true).limit(1);
    if (pageKey) query = query.eq("pageKey", pageKey);
    if (routeKey) query = query.eq("routeKey", routeKey);
    if (routeParam) query = query.eq("routeParam", routeParam);
    const result = await query.find({ consistentRead: true });
    return result.items[0] as WixRecord | undefined;
  });
}

async function getFaqsForPage(page: WixRecord): Promise<ReturnType<typeof mapFaq>[]> {
  const pageId = asText(page._id);
  if (!pageId) return [];
  const faqs = await queryPublished(COLLECTIONS.faqs);
  const matches = await Promise.all(
    faqs.map(async (faq) => {
      const pages = await queryReferences(COLLECTIONS.faqs, faq, "pages");
      return pages.some((candidate) => asText(candidate._id) === pageId) ? mapFaq(faq) : undefined;
    }),
  );
  return matches.filter((faq): faq is ReturnType<typeof mapFaq> => Boolean(faq));
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
  const faqs = await getFaqsForPage(page);
  if (faqs.length > 0) {
    const currentFaq = document.faq && typeof document.faq === "object" ? document.faq as Record<string, unknown> : {};
    document.faq = {
      eyebrow: asText(currentFaq.eyebrow) || "FAQ",
      title: asText(currentFaq.title) || "What you need to know",
      ...currentFaq,
      items: faqs,
    };
  }
  return document as T;
}

async function requirePage<T>(identity: PageIdentity): Promise<T> {
  const page = await composePage<T>(identity);
  if (!page) throw new Error(`Unable to compose Wix CMS page "${pageIdentityLabel(identity)}".`);
  return page;
}

function navigationArea(item: WixRecord): string {
  return asText(item.area).toLowerCase().replaceAll(/[-_\s]/g, "");
}

function buildNavigation(records: WixRecord[]): SiteNavigation {
  const byParent = Map.groupBy(records, (item) => asText(item.parentKey));
  const mapTree = (item: WixRecord): NavigationItem =>
    mapNavigationItem(item, (byParent.get(asText(item.itemKey)) ?? []).map(mapTree));
  const roots = records.filter((item) => !asText(item.parentKey));
  const inAreas = (...areas: string[]) => roots.filter((item) => areas.includes(navigationArea(item))).map(mapTree);
  const primary = inAreas("headerprimary", "header");
  const headerLocations = inAreas("headerlocations");
  const derivedLocations = roots
    .filter((item) => asText(item.routeKey) === "location")
    .map(mapTree);
  const actions = inAreas("headeraction");
  const findAction = (key: string) => {
    const record = roots.find((item) => navigationArea(item) === "headeraction" && asText(item.itemKey).toLowerCase().includes(key));
    return record ? mapTree(record) : undefined;
  };
  const footerMain = inAreas("footermain");
  const footerExtras = inAreas("footerextras", "footer");
  const footerLegal = inAreas("footerlegal");

  return {
    header: {
      locations: headerLocations.length ? headerLocations : derivedLocations.length ? derivedLocations : siteNavigation.header.locations,
      primary: primary.length ? primary : siteNavigation.header.primary,
      actions: {
        login: findAction("login") ?? siteNavigation.header.actions.login,
        book: findAction("book") ?? actions[0] ?? siteNavigation.header.actions.book,
      },
    },
    footer: {
      main: footerMain.length ? footerMain : siteNavigation.footer.main,
      extras: footerExtras.length ? footerExtras : siteNavigation.footer.extras,
      legal: footerLegal.length ? footerLegal : siteNavigation.footer.legal,
    },
  };
}

async function loadCmsHomePage(): Promise<HomePage> {
  const [composedPage, locations, spaces, eventRecords, testimonials, newsRecords] = await Promise.all([
    requirePage<Partial<HomePage>>({ pageKey: "home" }),
    getPublishedLocations(),
    queryPublished(COLLECTIONS.spaces),
    queryPublished(COLLECTIONS.events, 100, "homeSortOrder"),
    queryPublished(COLLECTIONS.testimonials, 100, "homeSortOrder"),
    queryPublished(COLLECTIONS.newsArticles, 100, "homeSortOrder"),
  ]);
  const page = requireCompleteHomePage(composedPage);
  const locationById = new Map(locations.map((location) => [asText(location._id), location]));
  const locationLookup = buildLocationLookup(locations);
  const featuredSpaces = spaces
    .filter((space) => asBoolean(space.featuredHome))
    .sort((left, right) => Number(left.homeSortOrder ?? 0) - Number(right.homeSortOrder ?? 0))
    .map((space) => mapSpace(space, locationById.get(referenceId(space.location))));
  const featuredEvents = eventRecords
    .filter((event) => asBoolean(event.featuredHome) && isCurrentOrUpcomingEvent(event))
    .map((event) => mapEvent(event, locationLookup));
  const featuredTestimonials = testimonials.filter((testimonial) => asBoolean(testimonial.featuredHome));
  const featuredNews = newsRecords.filter((article) => asBoolean(article.featuredHome)).map(mapNewsItem);
  const locationCards = locations
    .filter((location) => asBoolean(location.featuredHome))
    .sort((left, right) => Number(left.homeSortOrder ?? 0) - Number(right.homeSortOrder ?? 0));

  return {
    ...page,
    slider: locationCards.map((location) => ({
      name: asText(location.name),
      address: asText(location.address),
      href: `/locations/${encodeURIComponent(asText(location.slug))}`,
      image: wixUrl(location.cardImage) || wixUrl(location.heroImage) || undefined,
      access: asText(location.accessLabel) || undefined,
    })),
    searchLocations: locations.map((location) => ({
      slug: asText(location.slug),
      name: asText(location.name),
      city: asText(location.city),
      comingSoon: asText(location.status).toLowerCase().replaceAll("-", "") === "comingsoon",
      image: wixUrl(location.cardImage) || undefined,
    })),
    network: { ...page.network, spaces: featuredSpaces },
    happeningNow: {
      ...page.happeningNow,
      cities: locations.map((location) => asText(location.slug)).filter(Boolean),
      events: featuredEvents.map((event) => ({
        title: event.title,
        description: event.subtitle ?? "",
        access: "",
        month: event.month,
        day: event.day,
        dateLabel: event.dateLabel,
        timeLabel: event.timeLabel,
        image: event.image,
        city: event.city,
        cta: event.href ? { label: "Learn more", href: event.href } : undefined,
      })),
    },
    testimonials: featuredTestimonials.map((item) => ({
      quote: asText(item.quote),
      author: asText(item.authorName),
      source: asText(item.sourceLabel),
      href: wixUrl(item.sourceUrl) || undefined,
    })),
    news: {
      ...page.news,
      items: featuredNews,
    },
  };
}

function requireCompleteHomePage(page: Partial<HomePage>): HomePage {
  const requiredSections = ["seo", "hero", "network", "happeningNow", "memberships", "introduction", "news"] as const;
  for (const key of requiredSections) {
    if (!page[key] || typeof page[key] !== "object") {
      throw new Error(`CHPages item "home" is missing the required "home.${key}" content.`);
    }
  }
  if (!page.memberships?.cta) throw new Error('CHPageSections item "home.memberships" requires a primary CTA.');
  if (!page.introduction?.cta) throw new Error('CHPageSections item "home.introduction" requires a primary CTA.');
  if (!page.happeningNow?.viewAll) throw new Error('CHPageSections item "home.happeningNow" requires a primary CTA.');
  return page as HomePage;
}

function requireCompleteCoworkingPage(page: Partial<CoworkingPage>, city: string): CoworkingPage {
  const requiredSections = ["seo", "hero", "spaces", "pricing", "band", "faq"] as const;
  for (const key of requiredSections) {
    if (!page[key] || typeof page[key] !== "object") {
      throw new Error(`CHPages item "coworking:${city}" is missing the required "coworking.${key}" content.`);
    }
  }
  if (!page.spaces?.items.length) throw new Error(`CHSpaces does not contain a published coworking space for "${city}".`);
  if (!page.pricing?.plans.length) throw new Error(`CHPageSections item "coworking-${city}.pricing" requires published plans.`);
  if (!page.faq?.items.length) throw new Error(`CHPages item "coworking:${city}" requires at least one related FAQ.`);
  return page as CoworkingPage;
}

function requireCompleteMembershipsPage(page: Partial<MembershipsPage>): MembershipsPage {
  const requiredSections = ["seo", "intro", "benefits", "hub", "pricing", "members", "band", "faq"] as const;
  for (const key of requiredSections) {
    if (!page[key] || typeof page[key] !== "object") {
      throw new Error(`CHPages item "memberships" is missing the required "memberships.${key}" content.`);
    }
  }
  if (!page.intro?.cta) throw new Error('CHPageSections item "memberships.intro" requires a primary CTA.');
  if (!page.pricing?.plans.length) throw new Error("CHMembershipPlans requires at least one published plan.");
  if (!page.members?.items.length) throw new Error('CHPeople requires at least one published person with personTypes including "member".');
  if (!page.faq?.items.length) throw new Error('CHPages item "memberships" requires at least one related FAQ.');
  return page as MembershipsPage;
}

function requireCompleteLocationPage(page: Partial<LocationPage>, slug: string): LocationPage {
  const requiredSections = ["seo", "hero", "space", "rooms", "band", "experiences", "location", "manager", "faq"] as const;
  for (const key of requiredSections) {
    if (!page[key] || typeof page[key] !== "object") {
      throw new Error(`CHPages item "location:${slug}" is missing the required "location.${key}" content.`);
    }
  }
  if (!page.hero?.card || typeof page.hero.card !== "object") {
    throw new Error(`CHPageSections item "location-${slug}.hero" requires the location hero card content.`);
  }
  if (!page.hero.card.amenities.length) {
    throw new Error(`CHPageSections item "location-${slug}.hero" requires at least one published hero amenity.`);
  }
  if (!page.space?.amenities.length) {
    throw new Error(`CHLocations item "${slug}" requires at least one related amenity.`);
  }
  if (!page.band?.primaryCta) {
    throw new Error(`CHPageSections item "location-${slug}.band" requires a primary CTA.`);
  }
  if (!page.experiences?.items.length) {
    throw new Error(`CHPageSections item "location-${slug}.experiences" requires at least one published item.`);
  }
  if (!page.manager?.paragraphs.length) {
    throw new Error(`CHPageSections item "location-${slug}.manager" requires manager copy or a related house manager.`);
  }
  if (!page.faq?.items.length) {
    throw new Error(`CHPages item "location:${slug}" requires at least one related FAQ.`);
  }
  return page as LocationPage;
}

function requireCompleteMonthPage(page: Partial<MonthPage>, slug: string): MonthPage {
  const requiredSections = ["seo", "hero", "form", "space", "rooms", "band", "events", "external", "seasonal", "faq"] as const;
  for (const key of requiredSections) {
    if (!page[key] || typeof page[key] !== "object") {
      throw new Error(`CHPages item "month:${slug}" is missing the required "month.${key}" content.`);
    }
  }
  if (!page.hero?.cta) throw new Error(`CHPageSections item "${slug}.hero" requires a primary CTA.`);
  if (!page.space?.spaces.length) throw new Error(`CHPages item "month:${slug}" requires at least one published space.`);
  if (!page.external?.items.length) throw new Error(`CHPageSections item "${slug}.external" requires at least one published item.`);
  if (!page.seasonal?.items.length) throw new Error(`CHPageSections item "${slug}.seasonal" requires at least one published item.`);
  if (!page.faq?.items.length) throw new Error(`CHPages item "month:${slug}" requires at least one related FAQ.`);
  return page as MonthPage;
}

function getCmsHomePage(): Promise<HomePage> {
  return cached("document:home", loadCmsHomePage);
}

async function loadSiteSettings() {
  const [settings, socialResult, copyResult, navigation] = await Promise.all([
    getRequiredSingleton(COLLECTIONS.siteSettings),
    items.query(COLLECTIONS.socialLinks).eq("published", true).ascending("sortOrder").limit(50).find({ consistentRead: true }),
    items.query(COLLECTIONS.interfaceCopy).limit(500).find({ consistentRead: true }),
    queryPublished(COLLECTIONS.navigationItems),
  ]);
  return {
    ...mapSiteSettings(settings, socialResult.items as WixRecord[]),
    interfaceCopy: Object.fromEntries(
      (copyResult.items as WixRecord[]).map((item) => [asText(item.copyKey), asText(item.value)]).filter(([key]) => Boolean(key)),
    ),
    navigation: buildNavigation(navigation),
  };
}

export const wixCmsRepository: ContentRepository = {
  async getSiteSettings() {
    return cached("document:site-settings", loadSiteSettings);
  },
  getHomePage: getCmsHomePage,
  getRoomsPage: () => requirePage<RoomsPage>({ pageKey: "rooms" }),
  async getSearchLocations() {
    return (await getPublishedLocations()).map((location) => ({
      slug: asText(location.slug),
      name: asText(location.name),
      city: asText(location.city) || asText(location.shortName),
      comingSoon: asText(location.status).toLowerCase().replaceAll("-", "") === "comingsoon",
      image: wixUrl(location.cardImage) || undefined,
    }));
  },
  getAmbassadorsPage: () => requirePage<AmbassadorsPage>({ pageKey: "ambassadors" }),
  async getPartnershipsPage() {
    const [page, partners] = await Promise.all([
      requirePage<PartnershipsPage>({ pageKey: "partnerships" }),
      queryPublished(COLLECTIONS.partners),
    ]);
    return {
      ...page,
      partners: { ...page.partners, items: partners.map(mapPartner) },
    };
  },
  getForInvestorsPage: () => requirePage<ForInvestorsPage>({ pageKey: "for-investors" }),
  getTeamPage: () => requirePage<TeamPage>({ pageKey: "team" }),
  getWhatIsCirclesPage: () => requirePage<WhatIsCirclesPage>({ pageKey: "what-is-circles" }),
  async getMembershipsPage() {
    const [page, plans, people] = await Promise.all([
      requirePage<Partial<MembershipsPage>>({ pageKey: "memberships" }),
      queryPublished(COLLECTIONS.membershipPlans),
      queryPublished(COLLECTIONS.people),
    ]);
    return requireCompleteMembershipsPage({
      ...page,
      pricing: { ...page.pricing!, plans: plans.map(mapMembershipPlan) },
      members: {
        ...page.members!,
        items: people.filter((person) => hasPersonType(person, "member")).map((person) => ({
          name: asText(person.name),
          bio: asText(person.bio),
          photo: wixUrl(person.photo) || undefined,
        })),
      },
    });
  },
  getLifePage: () => requirePage<LifePage>({ pageKey: "life-at-circles" }),
  async getCoworkingPage(city) {
    const composed = await composePage<Partial<CoworkingPage>>({ routeKey: "coworking", routeParam: city }, true);
    if (!composed) return undefined;
    const locations = await getPublishedLocations();
    const location = locations.find((item) => asText(item.slug) === city);
    if (!location) return undefined;
    const spaces = (await queryPublished(COLLECTIONS.spaces)).filter(
      (space) =>
        referenceId(space.location) === asText(location._id) &&
        asText(space.spaceType).toLowerCase() === "coworking" &&
        asText(space.status).toLowerCase() !== "hidden",
    );
    const amenities = (await Promise.all(spaces.map((space) => queryReferences(COLLECTIONS.spaces, space, "amenities")))).flat();
    return requireCompleteCoworkingPage({
      ...composed,
      spaces: {
        eyebrow: composed.spaces?.eyebrow ?? "",
        cta: composed.spaces?.cta,
        items: spaces.map((space) => ({
          title: asText(space.title),
          text: asText(space.description),
          images: [wixUrl(space.image), ...wixGallery(space.gallery)].filter(Boolean),
        })),
        amenities: [...new Map(amenities.map((amenity) => [asText(amenity.amenityKey), amenity])).values()].map((amenity) => ({
          icon: mapCoworkingAmenityIcon(amenity.iconKey),
          label: asText(amenity.label),
        })),
      },
    }, city);
  },
  async getLocationPage(slug) {
    const composed = await composePage<Partial<LocationPage>>({ routeKey: "location", routeParam: slug }, true);
    if (!composed) return undefined;
    const location = (await getPublishedLocations()).find((item) => asText(item.slug) === slug);
    if (!location) return undefined;
    const locationId = asText(location._id);
    const amenities = amenityLabels(await queryReferences(COLLECTIONS.locations, location, "amenities"));
    const managers = (await queryPublished(COLLECTIONS.people)).filter(
      (person) => referenceId(person.location) === locationId && hasPersonType(person, "house-manager"),
    );
    const manager = managers[0];
    return requireCompleteLocationPage({
      ...composed,
      hero: {
        ...composed.hero!,
        title: asText(location.name) || composed.hero?.title || "",
        image: wixUrl(location.heroImage) || composed.hero?.image,
        card: {
          ...composed.hero?.card!,
          access: asText(location.accessLabel) || composed.hero?.card?.access,
        },
      },
      space: { ...composed.space!, amenities },
      location: {
        ...composed.location!,
        mapImage: wixUrl(location.mapImage) || composed.location?.mapImage,
        mapHref: wixUrl(location.mapUrl) || composed.location?.mapHref,
      },
      manager: manager
        ? {
            ...composed.manager!,
            title: `Hi, I'm ${asText(manager.name)}, ${asText(manager.role).toLowerCase()}.`,
            paragraphs: [asText(manager.bio)].filter(Boolean),
            image: wixUrl(manager.photo) || undefined,
          }
        : composed.manager,
    }, slug);
  },
  async getMonthPage(slug) {
    const identity = { routeKey: "month", routeParam: slug };
    const [composed, pageRecord] = await Promise.all([
      composePage<Partial<MonthPage>>(identity, true),
      getPageRecord(identity),
    ]);
    if (!composed || !pageRecord) return undefined;
    const page = composed as MonthPage;
    const pageId = asText(pageRecord._id);
    if (!pageId) throw new Error(`CHPages item "${slug}" has no _id.`);

    // A monthly page and an event program have independent identities. The
    // optional page reference connects them without requiring matching slugs.
    const program = await findOne(COLLECTIONS.programs, "page", pageId);
    if (!program) throw new Error(`Monthly page "${slug}" is not connected to a CHPrograms item with a location.`);
    const locations = await getPublishedLocations();
    const location = locations.find((item) => asText(item._id) === referenceId(program.location));
    if (!location) throw new Error(`CHPrograms item "${asText(program.slug)}" has no valid CHLocations reference.`);
    const locationId = asText(location._id);
    const spaces = (await queryPublished(COLLECTIONS.spaces))
      .filter((space) => referenceId(space.location) === locationId && asText(space.status).toLowerCase() !== "hidden")
      .slice(0, 3)
      .map((space, index) => ({
        ...mapSpace(space, location),
        size: (["large", "medium", "small"] as const)[index] ?? "small",
      }));
    return requireCompleteMonthPage({
      ...page,
      city: asText(location.slug),
      space: { ...page.space!, spaces },
    }, slug);
  },
  async getProgramPage(slug) {
    const program = await findOne(COLLECTIONS.programs, "slug", slug);
    if (!program || !asBoolean(program.published)) return undefined;

    const locations = await getPublishedLocations();
    const lookup = buildLocationLookup(locations);
    const locationId = referenceId(program.location);
    const location = locations.find((item) => asText(item._id) === locationId);
    const programId = asText(program._id);
    const name = asText(program.name);
    if (!programId || !name || !location) {
      throw new Error(`CHPrograms item "${slug}" is missing _id, name or a valid CHLocations reference.`);
    }

    const result = await items
      .query(COLLECTIONS.events)
      .eq("published", true)
      .eq("program", programId)
      .ascending("sortOrder")
      .limit(100)
      .find({ consistentRead: true });
    const events = (result.items as WixRecord[]).map((event) => {
      validateEventProgramReference(event, new Map([[programId, program]]));
      return mapEvent(event, lookup);
    });
    const locationName = asText(location.name) || asText(location.shortName) || asText(location.city);
    const theme = asText(program.theme);
    const startsOn = asDateOnly(program.startsOn);
    const endsOn = asDateOnly(program.endsOn);
    return {
      slug,
      name,
      theme,
      city: asText(location.slug),
      locationName,
      startsOn,
      endsOn,
      registrationEnabled: asBoolean(program.registrationEnabled),
      seo: {
        title: `${name} · ${locationName}`,
        description: theme || `Explore the events connected to ${name} at ${locationName}.`,
      },
      events,
    } satisfies ProgramPage;
  },
  async getTeamMembers() {
    const result = await items.query(COLLECTIONS.people).eq("published", true).ascending("sortOrder").limit(100).find({ consistentRead: true });
    return (result.items as WixRecord[]).filter((item) => hasPersonType(item, "team")).map(mapTeamMember);
  },
  async getEventsPage() {
    const [document, locations] = await Promise.all([
      requirePage<EventsPageDocument>({ pageKey: "events" }),
      getPublishedLocations(),
    ]);
    const cities = locations.map((location) => ({ slug: asText(location.slug), name: asText(location.shortName) || asText(location.city) }));
    const title = asText(document.intro?.title) || asText(document.title);
    if (!title) throw new Error('CHPageSections item "events.intro" requires a title.');
    return {
      title,
      subtitle: asText(document.intro?.subtitle) || asText(document.subtitle),
      cities,
      eyebrows:
        document.eyebrows ??
        Object.fromEntries([["all", "Happening now"], ...cities.map((city) => [city.slug, `Happening now in ${city.name}`])]),
    };
  },
  async getEvents(city) {
    const [locations, programs] = await Promise.all([
      getPublishedLocations(),
      queryPublished(COLLECTIONS.programs),
    ]);
    const lookup = buildLocationLookup(locations);
    const programsById = new Map(programs.map((program) => [asText(program._id), program]));
    let query = items.query(COLLECTIONS.events).eq("published", true).ascending("sortOrder").limit(100);
    if (city) {
      const location = locations.find((item) => asText(item.slug) === city);
      if (!location) return [];
      query = query.eq("location", asText(location._id));
    }
    const result = await query.find({ consistentRead: true });
    const eventRecords = result.items as WixRecord[];
    eventRecords.forEach((event) => validateEventProgramReference(event, programsById));
    return eventRecords
      .filter((item) => isCurrentOrUpcomingEvent(item))
      .map((item) => mapEvent(item, lookup));
  },
  async getDeals() {
    const result = await items.query(COLLECTIONS.deals).eq("published", true).ascending("sortOrder").limit(50).find({ consistentRead: true });
    return (result.items as WixRecord[]).map(mapDeal);
  },
  async getRooms(location) {
    const locations = await getPublishedLocations();
    const lookup = buildLocationLookup(locations);
    const locationAmenities = new Map(
      await Promise.all(
        locations.map(async (locationItem) => [
          asText(locationItem._id),
          amenityLabels(await queryReferences(COLLECTIONS.locations, locationItem, "amenities")),
        ] as const),
      ),
    );
    let query = items.query(COLLECTIONS.rooms).eq("published", true).ascending("sortOrder").limit(100);
    if (location) {
      const locationItem = locations.find((item) => asText(item.slug) === location);
      if (!locationItem) return [];
      query = query.eq("location", asText(locationItem._id));
    }
    const result = await query.find({ consistentRead: true });
    return Promise.all((result.items as WixRecord[]).map(async (item) => {
      const room = mapRoom(item, lookup);
      const amenities = await queryReferences(COLLECTIONS.rooms, item, "amenities");
      return {
        ...room,
        amenities: amenityLabels(amenities),
        locationAmenities: locationAmenities.get(referenceId(item.location)) ?? [],
      };
    }));
  },
  async getNewsArticles() {
    const records = await queryPublished(COLLECTIONS.newsArticles, 100, undefined);
    return records
      .sort((left, right) => new Date(asText(right.publishedAt)).valueOf() - new Date(asText(left.publishedAt)).valueOf())
      .map(mapNewsArticle);
  },
  async getNewsArticle(slug) {
    const item = await findOne(COLLECTIONS.newsArticles, "slug", slug);
    return item && asBoolean(item.published) ? mapNewsArticle(item) : undefined;
  },
  async getLegalPage(slug) {
    const storedSlug = slug === "notice" ? "legal-notice" : slug;
    const item = await findOne(COLLECTIONS.legalPages, "slug", storedSlug);
    return item && asBoolean(item.published) ? mapLegalPage(item) : undefined;
  },
};
