import { items } from "@wix/data";
import type { AmbassadorsPage, ContentRepository, Deal, HomePage, SiteSettings } from "@/domain/content";
import type { Room } from "@/domain/booking";

const COLLECTIONS = {
  siteSettings: "SiteSettings",
  homePage: "HomePage",
  ambassadorsPage: "AmbassadorsPage",
  rooms: "Rooms",
  deals: "Deals",
} as const;

async function getSingleton<T>(collectionId: string, key = "global"): Promise<T> {
  const result = await items.query(collectionId).eq("key", key).limit(1).find({ consistentRead: true });
  const item = result.items[0];
  if (!item) throw new Error(`Wix CMS collection "${collectionId}" does not contain the "${key}" singleton.`);
  return item as T;
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
  };
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
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

export const wixCmsRepository: ContentRepository = {
  getSiteSettings: () => getSingleton<SiteSettings>(COLLECTIONS.siteSettings),
  getHomePage: () => getSingleton<HomePage>(COLLECTIONS.homePage),
  getAmbassadorsPage: () => getSingleton<AmbassadorsPage>(COLLECTIONS.ambassadorsPage),
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
