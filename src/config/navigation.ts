import type { NavigationItem, SiteNavigation } from "@/domain/navigation";

export const routes = {
  home: "/home",
  rooms: "/rooms",
  deals: "/deals",
  memberships: "/memberships",
  lifeAtCircles: "/life-at-circles",
  whatIsCircles: "/what-is-circles",
  team: "/team",
  forInvestors: "/investors",
  partnerships: "/partnerships",
  ambassadors: "/ambassadors",
  events: "/events",
  posts: "/posts",
  postCategory: (category: string) => `/posts?category=${encodeURIComponent(category)}`,
  location: (city: string) => `/locations/${city}`,
  locationRoom: (city: string, room: string) => `/locations/${city}/rooms/${room}`,
  locationSpace: (city: string, space: string) => `/locations/${city}/spaces/${space}`,
  coworking: (city: string) => `/coworking/${city}`,
  cityEvents: (city: string) => `/events?location=${encodeURIComponent(city)}`,
  event: (slug: string) => `/events/${slug}`,
  cityRooms: (city: string) => `/rooms/${city}`,
  month: (slug: string) => `/months/${slug}`,
  stayCampaign: (city: string, period: string) => `/locations/${city}/stays/${period}`,
  program: (slug: string) => `/programs/${slug}`,
  legal: {
    terms: "/legal/terms",
    cookies: "/legal/cookies",
    notice: "/legal/notice",
    privacy: "/legal/privacy",
  },
} as const;

const locations = [
  { status: "link", label: "Barcelona, Spain", href: routes.location("barcelona"), image: "/images/locations/barcelona/house-exterior.png" },
  { status: "comingSoon", label: "Andorra, Andorra", badge: "Coming soon", image: "/images/locations/andorra/landscape.png" },
] satisfies readonly NavigationItem[];

const coliving: NavigationItem = {
  status: "link",
  label: "Coliving",
  href: routes.location("barcelona"),
  menuLabel: "Coliving at",
  children: locations,
};

const coworking: NavigationItem = {
  status: "link",
  label: "Coworking",
  href: routes.coworking("barcelona"),
  menuLabel: "Coworking at",
  children: [
    { status: "link", label: "Barcelona, Spain", href: routes.coworking("barcelona"), image: "/images/locations/barcelona/house-exterior.png" },
    { status: "comingSoon", label: "Andorra, Andorra", badge: "Coming soon", image: "/images/locations/andorra/landscape.png" },
  ],
};

const community: NavigationItem = {
  status: "link",
  label: "Community",
  href: routes.lifeAtCircles,
  children: [
    { status: "link", label: "Life@Circles", href: routes.lifeAtCircles },
    { status: "link", label: "Members Hub", href: routes.memberships },
  ],
};

const happeningNow: NavigationItem = {
  status: "link",
  label: "Events",
  href: routes.events,
  children: [
    { status: "link", label: "All events", href: routes.events },
    { status: "link", label: "Barcelona events", href: routes.cityEvents("barcelona") },
    { status: "link", label: "Founders Month", href: routes.program("founders-month") },
  ],
};

const about: NavigationItem = {
  status: "link",
  label: "About",
  href: routes.whatIsCircles,
  children: [
    { status: "link", label: "What is Circles", href: routes.whatIsCircles },
    { status: "link", label: "Team", href: routes.team },
    { status: "link", label: "For Investors", href: routes.forInvestors },
    { status: "link", label: "Partnerships", href: routes.partnerships },
    { status: "link", label: "Ambassadors", href: routes.ambassadors },
  ],
};

const postsNavigation = { status: "link", label: "Posts", href: routes.posts } as const;
const dealsNavigation = { status: "link", label: "Deals", href: routes.deals } as const;

export function withPostsNavigation(items: readonly NavigationItem[]): readonly NavigationItem[] {
  if (items.some((item) => item.status === "link" && item.href === routes.posts)) return items;

  const eventsIndex = items.findIndex((item) => item.status === "link" && item.href === routes.events);
  if (eventsIndex < 0) return [...items, postsNavigation];
  return [...items.slice(0, eventsIndex + 1), postsNavigation, ...items.slice(eventsIndex + 1)];
}

export function withDealsNavigation(items: readonly NavigationItem[]): readonly NavigationItem[] {
  if (items.some((item) => item.status === "link" && item.href === routes.deals)) return items;
  return [...items, dealsNavigation];
}

const primary = [
  coliving,
  coworking,
  community,
  happeningNow,
  postsNavigation,
  about,
  dealsNavigation,
] satisfies readonly NavigationItem[];

export const bookStayLink = { status: "link", label: "Book a Stay", href: routes.rooms } as const;

export const siteNavigation: SiteNavigation = {
  header: {
    locations,
    primary,
    actions: {
      book: bookStayLink,
    },
  },
  footer: {
    main: [...primary, bookStayLink],
    extras: [
      { status: "link", label: "News", href: routes.posts },
      { status: "link", label: "Coworking Barcelona", href: routes.coworking("barcelona") },
      { status: "comingSoon", label: "Coworking Andorra", badge: "Coming soon" },
      { status: "comingSoon", label: "Spa Andorra", badge: "Coming soon" },
      { status: "link", label: "Events Barcelona", href: routes.cityEvents("barcelona") },
      { status: "hidden", label: "Events Andorra" },
      { status: "link", label: "Become an Ambassador", href: routes.ambassadors },
    ],
    legal: [
      { status: "link", label: "Terms & Conditions", href: routes.legal.terms },
      { status: "link", label: "Cookies Policy", href: routes.legal.cookies },
      { status: "link", label: "Legal Notice", href: routes.legal.notice },
      { status: "link", label: "Privacy Policy", href: routes.legal.privacy },
    ],
  },
};
