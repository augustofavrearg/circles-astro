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
};

export type SpaceAmenity = "coliving" | "coworking";

export type Space = {
  category: string;
  title: string;
  description?: string;
  access?: string;
  address?: string;
  comingSoon?: boolean;
  image?: string;
  href?: string;
  details?: {
    about?: string;
    rating?: number;
    price?: { label: string; value: string };
    amenities?: SpaceAmenity[];
    directions?: string;
    mapImage?: string;
    page?: Link;
    cta?: Link;
  };
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

export interface ContentRepository {
  getSiteSettings(): Promise<SiteSettings>;
  getHomePage(): Promise<HomePage>;
  getRooms(location?: string): Promise<import("./booking").Room[]>;
}
