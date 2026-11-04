import { routes } from "../../config/navigation";
import type { Deal, EventSummary, Link, SiteSettings, SocialNetwork, TeamMember } from "@/domain/content";
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

export function asTextList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(asText).filter(Boolean) : [];
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
      case "rooms": href = routes.rooms; break;
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
      case "news": href = routes.news; break;
      case "co-owners":
      case "coOwners": href = routes.coOwners; break;
      case "location": href = routes.location(requireRouteParam(key, parameter)); break;
      case "coworking": href = routes.coworking(requireRouteParam(key, parameter)); break;
      case "month":
      case "program": href = routes.month(requireRouteParam(key, parameter)); break;
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
  if (!id || !bookingUrl || !location) throw new Error(`CHRooms item "${id || "unknown"}" is missing slug, bookingUrl or a valid CHLocations reference.`);
  return {
    id,
    name: asText(item.name) || "Room",
    locationId: location.slug,
    locationName: location.name,
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

function asDate(value: unknown): Date | undefined {
  const date = value instanceof Date ? value : typeof value === "string" || typeof value === "number" ? new Date(value) : undefined;
  return date && !Number.isNaN(date.valueOf()) ? date : undefined;
}

export function mapEvent(item: WixRecord, locations: LocationLookup): EventSummary {
  const slug = asText(item.slug) || asText(item._id);
  const title = asText(item.title);
  const location = locations.get(referenceId(item.location));
  const startsAt = asDate(item.startsAt);
  if (!slug || !title || !location || !startsAt) {
    throw new Error(`CHEvents item "${slug || "unknown"}" is missing slug, title, startsAt or a valid CHLocations reference.`);
  }
  const endsAt = asDate(item.endsAt);
  const timeZone = asText(item.timezone) || location.timezone || "UTC";
  const month = new Intl.DateTimeFormat("en", { month: "short", timeZone }).format(startsAt);
  const day = new Intl.DateTimeFormat("en", { day: "numeric", timeZone }).format(startsAt);
  const dateLabel = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", timeZone }).format(startsAt);
  const startTime = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZone, timeZoneName: endsAt ? undefined : "short" }).format(startsAt);
  const endTime = endsAt ? new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZone, timeZoneName: "short" }).format(endsAt) : "";
  return {
    slug,
    city: location.slug,
    title,
    subtitle: asText(item.subtitle) || undefined,
    month,
    day,
    dateLabel,
    timeLabel: endTime ? `${startTime} - ${endTime}` : startTime,
    image: wixUrl(item.image) || undefined,
    href: wixUrl(item.externalUrl) || undefined,
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

export function hasPersonType(item: WixRecord, type: string): boolean {
  return asTextList(item.personTypes).map((value) => value.toLowerCase()).includes(type.toLowerCase());
}
