import { items } from "@wix/data";
import type {
  AmbassadorsPage,
  ContentRepository,
  CoworkingPage,
  DealsPage,
  EventsPage,
  ForInvestorsPage,
  HomePage,
  LifePage,
  LocationPage,
  LocationSpacePage,
  LocationSpaceSummary,
  MembershipsPage,
  MonthPage,
  PartnershipsPage,
  ProgramPage,
  ProgramSummary,
  RoomsPage,
  SpaceAmenity,
  StayCampaign,
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
  isActiveDeal,
  mapLegalPage,
  mapCoworkingLocationNavigationItem,
  mapLocationNavigationItem,
  mapNavigationItem,
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
import { routes, siteNavigation, withDealsNavigation, withPostsNavigation } from "@/config/navigation";
import type { NavigationItem, SiteNavigation } from "@/domain/navigation";
import { getBlogPost, getBlogPostsPage, getFeaturedBlogPosts } from "./wix-blog";
import { parseEditorialEntityReference, parseSectionSource } from "@/domain/editorial";
import { normalizeMembershipCta } from "./membership-cta";
import { sectionDocumentKey } from "./wix-composition";

export const COLLECTIONS = {
  siteSettings: "CHSiteSettings",
  interfaceCopy: "CHInterfaceCopy",
  pages: "CHPages",
  amenities: "CHAmenities",
  locations: "CHLocations",
  people: "CHPeople",
  programs: "CHPrograms",
  stayCampaigns: "CHStayCampaigns",
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
  intro?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    items?: Array<{
      title?: string;
      text?: string;
      label?: string;
      entity?: { type: string; key: string };
    }>;
  };
};
type LocationSpacePageDocument = Partial<LocationSpacePage> & {
  hero?: { eyebrow?: string; title?: string; body?: string; image?: string };
  story?: { eyebrow?: string; title?: string; body?: string; image?: string };
};

const CMS_CACHE_TTL_MS = 30_000;
const cmsCache = new Map<string, { expiresAt: number; value: Promise<unknown> }>();

type CmsQueryOptions = {
  filter?: Record<string, unknown>;
  limit?: number;
  sortField?: string;
};

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

async function queryItems(
  collectionId: string,
  { filter, limit = 100, sortField }: CmsQueryOptions = {},
): Promise<WixRecord[]> {
  const result = await items.query(
    collectionId,
    {
      ...(filter ? { filter } : {}),
      ...(sortField ? { sort: [{ fieldName: sortField, order: "ASC" as const }] } : {}),
      paging: { limit, offset: 0 },
    },
    { consistentRead: true },
  );
  return result.items as WixRecord[];
}

async function queryAll(collectionId: string, limit = 100, sortField: string | undefined = "sortOrder"): Promise<WixRecord[]> {
  return cached(`all:${collectionId}:${limit}:${sortField ?? "none"}`, async () => {
    return queryItems(collectionId, { limit, sortField });
  });
}

async function queryPublished(collectionId: string, limit = 100, sortField: string | undefined = "sortOrder"): Promise<WixRecord[]> {
  return (await queryAll(collectionId, limit, sortField)).filter((item) => asBoolean(item.published));
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
    const result = await queryItems(collectionId, { filter: { [field]: value }, limit: 1 });
    return result[0];
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

async function getEnabledPageSections(): Promise<WixRecord[]> {
  return (await queryAll(COLLECTIONS.pageSections, 1000)).filter((section) => asBoolean(section.enabled));
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

function spaceStatus(space: WixRecord): "active" | "comingSoon" | "hidden" {
  const status = asText(space.status).toLowerCase().replaceAll(/[-_\s]/g, "");
  if (status === "hidden") return "hidden";
  return status === "comingsoon" ? "comingSoon" : "active";
}

function locationSpaceSummary(space: WixRecord, location: WixRecord): LocationSpaceSummary {
  const slug = asText(space.slug) || asText(space._id);
  const routeSlug = asText(space.routeSlug);
  const locationSlug = asText(location.slug);
  const locationName = asText(location.name) || asText(location.shortName) || locationSlug;
  if (!slug || !routeSlug || !locationSlug) {
    throw new Error(`CHSpaces item "${slug || "unknown"}" is missing slug, routeSlug or a valid location.`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(routeSlug)) {
    throw new Error(`CHSpaces item "${slug}" has invalid routeSlug "${routeSlug}".`);
  }
  return {
    slug,
    routeSlug,
    location: { slug: locationSlug, name: locationName },
    category: asText(space.categoryLabel) || asText(space.spaceType),
    title: asText(space.title),
    description: asText(space.description),
    access: asText(space.accessLabel) || undefined,
    address: asText(space.addressOverride) || asText(location.address) || undefined,
    status: spaceStatus(space) === "comingSoon" ? "comingSoon" : "active",
    image: wixUrl(space.image) || undefined,
    href: routes.locationSpace(locationSlug, routeSlug),
  };
}

async function discoverableLocationSpaces(locationSlug: string): Promise<Array<{ space: WixRecord; location: WixRecord }>> {
  const location = (await getPublishedLocations()).find((candidate) => asText(candidate.slug) === locationSlug);
  if (!location) return [];
  const locationId = asText(location._id);
  const spaces = (await queryPublished(COLLECTIONS.spaces)).filter((space) =>
    referenceId(space.location) === locationId &&
    asBoolean(space.discoverable) &&
    spaceStatus(space) !== "hidden",
  );
  const seen = new Set<string>();
  for (const space of spaces) {
    const routeSlug = asText(space.routeSlug);
    if (!routeSlug) throw new Error(`Discoverable CHSpaces item "${asText(space.slug)}" has no routeSlug.`);
    if (seen.has(routeSlug)) throw new Error(`CHSpaces has duplicate routeSlug "${routeSlug}" for location "${locationSlug}".`);
    seen.add(routeSlug);
  }
  return spaces.map((space) => ({ space, location }));
}

async function hydrateProgramLocations(programs: WixRecord[]): Promise<WixRecord[]> {
  return Promise.all(programs.map(async (program) => ({
    ...program,
    locations: await queryReferences(COLLECTIONS.programs, program, "locations"),
  })));
}

function programLocationRecords(program: WixRecord, locations: WixRecord[]): WixRecord[] {
  if (asText(program.locationScope) === "all") return locations;
  const selectedIds = Array.isArray(program.locations)
    ? program.locations.map(referenceId).filter(Boolean)
    : [];
  const legacyId = referenceId(program.location);
  const ids = selectedIds.length > 0 ? selectedIds : [legacyId].filter(Boolean);
  return locations.filter((location) => ids.includes(asText(location._id)));
}

function sectionName(section: WixRecord): string {
  const componentKey = asText(section.componentKey);
  return sectionDocumentKey(componentKey, asText(section.sectionKey));
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
    entity: parseEditorialEntityReference(record),
  };
}

function splitParagraphs(value: string): string[] {
  return value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

function composeSection(section: WixRecord, sectionItems: WixRecord[]): unknown {
  const source = parseSectionSource(section);
  const componentKey = asText(section.componentKey);
  const primaryCta = normalizeMembershipCta(mapCmsLink(section, "primary"), componentKey);
  const secondaryCta = normalizeMembershipCta(mapCmsLink(section, "secondary"));
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
    ...(source.mode === "manual" ? {} : { source }),
  };

  if (componentKey === "home.hero") {
    const videoSrc = wixUrl(section.video) || wixUrl(section.primaryExternalUrl);
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
      video: wixUrl(section.video) || undefined,
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

  if (componentKey === "deals.list") {
    return {
      eyebrow: asText(section.eyebrow),
      title: asText(section.title),
      emptyText: body || "There are no deals available right now.",
      ...(source.mode === "manual" ? {} : { source }),
    };
  }

  if (componentKey === "partnerships.partners") {
    return {
      eyebrow: asText(section.eyebrow),
      title: asText(section.title),
      featuredLabel: asText(section.subtitle) || undefined,
      items: [],
      ...(source.mode === "manual" ? {} : { source }),
    };
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
      cta: primaryCta,
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

  if (componentKey === "life.highlights") {
    return sectionItems.map((item) => ({
      stat: {
        value: asText(item.value),
        label: asText(item.label),
        illustration: wixGallery(item.gallery)[0] || undefined,
      },
      photo: {
        title: asText(item.title),
        image: wixUrl(item.image) || undefined,
      },
    }));
  }

  if (componentKey === "what.edge") {
    return {
      title: asText(section.title),
      text: body,
      footnote: asText(section.note) || undefined,
      image: image || undefined,
    };
  }

  if (componentKey === "what.manifesto") {
    return {
      eyebrow: asText(section.eyebrow),
      title: asText(section.title),
      lead: asText(section.lead),
      paragraphs: splitParagraphs(body),
      images: gallery,
    };
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
    const pages = await queryPublished(COLLECTIONS.pages, 1000, undefined);
    return pages.find((page) =>
      (!pageKey || asText(page.pageKey) === pageKey) &&
      (!routeKey || asText(page.routeKey) === routeKey) &&
      (!routeParam || asText(page.routeParam) === routeParam));
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

  const [allSections, allSectionItems] = await Promise.all([
    getEnabledPageSections(),
    queryPublished(COLLECTIONS.sectionItems, 1000),
  ]);
  const sections = allSections.filter((section) => referenceId(section.page) === pageId);
  const itemsBySection = Map.groupBy(allSectionItems, (item) => referenceId(item.section));
  const sectionItems = sections.map((section) => itemsBySection.get(asText(section._id)) ?? []);

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

function isRouteFamily(item: NavigationItem, route: string): boolean {
  return item.status === "link" && (item.href === route || item.href.startsWith(`${route}/`));
}

function normalizeCmsPrimaryNavigation(items: readonly NavigationItem[], coworkingItems: readonly NavigationItem[]): readonly NavigationItem[] {
  const withoutRooms = items.filter((item) => !isRouteFamily(item, routes.rooms));
  if (withoutRooms.some((item) => isRouteFamily(item, "/coworking"))) return withoutRooms;

  const fallbackCoworking = siteNavigation.header.primary.find((item) => isRouteFamily(item, "/coworking"));
  if (!fallbackCoworking || fallbackCoworking.status !== "link") return withoutRooms;
  const children = coworkingItems.length ? coworkingItems : fallbackCoworking.children;
  const firstAvailable = children?.find((item) => item.status === "link");
  const coworking: NavigationItem = {
    ...fallbackCoworking,
    href: firstAvailable?.status === "link" ? firstAvailable.href : fallbackCoworking.href,
    children,
  };
  const colivingIndex = withoutRooms.findIndex((item) => isRouteFamily(item, "/locations"));
  if (colivingIndex < 0) return [coworking, ...withoutRooms];
  return [...withoutRooms.slice(0, colivingIndex + 1), coworking, ...withoutRooms.slice(colivingIndex + 1)];
}

function buildNavigation(records: WixRecord[], locations: WixRecord[], pages: WixRecord[]): SiteNavigation {
  const byParent = Map.groupBy(records, (item) => asText(item.parentKey));
  const locationItems = locations
    .map(mapLocationNavigationItem)
    .filter((item): item is NavigationItem => Boolean(item));
  const coworkingLocations = new Set(
    pages
      .filter((page) => asText(page.routeKey) === "coworking")
      .map((page) => asText(page.routeParam))
      .filter(Boolean),
  );
  const coworkingItems = locations
    .map((location) => mapCoworkingLocationNavigationItem(location, coworkingLocations.has(asText(location.slug))))
    .filter((item): item is NavigationItem => Boolean(item));
  const mapTree = (item: WixRecord): NavigationItem => {
    const rootHeaderItem = !asText(item.parentKey) && ["headerprimary", "header"].includes(navigationArea(item));
    const routeKey = asText(item.routeKey);
    const isColiving = rootHeaderItem && routeKey === "location";
    const isCoworking = rootHeaderItem && routeKey === "coworking";
    const mappedItem = isColiving
      ? { ...item, label: "Coliving", menuLabel: "Coliving at" }
      : isCoworking
        ? { ...item, label: "Coworking", menuLabel: "Coworking at" }
        : item;
    const children = isColiving && locationItems.length > 0
      ? locationItems
      : isCoworking && coworkingItems.length > 0
        ? coworkingItems
        : (byParent.get(asText(item.itemKey)) ?? []).map(mapTree);
    return mapNavigationItem(mappedItem, children);
  };
  const roots = records.filter((item) => !asText(item.parentKey));
  const inAreas = (...areas: string[]) => roots.filter((item) => areas.includes(navigationArea(item))).map(mapTree);
  const cmsPrimary = normalizeCmsPrimaryNavigation(inAreas("headerprimary", "header"), coworkingItems);
  const primary = cmsPrimary.length
    ? withDealsNavigation(withPostsNavigation(cmsPrimary))
    : siteNavigation.header.primary;
  const headerLocations = inAreas("headerlocations");
  const derivedLocations = roots
    .filter((item) => asText(item.routeKey) === "location")
    .map(mapTree);
  const findAction = (key: string) => {
    const record = roots.find((item) => navigationArea(item) === "headeraction" && asText(item.itemKey).toLowerCase().includes(key));
    return record ? mapTree(record) : undefined;
  };
  const footerMain = inAreas("footermain");
  const footerExtras = inAreas("footerextras", "footer");
  const footerLegal = inAreas("footerlegal");

  return {
    header: {
      locations: locationItems.length ? locationItems : headerLocations.length ? headerLocations : derivedLocations.length ? derivedLocations : siteNavigation.header.locations,
      primary,
      actions: {
        book: findAction("book") ?? siteNavigation.header.actions.book,
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
  const [composedPage, locations, spaces, eventRecords, testimonials, featuredPosts] = await Promise.all([
    requirePage<Partial<HomePage>>({ pageKey: "home" }),
    getPublishedLocations(),
    queryPublished(COLLECTIONS.spaces),
    queryPublished(COLLECTIONS.events, 100, "homeSortOrder"),
    queryPublished(COLLECTIONS.testimonials, 100, "homeSortOrder"),
    getFeaturedBlogPosts(6),
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
      items: featuredPosts,
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
  const requiredSections = ["seo", "intro", "benefits", "hub", "band", "faq"] as const;
  for (const key of requiredSections) {
    if (!page[key] || typeof page[key] !== "object") {
      throw new Error(`CHPages item "memberships" is missing the required "memberships.${key}" content.`);
    }
  }
  if (!page.intro?.cta) throw new Error('CHPageSections item "memberships.intro" requires a primary CTA.');
  if (!page.band?.primaryCta) throw new Error('CHPageSections item "memberships.band" requires a primary CTA.');
  if (!page.faq?.items.length) throw new Error('CHPages item "memberships" requires at least one related FAQ.');
  return page as MembershipsPage;
}

function requireCompleteTeamPage(page: Partial<TeamPage>): TeamPage {
  const requiredSections = ["seo", "intro", "members", "band", "faq"] as const;
  for (const key of requiredSections) {
    if (!page[key] || typeof page[key] !== "object") {
      throw new Error(`CHPages item "team" is missing the required "team.${key}" content.`);
    }
  }
  if (!page.band?.primaryCta) throw new Error('CHPageSections item "team.band" requires a primary CTA.');
  if (!page.faq?.items.length) throw new Error('CHPages item "team" requires at least one related FAQ.');
  return page as TeamPage;
}

function requireCompleteWhatIsCirclesPage(page: Partial<WhatIsCirclesPage>): WhatIsCirclesPage {
  const requiredSections = ["seo", "intro", "purpose", "values", "edge", "manifesto", "faq"] as const;
  for (const key of requiredSections) {
    if (!page[key] || typeof page[key] !== "object") {
      throw new Error(`CHPages item "what-is-circles" is missing the required "what-is-circles.${key}" content.`);
    }
  }
  if (!page.values?.items.length) throw new Error('CHPageSections item "what-is-circles.values" requires published values.');
  if (!page.manifesto?.paragraphs.length) throw new Error('CHPageSections item "what-is-circles.manifesto" requires manifesto copy.');
  if (!page.faq?.items.length) throw new Error('CHPages item "what-is-circles" requires at least one related FAQ.');
  return page as WhatIsCirclesPage;
}

function requireCompleteLifePage(page: Partial<LifePage>): LifePage {
  const requiredSections = ["seo", "intro", "highlights", "spaces", "band", "faq"] as const;
  for (const key of requiredSections) {
    if (!page[key] || typeof page[key] !== "object") {
      throw new Error(`CHPages item "life-at-circles" is missing the required "life-at-circles.${key}" content.`);
    }
  }
  if (!page.highlights?.length) throw new Error('CHPageSections item "life-at-circles.highlights" requires published highlights.');
  if (!page.spaces?.items.length) throw new Error('CHPages item "life-at-circles" requires published Barcelona coworking spaces.');
  if (!page.band?.primaryCta) throw new Error('CHPageSections item "life-at-circles.band" requires a primary CTA.');
  if (!page.faq?.items.length) throw new Error('CHPages item "life-at-circles" requires at least one related FAQ.');
  return page as LifePage;
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
  const requiredSections = ["seo", "hero", "form", "space", "rooms", "band", "events"] as const;
  for (const key of requiredSections) {
    if (!page[key] || typeof page[key] !== "object") {
      throw new Error(`CHPages item "month:${slug}" is missing the required "month.${key}" content.`);
    }
  }
  if (!page.hero?.cta) throw new Error(`CHPageSections item "${slug}.hero" requires a primary CTA.`);
  if (!page.space?.spaces.length) throw new Error(`CHPages item "month:${slug}" requires at least one published space.`);
  return page as MonthPage;
}

async function composeStayCampaign(record: WixRecord): Promise<StayCampaign> {
  const campaignKey = asText(record.campaignKey);
  const period = asText(record.period);
  const locationId = referenceId(record.location);
  if (!campaignKey || !/^\d{4}-(0[1-9]|1[0-2])$/.test(period) || !locationId) {
    throw new Error(`CHStayCampaigns item "${campaignKey || asText(record._id) || "unknown"}" is incomplete.`);
  }

  const locations = await getPublishedLocations();
  const location = locations.find((candidate) => asText(candidate._id) === locationId);
  if (!location) {
    throw new Error(`CHStayCampaigns item "${campaignKey}" references an unpublished or missing location.`);
  }
  const composed = await composePage<Partial<MonthPage>>({ pageKey: "stay-campaign-template" }, true);
  if (!composed) throw new Error('CHPages item "stay-campaign-template" cannot be composed.');

  const locationIdValue = asText(location._id);
  const spaces = (await queryPublished(COLLECTIONS.spaces))
    .filter((space) => referenceId(space.location) === locationIdValue && asText(space.status).toLowerCase() !== "hidden")
    .slice(0, 3)
    .map((space, index) => ({
      ...mapSpace(space, location),
      size: (["large", "medium", "small"] as const)[index] ?? "small",
    }));
  const locationSlug = asText(location.slug);
  const name = asText(record.name) || campaignKey;
  return {
    campaignKey,
    name,
    period,
    legacyRouteParam: asText(record.legacyRouteParam) || undefined,
    location: {
      slug: locationSlug,
      name: asText(location.name) || asText(location.shortName) || locationSlug,
    },
    page: requireCompleteMonthPage({
      ...composed,
      slug: asText(record.legacyRouteParam) || period,
      city: locationSlug,
      seo: {
        title: `${name} · Circles House`,
        description: `Explore rooms, spaces and community events for ${name}.`,
      },
      hero: { ...composed.hero!, eyebrow: name },
      space: { ...composed.space!, spaces },
    }, campaignKey),
  };
}

function getCmsHomePage(): Promise<HomePage> {
  return cached("document:home", loadCmsHomePage);
}

async function loadSiteSettings() {
  const [settings, socialResult, copyResult, navigation, locations, pages] = await Promise.all([
    getRequiredSingleton(COLLECTIONS.siteSettings),
    queryItems(COLLECTIONS.socialLinks, { filter: { published: true }, sortField: "sortOrder", limit: 50 }),
    queryItems(COLLECTIONS.interfaceCopy, { limit: 500 }),
    queryPublished(COLLECTIONS.navigationItems),
    getPublishedLocations(),
    queryPublished(COLLECTIONS.pages),
  ]);
  return {
    ...mapSiteSettings(settings, socialResult),
    interfaceCopy: Object.fromEntries(
      copyResult.map((item) => [asText(item.copyKey), asText(item.value)]).filter(([key]) => Boolean(key)),
    ),
    navigation: buildNavigation(navigation, locations, pages),
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
    const page = await requirePage<Partial<PartnershipsPage>>({ pageKey: "partnerships" });
    return {
      ...page,
      partners: {
        eyebrow: "Why join",
        title: "Why partner with Circles?",
        featuredLabel: "Partner of the month",
        items: [],
        ...page.partners,
      },
    } as PartnershipsPage;
  },
  getForInvestorsPage: () => requirePage<ForInvestorsPage>({ pageKey: "for-investors" }),
  async getTeamPage() {
    return requireCompleteTeamPage(await requirePage<Partial<TeamPage>>({ pageKey: "team" }));
  },
  async getWhatIsCirclesPage() {
    return requireCompleteWhatIsCirclesPage(
      await requirePage<Partial<WhatIsCirclesPage>>({ pageKey: "what-is-circles" }),
    );
  },
  async getMembershipsPage() {
    return requireCompleteMembershipsPage(
      await requirePage<Partial<MembershipsPage>>({ pageKey: "memberships" }),
    );
  },
  async getLifePage() {
    const [page, coworking] = await Promise.all([
      requirePage<Partial<LifePage>>({ pageKey: "life-at-circles" }),
      wixCmsRepository.getCoworkingPage("barcelona"),
    ]);
    if (!coworking) throw new Error('CHPages does not contain the published page "coworking:barcelona" required by "life-at-circles".');
    return requireCompleteLifePage({ ...page, spaces: coworking.spaces });
  },
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
        address: asText(location.address) || composed.location?.address,
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
  async getLocationSpaces(location) {
    return (await discoverableLocationSpaces(location)).map(({ space, location: locationRecord }) =>
      locationSpaceSummary(space, locationRecord));
  },
  async getLocationSpace(location, routeSlug) {
    const matches = (await discoverableLocationSpaces(location))
      .filter(({ space }) => asText(space.routeSlug) === routeSlug);
    if (matches.length === 0) return undefined;
    if (matches.length > 1) throw new Error(`CHSpaces has duplicate routeSlug "${routeSlug}" for location "${location}".`);

    const { space, location: locationRecord } = matches[0];
    const summary = locationSpaceSummary(space, locationRecord);
    const [amenities, pageRecord] = await Promise.all([
      queryReferences(COLLECTIONS.spaces, space, "amenities"),
      referenceId(space.page) ? findOne(COLLECTIONS.pages, "_id", referenceId(space.page)) : undefined,
    ]);
    let composed: LocationSpacePageDocument | undefined;
    if (pageRecord && asBoolean(pageRecord.published)) {
      const pageKey = asText(pageRecord.pageKey);
      const routeKey = asText(pageRecord.routeKey);
      const routeParam = asText(pageRecord.routeParam);
      composed = pageKey
        ? await composePage<LocationSpacePageDocument>({ pageKey }, true)
        : routeKey
          ? await composePage<LocationSpacePageDocument>({ routeKey, routeParam }, true)
          : undefined;
    }

    const heroImage = composed?.hero?.image || summary.image;
    const gallery = [heroImage, ...wixGallery(space.gallery)].filter((image): image is string => Boolean(image));
    const externalUrl = wixUrl(space.externalUrl);
    const ctaLabel = asText(space.ctaLabel);
    const story = composed?.story?.title && composed.story.body
      ? {
          eyebrow: composed.story.eyebrow,
          title: composed.story.title,
          text: composed.story.body,
          image: composed.story.image,
        }
      : undefined;
    return {
      ...summary,
      title: composed?.hero?.title || summary.title,
      description: composed?.hero?.body || summary.description,
      image: heroImage,
      seo: {
        title: composed?.seo?.title || `${summary.title} · ${summary.location.name} · Circles House`,
        description: composed?.seo?.description || summary.description,
      },
      gallery: [...new Set(gallery)],
      amenities: amenityLabels(amenities),
      hours: asText(space.hours) || undefined,
      cta: ctaLabel && externalUrl ? { label: ctaLabel, href: externalUrl } : undefined,
      story,
      faq: composed?.faq,
    } satisfies LocationSpacePage;
  },
  async getMonthPage(slug) {
    return (await this.getStayCampaignByLegacySlug(slug))?.page;
  },
  async getStayCampaign(location, period) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) return undefined;
    const campaigns = await queryPublished(COLLECTIONS.stayCampaigns);
    const locations = await getPublishedLocations();
    const locationRecord = locations.find((candidate) => asText(candidate.slug) === location);
    if (!locationRecord) return undefined;
    const matches = campaigns.filter((campaign) =>
      asText(campaign.period) === period && referenceId(campaign.location) === asText(locationRecord._id));
    if (matches.length > 1) throw new Error(`CHStayCampaigns has duplicate records for ${location}:${period}.`);
    return matches[0] ? composeStayCampaign(matches[0]) : undefined;
  },
  async getStayCampaignByLegacySlug(slug) {
    const matches = (await queryPublished(COLLECTIONS.stayCampaigns))
      .filter((campaign) => asText(campaign.legacyRouteParam) === slug);
    if (matches.length > 1) throw new Error(`CHStayCampaigns has duplicate legacyRouteParam records for "${slug}".`);
    return matches[0] ? composeStayCampaign(matches[0]) : undefined;
  },
  async getProgramPage(slug) {
    const rawProgram = await findOne(COLLECTIONS.programs, "slug", slug);
    const program = rawProgram ? (await hydrateProgramLocations([rawProgram]))[0] : undefined;
    if (!program || !asBoolean(program.published)) return undefined;

    const locations = await getPublishedLocations();
    const lookup = buildLocationLookup(locations);
    const selectedLocations = programLocationRecords(program, locations);
    const programId = asText(program._id);
    const name = asText(program.name);
    if (!programId || !name || selectedLocations.length === 0) {
      throw new Error(`CHPrograms item "${slug}" is missing _id, name or valid CHLocations references.`);
    }

    const result = await queryItems(COLLECTIONS.events, {
      filter: { published: true, program: programId },
      sortField: "sortOrder",
      limit: 100,
    });
    const events = result.map((event) => {
      validateEventProgramReference(event, new Map([[programId, program]]));
      return mapEvent(event, lookup, new Map([[programId, program]]));
    });
    const programLocations = selectedLocations.map((location) => ({
      slug: asText(location.slug),
      name: asText(location.name) || asText(location.shortName) || asText(location.city),
    }));
    const theme = asText(program.theme);
    const startsOn = asDateOnly(program.startsOn);
    const endsOn = asDateOnly(program.endsOn);
    return {
      slug,
      name,
      theme,
      locations: programLocations,
      locationScope: asText(program.locationScope) === "all" ? "all" : "selected",
      startsOn,
      endsOn,
      registrationEnabled: asBoolean(program.registrationEnabled),
      seo: {
        title: `${name} · Circles House`,
        description: theme || `Explore the events connected to ${name}.`,
      },
      events,
    } satisfies ProgramPage;
  },
  async getPrograms() {
    const [programs, locations] = await Promise.all([
      queryPublished(COLLECTIONS.programs).then(hydrateProgramLocations),
      getPublishedLocations(),
    ]);
    return programs.map((program) => ({
      slug: asText(program.slug),
      name: asText(program.name),
      locations: programLocationRecords(program, locations).map((location) => ({
        slug: asText(location.slug),
        name: asText(location.name) || asText(location.shortName) || asText(location.city),
      })),
      locationScope: asText(program.locationScope) === "all" ? "all" : "selected",
    } satisfies ProgramSummary));
  },
  async getTeamMembers() {
    const result = await queryItems(COLLECTIONS.people, { filter: { published: true }, sortField: "sortOrder", limit: 100 });
    return result.filter((item) => hasPersonType(item, "team")).map(mapTeamMember);
  },
  async getEventsPage() {
    const [document, locations] = await Promise.all([
      requirePage<EventsPageDocument>({ pageKey: "events" }),
      getPublishedLocations(),
    ]);
    const cities = locations.map((location) => ({ slug: asText(location.slug), name: asText(location.shortName) || asText(location.city) }));
    const title = asText(document.intro?.title) || asText(document.title);
    if (!title) throw new Error('CHPageSections item "events.intro" requires a title.');
    const subtitle = asText(document.intro?.subtitle) || asText(document.subtitle);
    const headingItems = document.intro?.items ?? [];
    const headingsFor = (type: "location" | "program") => Object.fromEntries(
      headingItems.flatMap((item) => {
        if (item.entity?.type !== type || !item.entity.key || !asText(item.title)) return [];
        return [[item.entity.key, {
          eyebrow: asText(item.label) || undefined,
          title: asText(item.title),
          subtitle: asText(item.text) || undefined,
        }]];
      }),
    );
    return {
      title,
      subtitle,
      cities,
      eyebrows:
        document.eyebrows ??
        Object.fromEntries([["all", "Happening now"], ...cities.map((city) => [city.slug, `Happening now in ${city.name}`])]),
      listingHeadings: {
        all: { title, subtitle: subtitle || undefined },
        locations: headingsFor("location"),
        programs: headingsFor("program"),
      },
    };
  },
  async getEvents(filters = {}) {
    const [locations, programs] = await Promise.all([
      getPublishedLocations(),
      queryPublished(COLLECTIONS.programs).then(hydrateProgramLocations),
    ]);
    const lookup = buildLocationLookup(locations);
    const programsById = new Map(programs.map((program) => [asText(program._id), program]));
    const eventRecords = await queryItems(COLLECTIONS.events, { filter: { published: true }, sortField: "sortOrder", limit: 100 });
    eventRecords.forEach((event) => validateEventProgramReference(event, programsById));
    return eventRecords
      .filter((item) => isCurrentOrUpcomingEvent(item))
      .map((item) => mapEvent(item, lookup, programsById))
      .filter((event) => {
        if (filters.locations?.length && !filters.locations.includes(event.city)) return false;
        if (filters.programs?.length && (!event.program || !filters.programs.includes(event.program.slug))) return false;
        if (filters.month && event.monthKey !== filters.month) return false;
        return true;
      });
  },
  async getEvent(slug) {
    const event = await findOne(COLLECTIONS.events, "slug", slug);
    if (!event || !asBoolean(event.published)) return undefined;
    const [locations, programs] = await Promise.all([
      getPublishedLocations(),
      queryPublished(COLLECTIONS.programs).then(hydrateProgramLocations),
    ]);
    const programsById = new Map(programs.map((program) => [asText(program._id), program]));
    validateEventProgramReference(event, programsById);
    return mapEvent(event, buildLocationLookup(locations), programsById);
  },
  async getDeals() {
    return (await queryPublished(COLLECTIONS.deals, 50))
      .filter((item) => isActiveDeal(item))
      .map(mapDeal);
  },
  async getDealsPage() {
    const page = await composePage<DealsPage>({ pageKey: "deals" }, true);
    return page ?? {
      seo: {
        title: "Deals · Circles House",
        description: "Current Circles House offers for coliving and coworking stays in Barcelona and Andorra.",
      },
      deals: {
        eyebrow: "Current offers",
        title: "Stay longer, experience more.",
        emptyText: "There are no deals available right now.",
        source: { mode: "automatic", key: "deals.active" },
      },
    };
  },
  async getPartners() {
    return (await queryPublished(COLLECTIONS.partners)).map(mapPartner);
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
    let roomItems = await queryPublished(COLLECTIONS.rooms);
    if (location) {
      const locationItem = locations.find((item) => asText(item.slug) === location);
      if (!locationItem) return [];
      roomItems = roomItems.filter((room) => referenceId(room.location) === asText(locationItem._id));
    }
    return Promise.all(roomItems.map(async (item) => {
      const room = mapRoom(item, lookup);
      const amenities = await queryReferences(COLLECTIONS.rooms, item, "amenities");
      return {
        ...room,
        amenities: amenityLabels(amenities),
        locationAmenities: locationAmenities.get(referenceId(item.location)) ?? [],
      };
    }));
  },
  async getRoom(location, slug) {
    const matches = (await this.getRooms(location))
      .filter((room) => room.id === slug && room.discoverable);
    if (matches.length > 1) {
      throw new Error(`CHRooms has duplicate slug "${slug}" for location "${location}".`);
    }
    const room = matches[0];
    if (!room?.href) return undefined;
    return {
      ...room,
      discoverable: true,
      href: room.href,
      gallery: [...new Set([room.image, ...(room.gallery ?? [])].filter((image): image is string => Boolean(image)))],
      seo: {
        title: `${room.name} · ${room.locationName} · Circles House`,
        description: room.description ?? `Explore ${room.name} at ${room.locationName}.`,
      },
    };
  },
  async getPostsPage(page, pageSize, category) {
    return getBlogPostsPage(page, pageSize, category);
  },
  async getPost(slug) {
    return getBlogPost(slug);
  },
  async getLegalPage(slug) {
    const storedSlug = slug === "notice" ? "legal-notice" : slug;
    const item = await findOne(COLLECTIONS.legalPages, "slug", storedSlug);
    return item && asBoolean(item.published) ? mapLegalPage(item) : undefined;
  },
};
