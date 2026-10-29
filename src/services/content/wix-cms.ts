import { items } from "@wix/data";
import type {
  AmbassadorsPage,
  ContentRepository,
  CoworkingPage,
  Deal,
  EventSummary,
  EventsPage,
  ForInvestorsPage,
  HomePage,
  LifePage,
  MembershipsPage,
  MonthPage,
  PartnershipsPage,
  SiteSettings,
  TeamMember,
  TeamPage,
  WhatIsCirclesPage,
} from "@/domain/content";
import type { Room } from "@/domain/booking";

const COLLECTIONS = {
  siteSettings: "SiteSettings",
  homePage: "HomePage",
  ambassadorsPage: "AmbassadorsPage",
  partnershipsPage: "PartnershipsPage",
  forInvestorsPage: "ForInvestorsPage",
  teamPage: "TeamPage",
  teamMembers: "TeamMembers",
  whatIsCirclesPage: "WhatIsCirclesPage",
  membershipsPage: "MembershipsPage",
  monthPages: "MonthPages",
  coworkingPages: "CoworkingPages",
  lifePage: "LifePage",
  rooms: "Rooms",
  deals: "Deals",
  eventsPage: "EventsPage",
  events: "Events",
} as const;

async function getSingleton<T>(collectionId: string, key = "global"): Promise<T> {
  const result = await items.query(collectionId).eq("key", key).limit(1).find({ consistentRead: true });
  const item = result.items[0];
  if (!item) throw new Error(`Wix CMS collection "${collectionId}" does not contain the "${key}" singleton.`);
  return item as T;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function textList(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : undefined;
}

function mapRoom(item: Record<string, unknown>): Room {
  const id = String(item.slug ?? item._id ?? "");
  const bookingUrl = String(item.bookingUrl ?? "");
  if (!id || !bookingUrl) throw new Error("Wix CMS room is missing slug or bookingUrl.");
  return {
    id,
    name: String(item.name ?? "Room"),
    locationId: String(item.locationId ?? ""),
    locationName: String(item.locationName ?? ""),
    image: typeof item.image === "string" ? item.image : undefined,
    description: typeof item.description === "string" ? item.description : undefined,
    bookingUrl,
    houseLabel: text(item.houseLabel) || undefined,
    gallery: textList(item.gallery),
    features: textList(item.features),
    views: text(item.views) || undefined,
    floorPlan: text(item.floorPlan) || undefined,
    price: text(item.priceValue) ? { label: text(item.priceLabel) || "Starting from", value: text(item.priceValue) } : undefined,
  };
}

function mapDeal(item: Record<string, unknown>): Deal {
  const slug = text(item.slug) || text(item._id);
  const title = text(item.title);
  if (!slug || !title) throw new Error("Wix CMS deal is missing slug or title.");
  const ctaLabel = text(item.ctaLabel);
  const ctaHref = text(item.ctaHref);
  return {
    slug,
    eyebrow: text(item.eyebrow),
    title,
    description: text(item.description),
    terms: text(item.terms),
    cta: ctaLabel && ctaHref ? { label: ctaLabel, href: ctaHref } : undefined,
    image: text(item.image) || undefined,
  };
}

function mapEvent(item: Record<string, unknown>): EventSummary {
  const slug = text(item.slug) || text(item._id);
  const title = text(item.title);
  const city = text(item.city);
  if (!slug || !title || !city) throw new Error("Wix CMS event is missing slug, title or city.");
  return {
    slug,
    city,
    title,
    subtitle: text(item.subtitle) || undefined,
    month: text(item.month),
    day: text(item.day),
    dateLabel: text(item.dateLabel),
    timeLabel: text(item.timeLabel),
    image: text(item.image) || undefined,
    href: text(item.href) || undefined,
  };
}

function mapTeamMember(item: Record<string, unknown>): TeamMember {
  const slug = text(item.slug) || text(item._id);
  const name = text(item.name);
  if (!slug || !name) throw new Error("Wix CMS team member is missing slug or name.");
  return {
    slug,
    name,
    role: text(item.role),
    photo: text(item.photo) || undefined,
    href: text(item.href) || undefined,
  };
}

export const wixCmsRepository: ContentRepository = {
  getSiteSettings: () => getSingleton<SiteSettings>(COLLECTIONS.siteSettings),
  getHomePage: () => getSingleton<HomePage>(COLLECTIONS.homePage),
  getAmbassadorsPage: () => getSingleton<AmbassadorsPage>(COLLECTIONS.ambassadorsPage),
  getPartnershipsPage: () => getSingleton<PartnershipsPage>(COLLECTIONS.partnershipsPage),
  getForInvestorsPage: () => getSingleton<ForInvestorsPage>(COLLECTIONS.forInvestorsPage),
  getTeamPage: () => getSingleton<TeamPage>(COLLECTIONS.teamPage),
  getWhatIsCirclesPage: () => getSingleton<WhatIsCirclesPage>(COLLECTIONS.whatIsCirclesPage),
  getMembershipsPage: () => getSingleton<MembershipsPage>(COLLECTIONS.membershipsPage),
  getLifePage: () => getSingleton<LifePage>(COLLECTIONS.lifePage),
  async getCoworkingPage(city: string) {
    const result = await items.query(COLLECTIONS.coworkingPages).eq("city", city).eq("published", true).limit(1).find({ consistentRead: true });
    return result.items[0] as unknown as CoworkingPage | undefined;
  },
  async getMonthPage(slug: string) {
    const result = await items.query(COLLECTIONS.monthPages).eq("slug", slug).eq("published", true).limit(1).find({ consistentRead: true });
    return result.items[0] as unknown as MonthPage | undefined;
  },
  async getTeamMembers() {
    const result = await items.query(COLLECTIONS.teamMembers).eq("published", true).ascending("sortOrder").limit(100).find({ consistentRead: true });
    return result.items.map((item) => mapTeamMember(item as Record<string, unknown>));
  },
  getEventsPage: () => getSingleton<EventsPage>(COLLECTIONS.eventsPage),
  async getEvents(city?: string) {
    let query = items.query(COLLECTIONS.events).eq("published", true).ascending("sortOrder").limit(100);
    if (city) query = query.eq("city", city);
    const result = await query.find({ consistentRead: true });
    return result.items.map((item) => mapEvent(item as Record<string, unknown>));
  },
  async getDeals() {
    const result = await items.query(COLLECTIONS.deals).eq("published", true).ascending("sortOrder").limit(50).find({ consistentRead: true });
    return result.items.map((item) => mapDeal(item as Record<string, unknown>));
  },
  async getRooms(location?: string) {
    let query = items.query(COLLECTIONS.rooms).eq("published", true).ascending("sortOrder").limit(100);
    if (location) query = query.eq("locationId", location);
    const result = await query.find({ consistentRead: true });
    return result.items.map((item) => mapRoom(item as Record<string, unknown>));
  },
};
