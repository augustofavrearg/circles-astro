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

export type LocationSpaceSummary = {
  slug: string;
  routeSlug: string;
  location: { slug: string; name: string };
  category: string;
  title: string;
  description: string;
  access?: string;
  address?: string;
  status: "active" | "comingSoon";
  image?: string;
  href: string;
};

export type LocationSpacePage = LocationSpaceSummary & {
  seo: { title: string; description: string };
  gallery: string[];
  amenities: string[];
  hours?: string;
  cta?: Link;
  story?: { eyebrow?: string; title: string; text: string; image?: string };
  faq?: FaqSection;
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

export type ArticleContentType = "news" | "opinion" | "feature" | "guide" | "announcement";

export type NewsItem = {
  title: string;
  excerpt: string;
  contentType: ArticleContentType;
  category: string;
  date: string;
  image?: string;
  href: string;
};

export type NewsArticle = NewsItem & {
  slug: string;
  body: FaqBlock[];
  /** Native Wix Blog document, rendered with Ricos when present. */
  richContent?: unknown;
  imageAlt?: string;
  minutesToRead?: number;
  seo: { title: string; description: string };
};

export type PostCategory = {
  slug: string;
  label: string;
  postCount: number;
};

export type PostsPage = {
  items: NewsArticle[];
  categories: PostCategory[];
  activeCategory?: PostCategory;
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

export type LegalPage = {
  slug: string;
  title: string;
  body: FaqBlock[];
  seo: { title: string; description: string };
  version?: string;
  effectiveFrom?: string;
};

export type SiteSettings = {
  promotion?: string;
  newsletter: {
    title: string;
    description: string;
    consentText: string;
  };
  footer: {
    image?: string;
  };
  contact: {
    about: string;
    phone: string;
    address: string;
    copyright: string;
  };
  socials: { network: SocialNetwork; label: string; href: string }[];
  interfaceCopy?: Record<string, string>;
  navigation?: import("./navigation").SiteNavigation;
};

export type HomePage = {
  seo: { title: string; description: string };
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
    video?: string;
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
};

/** A FAQ answer as plain blocks, so fixtures and the CMS can share one shape. */
export type FaqBlock = { type: "paragraph"; text: string } | { type: "list"; items: string[] };

export type FaqItem = {
  question: string;
  answer: FaqBlock[];
};

/** Intro block shared by the Ambassadors and Partnerships pages. */
export type PageIntro = {
  eyebrow: string;
  title: string;
  lead: string;
  /** Line breaks are kept, as in Figma. */
  body: string;
  /** Short aside: next to the image on desktop, below it on mobile. */
  note?: string;
  cta?: Link;
  /** Outlined button shown before `cta`. */
  secondaryCta?: Link;
  image?: string;
};

/** Yellow call-to-action band (Partnerships, For Investors); the body reuses the site promotion text. */
export type CtaBand = { title: string; primaryCta?: Link; secondaryCta?: Link };

export type RoomsPage = {
  seo: { title: string; description: string };
  intro: { eyebrow: string; title: string; body: string };
  band: CtaBand;
  empty: { title: string; body: string; cta: Link };
};

export type FaqSection = { eyebrow: string; title: string; items: FaqItem[] };

export type AmbassadorsPage = {
  seo: { title: string; description: string };
  intro: PageIntro;
  faq?: FaqSection;
};

export type Partner = {
  slug: string;
  name: string;
  description: string;
  /** Logo file; the name is shown in its place until one exists. */
  logo?: string;
  href?: string;
  /** Highlighted as "Partner of the month". */
  featured?: boolean;
};

export type PartnershipsPage = {
  seo: { title: string; description: string };
  intro: PageIntro;
  partners: {
    eyebrow?: string;
    title?: string;
    featuredLabel?: string;
    items: Partner[];
    source?: import("./editorial").SectionSourceConfig;
  };
  membership?: CtaBand;
  faq?: FaqSection;
};

/** A promotion on /deals. `description` keeps paragraphs separated by a blank line. */
export type Deal = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  terms: string;
  cta?: Link;
  image?: string;
};

export type DealsPage = {
  seo: { title: string; description: string };
  deals: {
    eyebrow?: string;
    title?: string;
    emptyText: string;
    source?: import("./editorial").SectionSourceConfig;
  };
};

/** An event on the /events listing (Figma "Events" rows). `city` is the city slug. */
export type EventSummary = {
  slug: string;
  city: string;
  locationName?: string;
  startsAt?: string;
  endsAt?: string;
  /** Calendar month at the event location, formatted as YYYY-MM. */
  monthKey?: string;
  program?: { slug: string; name: string };
  title: string;
  subtitle?: string;
  month: string;
  day: string | number;
  dateLabel: string;
  timeLabel: string;
  image?: string;
  href?: string;
};

export type EventFilters = {
  /** At most one location slug is accepted by the events route. */
  locations?: string[];
  /** At most one program slug is accepted by the events route. */
  programs?: string[];
  /** Calendar month at each event's location, formatted as YYYY-MM. */
  month?: string;
};

export type ProgramSummary = {
  slug: string;
  name: string;
  locations: { slug: string; name: string }[];
  locationScope: "selected" | "all";
};

export type EventListingHeading = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export type EventsPage = {
  title: string;
  subtitle: string;
  /** Eyebrow per city slug, plus `all` for the unfiltered listing. */
  eyebrows: Record<string, string>;
  cities: { slug: string; name: string }[];
  listingHeadings: {
    all: EventListingHeading;
    locations: Record<string, EventListingHeading>;
    programs: Record<string, EventListingHeading>;
  };
};

/** A reusable event series exposed independently from calendar month pages. */
export type ProgramPage = {
  slug: string;
  name: string;
  theme: string;
  locations: { slug: string; name: string }[];
  locationScope: "selected" | "all";
  startsOn?: string;
  endsOn?: string;
  registrationEnabled: boolean;
  seo: { title: string; description: string };
  events: EventSummary[];
};

export type InvestorBenefit = { label: string; title: string; text: string; image?: string };

export type InvestorFeature = { title: string; text: string; cta?: Link; image?: string };

export type ForInvestorsPage = {
  seo: { title: string; description: string };
  intro: PageIntro;
  benefits?: { eyebrow: string; title: string; items: InvestorBenefit[] };
  features?: { eyebrow: string; title: string; items: InvestorFeature[] };
  band?: CtaBand;
  faq?: FaqSection;
};

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  photo?: string;
  /** "Learn more" destination; the link is hidden without one. */
  href?: string;
};

export type TeamPage = {
  seo: { title: string; description: string };
  intro: PageIntro;
  members?: { eyebrow?: string; title?: string };
  band?: CtaBand;
  faq?: FaqSection;
};

export type WhatIsCirclesPage = {
  seo: { title: string; description: string };
  intro: PageIntro;
  purpose: { eyebrow: string; text: string };
  values: { eyebrow: string; title: string; items: { title: string; text: string }[] };
  edge: { title: string; text: string; footnote?: string; image?: string };
  /** `lead` and `paragraphs` keep Figma's line breaks. */
  manifesto: { eyebrow: string; title: string; lead: string; paragraphs: string[]; images: string[] };
  faq: FaqSection;
};

export type MembershipPlan = {
  /** Toggle label, e.g. "Yearly". */
  label: string;
  price: string;
  note?: string;
};

export type Member = { name: string; bio: string; photo?: string };

export type MembershipsPage = {
  seo: { title: string; description: string };
  intro: { eyebrow: string; title: string; body: string; cta: Link; image?: string };
  benefits: { eyebrow: string; title: string; image?: string; items: { title: string; text: string }[] };
  hub: {
    eyebrow: string;
    title: string;
    subtitle: string;
    /** The first topic is highlighted, as in Figma. */
    topics: string[];
    text: string;
    images: string[];
    stats: { icon: "globe" | "age" | "stay"; label: string }[];
  };
  band: CtaBand;
  faq: FaqSection;
};

/** An event outside Circles, shown in the month pages' carousels. */
export type ExternalEvent = { title: string; venue: string; dateLabel: string; timeLabel: string; image?: string; href?: string };

export type EventCarousel = { eyebrow: string; title: string; items: ExternalEvent[] };

/** Application form copy; where submissions go is still undecided, so the form renders disabled. */
export type StayForm = { eyebrow: string; title: string; subtitle: string; image?: string };

export type MonthPage = {
  slug: string;
  /** City slug used to pick the rooms and events. */
  city: string;
  seo: { title: string; description: string };
  hero: { eyebrow: string; title: string; body: string; cta?: Link; image?: string };
  form: StayForm;
  space: { eyebrow: string; title: string; spaces: HomePage["network"]["spaces"] };
  rooms: { eyebrow: string; title: string; text: string };
  band: CtaBand;
  events: { eyebrow: string; title: string };
  external?: EventCarousel;
  seasonal?: EventCarousel;
  faq?: FaqSection;
};

export type StayCampaign = {
  campaignKey: string;
  name: string;
  period: string;
  legacyRouteParam?: string;
  location: { slug: string; name: string };
  page: MonthPage;
};

export type CoworkingAmenity = "wifi" | "booths" | "meeting" | "printing" | "gym" | "events" | "rooftop";

export type CoworkingPlan = {
  title: string;
  subtitle: string;
  includes: string[];
  price: string;
  /** Shown on the red card in Figma. */
  highlighted?: boolean;
  cta?: Link;
  secondaryCta?: Link;
};

export type CoworkingPage = {
  /** City slug, e.g. "barcelona". */
  city: string;
  seo: { title: string; description: string };
  hero: { eyebrow: string; title: string; subtitle: string; image?: string; cta?: Link };
  spaces: {
    eyebrow: string;
    items: { title: string; text: string; images: string[] }[];
    amenities: { icon: CoworkingAmenity; label: string }[];
    cta?: Link;
  };
  pricing: { eyebrow: string; title: string; includesLabel: string; plans: CoworkingPlan[] };
  band: CtaBand;
  faq: FaqSection;
};

export type LifeHighlight = {
  stat: { value: string; label: string; illustration?: string };
  photo: { title: string; image?: string };
};

export type LifePage = {
  seo: { title: string; description: string };
  intro: { eyebrow: string; title: string; body: string };
  highlights: LifeHighlight[];
  spaces: CoworkingPage["spaces"];
  band: CtaBand;
  faq: FaqSection;
};

/** A photo with a caption, as in the location pages' "Travel slowly" carousel. */
export type Experience = { title: string; text: string; image?: string; wide?: boolean };

export type LocationPage = {
  /** City slug, e.g. "barcelona"; also picks the rooms and the default events filter. */
  slug: string;
  seo: { title: string; description: string };
  hero: {
    eyebrow: string;
    title: string;
    image?: string;
    card: { eyebrow: string; title: string; text: string; cta?: Link; amenities: SpaceAmenity[]; access?: string };
  };
  space: { title: string; text: string; amenitiesLabel: string; amenities: string[]; image?: string };
  rooms: {
    eyebrow: string;
    title: string;
    text: string;
    source?: import("./editorial").SectionSourceConfig;
  };
  band: CtaBand;
  experiences: { eyebrow: string; title: string; subtitle: string; items: Experience[] };
  location: { eyebrow: string; title: string; text: string; address?: string; mapHref?: string };
  manager: { eyebrow: string; title: string; paragraphs: string[]; image?: string };
  faq: FaqSection;
};

export interface ContentRepository {
  getSiteSettings(): Promise<SiteSettings>;
  getHomePage(): Promise<HomePage>;
  getRoomsPage(): Promise<RoomsPage>;
  getSearchLocations(): Promise<SearchLocation[]>;
  getAmbassadorsPage(): Promise<AmbassadorsPage>;
  getPartnershipsPage(): Promise<PartnershipsPage>;
  getForInvestorsPage(): Promise<ForInvestorsPage>;
  getTeamPage(): Promise<TeamPage>;
  getTeamMembers(): Promise<TeamMember[]>;
  getWhatIsCirclesPage(): Promise<WhatIsCirclesPage>;
  getMembershipsPage(): Promise<MembershipsPage>;
  getMonthPage(slug: string): Promise<MonthPage | undefined>;
  getStayCampaign(location: string, period: string): Promise<StayCampaign | undefined>;
  getStayCampaignByLegacySlug(slug: string): Promise<StayCampaign | undefined>;
  getProgramPage(slug: string): Promise<ProgramPage | undefined>;
  getPrograms(): Promise<ProgramSummary[]>;
  getCoworkingPage(city: string): Promise<CoworkingPage | undefined>;
  getLifePage(): Promise<LifePage>;
  getLocationPage(slug: string): Promise<LocationPage | undefined>;
  getLocationSpaces(location: string): Promise<LocationSpaceSummary[]>;
  getLocationSpace(location: string, space: string): Promise<LocationSpacePage | undefined>;
  getDealsPage(): Promise<DealsPage>;
  getDeals(): Promise<Deal[]>;
  getPartners(): Promise<Partner[]>;
  getEventsPage(): Promise<EventsPage>;
  getEvents(filters?: EventFilters): Promise<EventSummary[]>;
  getEvent(slug: string): Promise<EventSummary | undefined>;
  getRooms(location?: string): Promise<import("./booking").Room[]>;
  getRoom(location: string, room: string): Promise<import("./booking").RoomDetailPage | undefined>;
  getPostsPage(page?: number, pageSize?: number, category?: string): Promise<PostsPage>;
  getPost(slug: string): Promise<NewsArticle | undefined>;
  getLegalPage(slug: string): Promise<LegalPage | undefined>;
}
