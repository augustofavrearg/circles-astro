import type { NavigationItem, SiteNavigation } from "@/domain/navigation";

export const routes = {
  home: "/home",
  rooms: "/rooms",
  deals: "/deals",
  memberships: "/memberships",
  lifeAtCircles: "/life-at-circles",
  whatIsCircles: "/what-is-circles",
  team: "/team",
  forInvestors: "/for-investors",
  partnerships: "/partnerships",
  ambassadors: "/ambassadors",
  events: "/events",
  news: "/news",
  location: (city: string) => `/locations/${city}`,
  coworking: (city: string) => `/coworking/${city}`,
  cityEvents: (city: string) => `/events/${city}`,
  cityRooms: (city: string) => `/rooms/${city}`,
  month: (slug: string) => `/months/${slug}`,
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
    { status: "link", label: "Barcelona", href: routes.cityEvents("barcelona") },
    { status: "link", label: "June", href: routes.month("june") },
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

const primary = [
  coliving,
  coworking,
  community,
  happeningNow,
  about,
  { status: "link", label: "Deals", href: routes.deals },
] satisfies readonly NavigationItem[];

export const bookStayLink = { status: "link", label: "Book a Stay", href: routes.rooms } as const;

export const siteNavigation: SiteNavigation = {
  header: {
    locations,
    primary,
    actions: {
      login: { status: "hidden", label: "Members Login" },
      book: bookStayLink,
    },
  },
  footer: {
    main: [...primary, bookStayLink],
    extras: [
      { status: "link", label: "News", href: routes.news },
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
