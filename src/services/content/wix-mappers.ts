import { routes } from "../../config/navigation";
import type {
  ArticleContentType,
  Deal,
  EventSummary,
  FaqBlock,
  FaqItem,
  LegalPage,
  Link,
  MembershipPlan,
  NewsArticle,
  NewsItem,
  Partner,
  SiteSettings,
  SocialNetwork,
  Space,
  TeamMember,
} from "@/domain/content";
import type { NavigationItem } from "@/domain/navigation";
import type { Room } from "@/domain/booking";

export type WixRecord = Record<string, unknown>;

const socialNetworks = new Set<SocialNetwork>(["whatsapp", "instagram", "tiktok", "linkedin", "facebook", "youtube", "pinterest"]);

export function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function asBoolean(value: unknown): boolean {
  return value === true;
}

export function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** Normalizes Wix date fields, including SDK Date objects and REST `$date` payloads. */
export function asDateOnly(value: unknown): string | undefined {
  const serialized = value && typeof value === "object" ? (value as WixRecord).$date : undefined;
  const source = serialized ?? value;
  const date = source instanceof Date
    ? source
    : typeof source === "string" || typeof source === "number"
      ? new Date(source)
      : undefined;
  return date && !Number.isNaN(date.valueOf()) ? date.toISOString().slice(0, 10) : undefined;
}

export function asTextList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(asText).filter(Boolean) : [];
}

function richText(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  return asText(((value as WixRecord).textData as WixRecord | undefined)?.text);
}

function richNodeText(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const record = value as WixRecord;
  const ownText = richText(record);
  if (ownText) return ownText;
  return Array.isArray(record.nodes)
    ? record.nodes.map(richNodeText).filter(Boolean).join(" ")
    : "";
}

export function richContentBlocks(value: unknown): FaqBlock[] {
  if (typeof value === "string") {
    return value
      .split(/\n\s*\n/)
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text) => ({ type: "paragraph" as const, text }));
  }
  if (!value || typeof value !== "object") return [];
  const nodes = (value as WixRecord).nodes;
  if (!Array.isArray(nodes)) return [];

  return nodes.flatMap((node): FaqBlock[] => {
    if (!node || typeof node !== "object") return [];
    const record = node as WixRecord;
    const type = asText(record.type);
    if (type === "PARAGRAPH" || type === "HEADING" || type === "BLOCKQUOTE") {
      const text = richNodeText(record).trim();
      return text ? [{ type: "paragraph", text }] : [];
    }
    if (type === "BULLETED_LIST" || type === "ORDERED_LIST") {
      const listNodes = Array.isArray(record.nodes) ? record.nodes : [];
      const listItems = listNodes.map(richNodeText).map((text) => text.trim()).filter(Boolean);
      return listItems.length ? [{ type: "list", items: listItems }] : [];
    }
    return [];
  });
}

export function referenceId(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return asText((value as WixRecord)._id) || asText((value as WixRecord).id);
}

/** Normalizes Wix Image, Media Gallery, Document, Link and URL field payloads. */
export function wixUrl(value: unknown): string {
  if (typeof value === "string") {
    const source = value.trim();
    const imageMatch = source.match(/^wix:image:\/\/v1\/([^/]+)/);
    if (imageMatch) return `https://static.wixstatic.com/media/${imageMatch[1]}`;
    const documentMatch = source.match(/^wix:document:\/\/v1\/([^/]+)/);
    if (documentMatch) return `https://static.wixstatic.com/ugd/${documentMatch[1]}`;
    return source;
  }
  if (!value || typeof value !== "object") return "";

  const record = value as WixRecord;
  for (const candidate of [record.url, record.href, record.src, record.uri, record.fileUrl]) {
    const normalized = wixUrl(candidate);
    if (normalized) return normalized;
  }
  for (const nested of [record.image, record.video, record.document, record.media, record.imageInfo, record.imageData, record.fileInfo]) {
    const normalized = wixUrl(nested);
    if (normalized) return normalized;
  }
  return "";
}

export function wixGallery(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(wixUrl).filter(Boolean);
}

export function resolveCmsHref(routeKey: unknown, routeParam?: unknown, anchor?: unknown, externalUrl?: unknown): string {
  const external = wixUrl(externalUrl);
  const key = asText(routeKey);
  const parameter = asText(routeParam);
  const fragment = asText(anchor).replace(/^#/, "");

  let href = external;
  if (key) {
    switch (key) {
      case "home": href = routes.home; break;
      case "rooms": href = parameter ? routes.cityRooms(parameter) : routes.rooms; break;
      case "deals": href = routes.deals; break;
      case "memberships": href = routes.memberships; break;
      case "life-at-circles":
      case "lifeAtCircles": href = routes.lifeAtCircles; break;
      case "what-is-circles":
      case "whatIsCircles": href = routes.whatIsCircles; break;
      case "team": href = routes.team; break;
      case "for-investors":
      case "forInvestors": href = routes.forInvestors; break;
      case "partnerships": href = routes.partnerships; break;
      case "ambassadors": href = routes.ambassadors; break;
      case "events": href = parameter ? routes.cityEvents(parameter) : routes.events; break;
      case "news":
      case "posts": href = routes.posts; break;
      case "location": href = routes.location(requireRouteParam(key, parameter)); break;
      case "coworking": href = routes.coworking(requireRouteParam(key, parameter)); break;
      case "month":
        href = routes.month(requireRouteParam(key, parameter)); break;
      case "program": href = routes.program(requireRouteParam(key, parameter)); break;
      case "terms": href = routes.legal.terms; break;
      case "cookies": href = routes.legal.cookies; break;
      case "notice": href = routes.legal.notice; break;
      case "privacy": href = routes.legal.privacy; break;
      default: throw new Error(`Unknown Wix CMS routeKey "${key}".`);
    }
  }

  if (!href) return "";
  return fragment ? `${href}#${encodeURIComponent(fragment)}` : href;
}

function requireRouteParam(routeKey: string, parameter: string): string {
  if (!parameter) throw new Error(`Wix CMS routeKey "${routeKey}" requires routeParam.`);
  return parameter;
}

export function mapCmsLink(item: WixRecord, prefix = ""): Link | undefined {
  const capitalized = prefix ? `${prefix[0].toUpperCase()}${prefix.slice(1)}` : "";
  const label = asText(item[`${prefix}${prefix ? "CtaLabel" : "linkLabel"}`]) || asText(item[`${prefix}Label`]);
  const href = resolveCmsHref(
    item[`${prefix}${prefix ? "RouteKey" : "routeKey"}`] ?? item[`${capitalized}RouteKey`],
    item[`${prefix}${prefix ? "RouteParam" : "routeParam"}`] ?? item[`${capitalized}RouteParam`],
    item[`${prefix}${prefix ? "Anchor" : "anchor"}`] ?? item[`${capitalized}Anchor`],
    item[`${prefix}${prefix ? "ExternalUrl" : "externalUrl"}`] ?? item[`${capitalized}ExternalUrl`],
  );
  return label && href ? { label, href } : undefined;
}

export function mapSiteSettings(item: WixRecord, socialItems: WixRecord[]): SiteSettings {
  const template = asText(item.copyrightTemplate);
  const copyright = template.replaceAll("{year}", String(new Date().getFullYear()));
  return {
    promotion: asText(item.promotionText) || undefined,
    newsletter: {
      title: asText(item.newsletterTitle),
      description: asText(item.newsletterDescription),
      consentText: asText(item.newsletterConsentText),
    },
    footer: { image: wixUrl(item.footerImage) || undefined },
    contact: {
      about: asText(item.contactAbout),
      phone: asText(item.contactPhone),
      address: asText(item.contactAddress),
      copyright,
    },
    socials: socialItems.flatMap((social) => {
      const network = asText(social.networkKey) as SocialNetwork;
      const href = wixUrl(social.url);
      if (!socialNetworks.has(network) || !href) return [];
      return [{ network, label: asText(social.label) || network, href }];
    }),
  };
}

export type LocationLookup = Map<string, { slug: string; name: string; timezone: string }>;

export function mapRoom(item: WixRecord, locations: LocationLookup): Room {
  const id = asText(item.slug) || asText(item._id);
  const bookingUrl = wixUrl(item.bookingUrl);
  const location = locations.get(referenceId(item.location));
  const occupancyType = asText(item.occupancyType).toLowerCase();
  if (!id || !bookingUrl || !location) throw new Error(`CHRooms item "${id || "unknown"}" is missing slug, bookingUrl or a valid CHLocations reference.`);
  return {
    id,
    name: asText(item.name) || "Room",
    locationId: location.slug,
    locationName: location.name,
    occupancyType: occupancyType === "private" || occupancyType === "shared" ? occupancyType : undefined,
    image: wixUrl(item.image) || undefined,
    description: asText(item.description) || undefined,
    bookingUrl,
    houseLabel: asText(item.houseLabel) || undefined,
    gallery: wixGallery(item.gallery),
    features: asTextList(item.features),
    views: asText(item.views) || undefined,
    floorPlan: wixUrl(item.floorPlan) || undefined,
    price: asText(item.priceValue) ? { label: asText(item.priceLabel) || "Starting from", value: asText(item.priceValue) } : undefined,
  };
}

export function mapDeal(item: WixRecord): Deal {
  const slug = asText(item.slug) || asText(item._id);
  const title = asText(item.title);
  if (!slug || !title) throw new Error("CHDeals item is missing slug or title.");
  const ctaLabel = asText(item.ctaLabel);
  const ctaHref = resolveCmsHref(item.routeKey, undefined, undefined, item.externalUrl);
  return {
    slug,
    eyebrow: asText(item.eyebrow),
    title,
    description: asText(item.description),
    terms: asText(item.terms),
    cta: ctaLabel && ctaHref ? { label: ctaLabel, href: ctaHref } : undefined,
    image: wixUrl(item.image) || undefined,
  };
}

/** Keeps scheduled promotions inside their inclusive CMS validity window. */
export function isActiveDeal(item: WixRecord, now = new Date()): boolean {
  const startsOn = asDate(item.startsOn);
  if (startsOn && now < startsOn) return false;

  const endsOn = asDate(item.endsOn);
  if (!endsOn) return true;
  const inclusiveEnd = new Date(endsOn);
  inclusiveEnd.setUTCHours(23, 59, 59, 999);
  return now <= inclusiveEnd;
}

function asDate(value: unknown): Date | undefined {
  const serialized = value && typeof value === "object" ? (value as WixRecord).$date : undefined;
  const source = serialized ?? value;
  const date = source instanceof Date ? source : typeof source === "string" || typeof source === "number" ? new Date(source) : undefined;
  return date && !Number.isNaN(date.valueOf()) ? date : undefined;
}

function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function validateEventProgramReference(item: WixRecord, programs: Map<string, WixRecord>): void {
  const programId = referenceId(item.program);
  if (!programId) return;

  const slug = asText(item.slug) || asText(item._id) || "unknown";
  const program = programs.get(programId);
  if (!program) throw new Error(`CHEvents item "${slug}" references a missing or unpublished CHPrograms item.`);

  if (asText(program.locationScope) === "all") return;

  const eventLocationId = referenceId(item.location);
  const selectedLocations = Array.isArray(program.locations)
    ? program.locations.map(referenceId).filter(Boolean)
    : [];
  const legacyLocationId = referenceId(program.location);
  const allowedLocations = selectedLocations.length > 0
    ? selectedLocations
    : [legacyLocationId].filter(Boolean);
  if (!eventLocationId || !allowedLocations.includes(eventLocationId)) {
    throw new Error(`CHEvents item "${slug}" must use a location selected by its CHPrograms item.`);
  }
}

/**
 * Keeps upcoming events and events that are currently in progress.
 * An optional end date must be valid and cannot precede the start date.
 */
export function isCurrentOrUpcomingEvent(item: WixRecord, now = new Date()): boolean {
  const startsAt = asDate(item.startsAt);
  if (!startsAt) return false;

  const hasEndsAt = item.endsAt !== undefined && item.endsAt !== null && item.endsAt !== "";
  const endsAt = hasEndsAt ? asDate(item.endsAt) : undefined;
  if (hasEndsAt && !endsAt) return false;
  if (endsAt && endsAt < startsAt) return false;

  return (endsAt ?? startsAt) >= now;
}

export function mapEvent(item: WixRecord, locations: LocationLookup, programs = new Map<string, WixRecord>()): EventSummary {
  const slug = asText(item.slug) || asText(item._id);
  const title = asText(item.title);
  const location = locations.get(referenceId(item.location));
  const startsAt = asDate(item.startsAt);
  if (!slug || !title || !location || !startsAt) {
    throw new Error(`CHEvents item "${slug || "unknown"}" is missing slug, title, startsAt or a valid CHLocations reference.`);
  }
  const endsAt = asDate(item.endsAt);
  const timeZone = asText(item.timezone) || location.timezone;
  if (!timeZone || !isValidTimeZone(timeZone)) {
    throw new Error(`CHEvents item "${slug}" is missing a valid timezone.`);
  }
  const month = new Intl.DateTimeFormat("en", { month: "short", timeZone }).format(startsAt);
  const monthParts = new Intl.DateTimeFormat("en", { year: "numeric", month: "2-digit", timeZone }).formatToParts(startsAt);
  const monthKey = `${monthParts.find((part) => part.type === "year")?.value}-${monthParts.find((part) => part.type === "month")?.value}`;
  const day = new Intl.DateTimeFormat("en", { day: "numeric", timeZone }).format(startsAt);
  const dateLabel = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", timeZone }).format(startsAt);
  const startTime = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZone, timeZoneName: endsAt ? undefined : "short" }).format(startsAt);
  const endTime = endsAt ? new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZone, timeZoneName: "short" }).format(endsAt) : "";
  const program = programs.get(referenceId(item.program));
  const programSlug = asText(program?.slug);
  const programName = asText(program?.name);
  return {
    slug,
    city: location.slug,
    locationName: location.name,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt?.toISOString(),
    monthKey,
    program: programSlug && programName ? { slug: programSlug, name: programName } : undefined,
    title,
    subtitle: asText(item.subtitle) || undefined,
    month,
    day,
    dateLabel,
    timeLabel: endTime ? `${startTime} - ${endTime}` : startTime,
    image: wixUrl(item.image) || undefined,
    href: routes.event(slug),
  };
}

export function mapTeamMember(item: WixRecord): TeamMember {
  const slug = asText(item.slug) || asText(item._id);
  const name = asText(item.name);
  if (!slug || !name) throw new Error("CHPeople item is missing slug or name.");
  return {
    slug,
    name,
    role: asText(item.role),
    photo: wixUrl(item.photo) || undefined,
    href: wixUrl(item.profileUrl) || undefined,
  };
}

export function mapFaq(item: WixRecord): FaqItem {
  return {
    question: asText(item.question),
    answer: richContentBlocks(item.answer),
  };
}

export function mapPartner(item: WixRecord): Partner {
  return {
    slug: asText(item.slug) || asText(item._id),
    name: asText(item.name),
    description: asText(item.description),
    logo: wixUrl(item.logo) || undefined,
    href: wixUrl(item.url) || undefined,
    featured: asBoolean(item.featured),
  };
}

export function mapMembershipPlan(item: WixRecord): MembershipPlan {
  return {
    label: asText(item.label),
    price: asText(item.priceValue),
    note: asText(item.note) || undefined,
  };
}

const coworkingAmenityIcons = new Set(["wifi", "booths", "meeting", "printing", "gym", "events", "rooftop"] as const);
type CoworkingAmenityIcon = (typeof coworkingAmenityIcons extends Set<infer T> ? T : never);

/** Keeps editor-friendly Wix icon keys inside the finite icon vocabulary used by the UI. */
export function mapCoworkingAmenityIcon(value: unknown): CoworkingAmenityIcon {
  const key = asText(value).toLowerCase().replaceAll(/[-_\s]/g, "");
  const aliases: Record<string, CoworkingAmenityIcon> = {
    wifi: "wifi",
    highspeedwifi: "wifi",
    booth: "booths",
    booths: "booths",
    phonebooth: "booths",
    meeting: "meeting",
    meetingroom: "meeting",
    printing: "printing",
    printer: "printing",
    gym: "gym",
    fitness: "gym",
    event: "events",
    events: "events",
    rooftop: "rooftop",
    terrace: "rooftop",
  };
  const mapped = aliases[key];
  return mapped && coworkingAmenityIcons.has(mapped) ? mapped : "wifi";
}

function dateLabel(value: unknown): string {
  const date = asDate(value);
  return date
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date)
    : "";
}

export function mapNewsItem(item: WixRecord): NewsItem {
  const slug = asText(item.slug) || asText(item._id);
  return {
    title: asText(item.title),
    excerpt: asText(item.excerpt),
    contentType: articleContentType(item.contentType),
    category: asText(item.category),
    date: dateLabel(item.publishedAt),
    image: wixUrl(item.image) || undefined,
    href: `/posts/${encodeURIComponent(slug)}`,
  };
}

const articleContentTypes = new Set<ArticleContentType>([
  "news",
  "opinion",
  "feature",
  "guide",
  "announcement",
]);

export function articleContentType(value: unknown): ArticleContentType {
  const contentType = asText(value).toLowerCase() as ArticleContentType;
  if (!articleContentTypes.has(contentType)) {
    throw new Error(`Unknown CHNewsArticles contentType "${asText(value)}".`);
  }
  return contentType;
}

export function mapNewsArticle(item: WixRecord): NewsArticle {
  const slug = asText(item.slug) || asText(item._id);
  return {
    ...mapNewsItem(item),
    slug,
    body: richContentBlocks(item.body),
    seo: {
      title: asText(item.seoTitle) || asText(item.title),
      description: asText(item.seoDescription) || asText(item.excerpt),
    },
  };
}

export function mapLegalPage(item: WixRecord): LegalPage {
  const slug = asText(item.slug) || asText(item._id);
  return {
    slug,
    title: asText(item.title),
    body: richContentBlocks(item.body),
    seo: {
      title: asText(item.seoTitle) || asText(item.title),
      description: asText(item.seoDescription),
    },
    version: asText(item.version) || undefined,
    effectiveFrom: dateLabel(item.effectiveFrom) || undefined,
  };
}

export function mapSpace(item: WixRecord, location?: WixRecord): Space & { size: "large" | "medium" | "small" } {
  const status = asText(item.status).toLowerCase().replaceAll("-", "");
  const size = asText(item.homeCardSize);
  const locationSlug = asText(location?.slug);
  const routeSlug = asText(item.routeSlug);
  return {
    category: asText(item.categoryLabel) || asText(item.spaceType),
    title: asText(item.title),
    description: asText(item.description) || undefined,
    access: asText(item.accessLabel) || undefined,
    address: asText(item.addressOverride) || asText(location?.address) || undefined,
    comingSoon: status === "comingsoon",
    image: wixUrl(item.image) || undefined,
    href: locationSlug
      ? asBoolean(item.discoverable) && routeSlug
        ? routes.locationSpace(locationSlug, routeSlug)
        : routes.location(locationSlug)
      : undefined,
    size: size === "medium" || size === "small" ? size : "large",
  };
}

export function mapNavigationItem(item: WixRecord, children: readonly NavigationItem[] = []): NavigationItem {
  const label = asText(item.label);
  const status = asText(item.status).toLowerCase().replaceAll("-", "");
  if (status === "hidden") return { status: "hidden", label };
  if (status === "comingsoon") {
    return {
      status: "comingSoon",
      label,
      badge: asText(item.badge) || undefined,
      image: wixUrl(item.image) || undefined,
    };
  }
  const href = resolveCmsHref(item.routeKey, item.routeParam, item.anchor, item.externalUrl);
  if (!href) return { status: "hidden", label };
  return {
    status: "link",
    label,
    href,
    image: wixUrl(item.image) || undefined,
    menuLabel: asText(item.menuLabel) || undefined,
    children: children.length ? children : undefined,
  };
}

export function mapLocationNavigationItem(location: WixRecord): NavigationItem | undefined {
  const slug = asText(location.slug);
  if (!slug || !asBoolean(location.published)) return undefined;
  const place = asText(location.shortName) || asText(location.city) || asText(location.name) || slug;
  const country = asText(location.country);
  return {
    status: "link",
    label: [place, country].filter(Boolean).join(", "),
    href: routes.location(slug),
    image: wixUrl(location.cardImage) || wixUrl(location.heroImage) || undefined,
  };
}

export function hasPersonType(item: WixRecord, type: string): boolean {
  return asTextList(item.personTypes).map((value) => value.toLowerCase()).includes(type.toLowerCase());
}
