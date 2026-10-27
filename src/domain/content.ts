export type Link = { label: string; href: string };

export type SocialNetwork =
  | "whatsapp"
  | "instagram"
  | "tiktok"
  | "linkedin"
  | "facebook"
  | "youtube"
  | "pinterest";

export type SearchLocation = {
  slug: string;
  name: string;
  city: string;
  comingSoon?: boolean;
  image?: string;
};

export type Location = {
  name: string;
  address: string;
  href: string;
  image?: string;
  access?: string;
  /** When present, the slider card opens the detail panel instead of following `href`. */
  details?: PlaceDetails;
};

export type SpaceAmenity = "coliving" | "coworking";

/** Detail panel content shared by the locations slider and the network carousel. */
export type PlaceDetails = {
  /** Panel eyebrow, e.g. "Coworking location"; falls back to the card category. */
  category?: string;
  about?: string;
  rating?: number;
  price?: { label: string; value: string };
  amenities?: SpaceAmenity[];
  directions?: string;
  mapImage?: string;
  page?: Link;
  cta?: Link;
};

export type Space = {
  category: string;
  title: string;
  description?: string;
  access?: string;
  address?: string;
  comingSoon?: boolean;
  image?: string;
  href?: string;
  details?: PlaceDetails;
};

export type CircleEvent = {
  title: string;
  description: string;
  access: string;
  month: string;
  day: string | number;
  dateLabel: string;
  timeLabel: string;
  image?: string;
  cta?: Link;
  city: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  source: string;
  href?: string;
};

export type NewsItem = {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image?: string;
  href: string;
};

export type SiteSettings = {
  promotion?: string;
  mainNav: Link[];
  login: Link;
  book: Link;
  footer: {
    main: Link[];
    extras: Link[];
    legal: Link[];
    image?: string;
  };
  contact: {
    about: string;
    phone: string;
    address: string;
    copyright: string;
  };
  socials: { network: SocialNetwork; label: string; href: string }[];
};

export type HomePage = {
  hero: {
    title: string;
    description: string;
    video?: { label: string; poster?: string; src?: string };
  };
  slider: Location[];
  searchLocations: SearchLocation[];
  network: {
    eyebrow: string;
    title: string;
    spaces: (Space & { size: "large" | "medium" | "small" })[];
  };
  happeningNow: {
    eyebrow: string;
    title: string;
    cities: string[];
    viewAll: Link;
    events: CircleEvent[];
  };
  memberships: {
    eyebrow: string;
    title: string;
    description: string;
    cta: Link;
    highlights: string[];
    image?: string;
    thumbnail?: string;
  };
  introduction: {
    title: string;
    highlight: string;
    intro: string;
    body: string;
    cta: Link;
    images?: { main?: string; left?: string; right?: string };
  };
  testimonials: Testimonial[];
  news: { eyebrow: string; title: string; items: NewsItem[] };
  newsletter: { description: string };
};

/** A FAQ answer as plain blocks, so fixtures and the CMS can share one shape. */
export type FaqBlock = { type: "paragraph"; text: string } | { type: "list"; items: string[] };

export type FaqItem = {
  question: string;
  answer: FaqBlock[];
};

export type AmbassadorsPage = {
  seo: { title: string; description: string };
  intro: {
    eyebrow: string;
    title: string;
    lead: string;
    body: string;
    cta?: Link;
    image?: string;
  };
  faq: { eyebrow: string; title: string; items: FaqItem[] };
};

export interface ContentRepository {
  getSiteSettings(): Promise<SiteSettings>;
  getHomePage(): Promise<HomePage>;
  getAmbassadorsPage(): Promise<AmbassadorsPage>;
  getRooms(location?: string): Promise<import("./booking").Room[]>;
}
