export const STAGING_SITE_ID = "26a062ff-2d9e-499e-9704-9fcd2907dc7e";

export function reference(collectionId, key) {
  return { $seedReference: { collectionId, key } };
}

export function richContent(...paragraphs) {
  return {
    nodes: paragraphs.flatMap((text, index) => [
      ...(index > 0 ? [{ type: "PARAGRAPH" }] : []),
      {
        type: "PARAGRAPH",
        nodes: [
          {
            type: "TEXT",
            textData: { text, decorations: [] },
          },
        ],
        paragraphData: { textStyle: { textAlignment: "AUTO" } },
      },
    ]),
  };
}

const page = (pageKey, pageType, routeKey, options = {}) => ({
  pageKey,
  pageType,
  routeKey,
  routeParam: options.routeParam,
  seoTitle: options.title ?? `${pageKey} · Circles House`,
  seoDescription:
    options.description ?? `Sandbox content for the ${pageKey} page.`,
  noIndex: true,
  published: true,
});

const pageSectionOverrides = {
  "home.hero": {
    body:
      "Circles House is a thriving community of entrepreneurs, digital nomads, and innovators. To ensure everyone is a good fit and adds value to our unique ecosystem, we’ve designed a simple and quick application process.",
  },
  "home.network": {
    eyebrow: "The Circles House network",
  },
  "home.happeningNow": {
    eyebrow: "Happening now",
    primaryCtaLabel: "View all",
    primaryRouteKey: "events",
  },
  "home.memberships": {
    eyebrow: "Join us",
    body:
      "Our digital community is where ambitious entrepreneurs come together with seamless opportunities to engage, share ideas, spark connections, and turn visions into reality.",
    primaryCtaLabel: "Apply",
    primaryRouteKey: "memberships",
  },
  "home.introduction": {
    subtitle: "MANY LIFE EXPERIENCES",
    lead:
      "Circles House is a thriving community of entrepreneurs, digital nomads, and innovators. To ensure everyone is a good fit and adds value to our unique ecosystem, we’ve designed a simple and quick application process.",
    body:
      "We bring humans to the center of every decision. Kindness, love, respect, authenticity, and the desire to see your peers grow are key to creating personal and professional relationships that will last a lifetime.",
    primaryCtaLabel: "About us",
    primaryRouteKey: "what-is-circles",
  },
  "home.news": {
    eyebrow: "News",
  },
  "rooms.intro": {
    eyebrow: "Stay with us",
    body:
      "Choose from private studios, comfortable suites and shared rooms designed for focused work, meaningful rest and life in community.",
  },
  "rooms.band": {
    primaryCtaLabel: "Become a member",
    primaryRouteKey: "memberships",
    secondaryCtaLabel: "Explore Barcelona",
    secondaryRouteKey: "location",
    secondaryRouteParam: "barcelona",
  },
  "rooms.empty": {
    body: "View every available room or choose another location.",
    primaryCtaLabel: "View every room",
    primaryRouteKey: "rooms",
  },
  "events.intro": {
    eyebrow: "Happening now",
    title: "Live Surrounded by Nature",
    subtitle:
      "See What Makes our Inspiring Coworking Spaces Perfect for Entrepreneurs and Innovators",
    body: undefined,
  },
  "memberships.intro": {
    eyebrow: "Memberships",
    body:
      "Join Circles Membership for exclusive access to locations, deals, events, and the Member Hub.\nIt’s where everything begins.",
    primaryCtaLabel: "Apply",
    primaryExternalUrl: "/api/auth/login",
  },
  "memberships.benefits": {
    eyebrow: "Why join",
  },
  "memberships.hub": {
    eyebrow: "What is the hub",
    subtitle:
      "Circles Member Hub is a place for Members to connect, share networking opportunities, and view community events",
    body:
      "Explore the vibrant surroundings, immerse yourself in local culture, and discover hidden gems that await you at every turn. Whether you’re seeking relaxation or adventure, Circles Spaces has something for everyone.",
  },
  "memberships.pricing": {
    eyebrow: "Pricing",
  },
  "memberships.members": {
    eyebrow: "Members",
  },
  "memberships.band": {
    primaryCtaLabel: "Join us",
    primaryExternalUrl: "/api/auth/login",
  },
  "memberships.faq": {
    eyebrow: "FAQ",
  },
  "coworking-barcelona.hero": {
    eyebrow: "Coworking @ Circles Barcelona",
    subtitle: "See What Makes our Inspiring Coworking Spaces Perfect for Entrepreneurs and Innovators",
  },
  "coworking-barcelona.spaces": {
    eyebrow: "Coworking spaces",
  },
  "coworking-barcelona.pricing": {
    eyebrow: "Why join",
    lead: "Includes access to:",
  },
  "coworking-barcelona.band": {
    primaryCtaLabel: "Join us",
    primaryRouteKey: "memberships",
    secondaryCtaLabel: "Book a Stay",
    secondaryRouteKey: "rooms",
  },
  "coworking-barcelona.faq": {
    eyebrow: "FAQ",
  },
  "location-barcelona.hero": {
    eyebrow: "Location",
    lead: "The space",
    subtitle: "Your new home in Barcelona’s natural park.",
    body:
      "Located in a natural park and only a 5 minute walk from a metro station, our house in Vallvidrera is well-located and allows you to get anywhere quickly and easily.",
    primaryCtaLabel: "Book",
    primaryExternalUrl: "#rooms",
  },
  "location-barcelona.space": {
    lead: "Property amenities",
    body:
      "Circles House is a thriving community of entrepreneurs, digital nomads, and innovators. To ensure everyone is a good fit and adds value to our unique ecosystem, we’ve designed a simple and quick application process.",
  },
  "location-barcelona.rooms": {
    eyebrow: "Rooms",
    body:
      "Our house offers a range of thoughtfully designed rooms to suit various lifestyles, combining luxury and functionality. Whether you’re looking for a monthly stay or a flexible option, we’ve got you covered.",
  },
  "location-barcelona.band": {
    primaryCtaLabel: "Join us",
    primaryRouteKey: "memberships",
  },
  "location-barcelona.experiences": {
    eyebrow: "Experience",
    subtitle: "Take your time, get to know the city",
  },
  "location-barcelona.location": {
    eyebrow: "Location",
    body:
      "Located in a natural park and only a 5 minute walk from a metro station, our house in Vallvidrera is well-located and allows you to get anywhere quickly and easily. Whether you want to go to the heart of Placa Catalunya, Barceloneta beach, or the mountains, the proximity of our house to the metro means all of this is possible.",
  },
  "location-barcelona.manager": {
    eyebrow: "Meet your House Manager",
    body:
      "I’ll make sure you will enjoy your time in Circles House—whether that’s joining our events, discovering the best work spots, or connecting with like-minded members who make this place special.\n\nConnect with fellow members who share your passions and interests, you’ll find that this community is what makes Circles House a truly special place to be.",
  },
  "location-barcelona.faq": {
    eyebrow: "FAQ",
  },
  "june.hero": {
    eyebrow: "June @ Circles House Barcelona",
    title: "Say yes to a Month of New Experiences",
    body:
      "This June, we invite you to say yes to a summer full of possibility. New Beginnings is a month-long celebration of curiosity, creativity, and the courage to start again.\n\nAll of this is included with your stay at Circles between June 1 and June 30.",
    primaryCtaLabel: "Reserve now",
    primaryExternalUrl: "#rooms",
  },
  "june.form": {
    eyebrow: "Join us",
    title: "Start your stay here",
    subtitle: "Complete the form to apply for your stay.",
  },
  "june.space": {
    eyebrow: "The space",
    title: "Modern private lofts and shared rooftop spaces to live, work & play.",
  },
  "june.rooms": {
    eyebrow: "Why join",
    body:
      "Our house offers a range of thoughtfully designed rooms to suit different lifestyles, combining comfort and functionality.",
  },
  "june.band": {
    primaryCtaLabel: "View rooms",
    primaryRouteKey: "rooms",
  },
  "june.events": {
    eyebrow: "Included this month",
  },
  "june.external": {
    eyebrow: "External events",
  },
  "june.seasonal": {
    eyebrow: "Seasonal events",
  },
  "june.faq": {
    eyebrow: "FAQ",
  },
};

const standardRoomFeatures = ["20m2", "Bathroom", "Terrace", "Desk", "360º View", "Couple friendly"];
const standardRoomAmenities = ["air-conditioning", "desk", "wardrobe-storage"];
const coworkingPlanIncludes = [
  "Coworking",
  "Social club",
  "Gym and Shower",
  "Meeting Rooms",
  "Booths",
  "Bar and free coffee",
  "Gardens",
  "Rooftop",
].join("\n\n");
const canonicalRooms = [
  {
    slug: "king-studio-terrace-sea-view",
    name: "King Studio + Terrace",
    occupancyType: "private",
    description: "Private studio with an ensuite bathroom and terrace, featuring a desk, wardrobe and air conditioning.",
    features: standardRoomFeatures,
    views: "Mountain View + Sea View",
    amenities: [...standardRoomAmenities, "terrace"],
  },
  {
    slug: "king-studio-terrace-city-view",
    name: "King Studio + Terrace",
    occupancyType: "private",
    description: "Private studio with an ensuite bathroom and terrace, featuring a desk, wardrobe and air conditioning.",
    features: standardRoomFeatures,
    views: "Mountain View + City View",
    amenities: [...standardRoomAmenities, "terrace"],
  },
  {
    slug: "king-studio",
    name: "King Studio",
    occupancyType: "private",
    description: "Private studio with an ensuite bathroom, featuring a desk, wardrobe and air conditioning.",
    features: standardRoomFeatures,
    views: "Mountain View",
    amenities: standardRoomAmenities,
  },
  {
    slug: "queen-suite",
    name: "Queen Suite",
    occupancyType: "private",
    description: "Private suite with an ensuite bathroom, featuring a desk, wardrobe and air conditioning.",
    features: standardRoomFeatures,
    views: "Sea View + City View",
    amenities: standardRoomAmenities,
  },
  {
    slug: "queen-room",
    name: "Queen Room",
    occupancyType: "private",
    description: "Private room with access to a shared bathroom, featuring a desk, wardrobe and air conditioning.",
    features: ["20m2", "Shared Bathroom", "Terrace", "Desk", "360º View", "Couple friendly"],
    views: "Mountain View",
    amenities: standardRoomAmenities,
  },
  {
    slug: "4-bed-shared-suite",
    name: "4 Bed Shared Suite",
    occupancyType: "shared",
    description: "Shared suite with four beds, bathroom access, dedicated storage and air conditioning.",
    features: standardRoomFeatures,
    views: "Sea View + City View",
    amenities: standardRoomAmenities,
  },
  {
    slug: "6-bed-shared-suite",
    name: "6 Bed Shared Suite",
    occupancyType: "shared",
    description: "Shared suite with six beds, bathroom access, dedicated storage and air conditioning.",
    features: standardRoomFeatures,
    views: "Sea View + City View",
    amenities: standardRoomAmenities,
  },
];

export const seedCollections = [
  {
    collectionId: "CHSiteSettings",
    keyField: "key",
    items: [
      {
        key: "global",
        data: {
          key: "global",
          siteName: "Circles House",
          defaultSeoTitle: "Circles House · Coliving and coworking community",
          defaultSeoDescription:
            "Live, work and connect with entrepreneurs and innovators at Circles House.",
          promotionText:
            "Members save 15% on stays of 7+ nights, 30% on stays of 30+ nights and 35% on stays of 60+ nights.",
          contactAbout:
            "Circles House is a community designed for entrepreneurs and innovators seeking a more meaningful way to live, work, and connect.",
          contactPhone: "+34 619 43 24 69",
          contactEmail: "hello@circles.house",
          contactAddress:
            "Camí de Vallvidrera al Tibidabo, 5 · 08017 Barcelona, Spain",
          copyrightTemplate: "© {year} circles.house · All rights reserved",
          newsletterTitle: "Join our Newsletter",
          newsletterDescription:
            "Join our newsletter to connect with a vibrant community of entrepreneurs and innovators at Circles House. Stay updated and be part of our unique ecosystem!",
          newsletterConsentText:
            "I agree to receive news and updates from Circles House.",
        },
        editorialStatus: "figma-with-provisional-email-and-promotion",
      },
    ],
  },
  {
    collectionId: "CHInterfaceCopy",
    keyField: "copyKey",
    items: [
      {
        key: "newsletter.emailPlaceholder",
        data: {
          copyKey: "newsletter.emailPlaceholder",
          value: "Email address",
          group: "newsletter",
          context: "Sandbox newsletter form placeholder",
        },
      },
      {
        key: "newsletter.success",
        data: {
          copyKey: "newsletter.success",
          value: "Thanks for joining the circle.",
          group: "newsletter",
          context: "Sandbox success message",
        },
      },
      {
        key: "newsletter.error",
        data: {
          copyKey: "newsletter.error",
          value: "Something went wrong. Please try again.",
          group: "newsletter",
          context: "Sandbox error message",
        },
      },
      {
        key: "common.comingSoon",
        data: {
          copyKey: "common.comingSoon",
          value: "Coming soon",
          group: "common",
          context: "Label for unavailable locations and services",
        },
      },
    ],
  },
  {
    collectionId: "CHPages",
    keyField: "pageKey",
    items: [
      {
        key: "home",
        data: page("home", "static", "home", {
          title: "Circles House · Coliving and coworking community",
          description:
            "Live, work and connect with entrepreneurs and innovators at Circles House.",
        }),
        editorialStatus: "figma",
      },
      {
        key: "rooms",
        data: page("rooms", "static", "rooms", {
          title: "Rooms · Circles House Barcelona",
          description:
            "Explore private studios, suites and shared rooms at Circles House Barcelona, then continue to Cloudbeds to check live availability.",
        }),
        editorialStatus: "figma",
      },
      { key: "events", data: page("events", "static", "events") },
      { key: "team", data: page("team", "static", "team") },
      {
        key: "memberships",
        data: page("memberships", "static", "memberships", {
          title: "Memberships · Circles House",
          description:
            "Join Circles Membership for access to locations, community events, partner benefits, and the Circles Member Hub.",
        }),
        editorialStatus: "figma-with-provisional-plan-and-application-url",
      },
      {
        key: "what-is-circles",
        data: page("what-is-circles", "static", "what-is-circles"),
      },
      {
        key: "life-at-circles",
        data: page("life-at-circles", "static", "life-at-circles"),
      },
      {
        key: "partnerships",
        data: page("partnerships", "static", "partnerships"),
      },
      {
        key: "ambassadors",
        data: page("ambassadors", "static", "ambassadors"),
      },
      {
        key: "for-investors",
        data: page("for-investors", "static", "for-investors"),
      },
      {
        key: "location-barcelona",
        data: page("location-barcelona", "location", "location", {
          routeParam: "barcelona",
          title: "Circles House Barcelona",
          description:
            "Modern private lofts and shared rooftop spaces to live, work & play, a short walk from the metro in Vallvidrera.",
        }),
        editorialStatus: "figma",
        reconcile: true,
      },
      {
        key: "coworking-barcelona",
        data: page("coworking-barcelona", "coworking", "coworking", {
          routeParam: "barcelona",
          title: "Coworking in Barcelona · Circles House",
          description:
            "Hot desks, cabins, gyms and booths surrounded by nature, with day, 10-day and monthly passes.",
        }),
        editorialStatus: "figma",
      },
      {
        key: "june",
        data: page("june", "month", "month", {
          routeParam: "june",
          title: "June at Circles House Barcelona · Circles House",
          description:
            "Explore rooms, spaces and community events at Circles House Barcelona throughout June.",
        }),
      },
    ],
  },
  {
    collectionId: "CHAmenities",
    keyField: "amenityKey",
    items: [
      ["coworking", "Coworking", "briefcase", "work", ["location"]],
      ["community-kitchen", "Community kitchen", "tools-kitchen", "living", ["location"]],
      ["high-speed-wifi", "High-speed Wi-Fi", "wifi", "work", ["location", "space"]],
      ["rooftop", "360º Rooftop", "rooftop", "community", ["location", "space"]],
      ["air-conditioning", "Air conditioning", "air-conditioning", "comfort", ["room"]],
      ["desk", "Desk", "desk", "work", ["room"]],
      ["wardrobe-storage", "Wardrobe / storage", "wardrobe", "storage", ["room"]],
      ["terrace", "Terrace", "terrace", "outdoor", ["room"]],
      ["booths", "Booths", "phone-booth", "work", ["space"]],
      ["meeting-room", "Meeting room", "meeting-room", "work", ["space"]],
      ["printing-area", "Printing area", "printing", "work", ["space"]],
      ["gym-and-shower", "Gym and shower", "gym", "wellness", ["space"]],
      ["event-room", "Event room", "events", "community", ["space"]],
    ].map(([amenityKey, label, iconKey, category, applicableTo], index) => ({
      key: amenityKey,
      data: {
        amenityKey,
        label,
        iconKey,
        category,
        applicableTo,
        published: true,
        sortOrder: index + 1,
      },
    })),
  },
  {
    collectionId: "CHLocations",
    keyField: "slug",
    items: [
      {
        key: "barcelona",
        data: {
          slug: "barcelona",
          name: "Circles House Barcelona",
          shortName: "Barcelona",
          city: "Barcelona",
          country: "Spain",
          timezone: "Europe/Madrid",
          status: "open",
          address: "Camí de Vallvidrera al Tibidabo 5, Barcelona",
          summary:
            "A coliving and coworking house in the hills above Barcelona.",
          accessLabel: "Members only",
          mapUrl: "https://maps.google.com/?q=Circles+House+Barcelona",
          featuredHome: true,
          homeSortOrder: 1,
          published: true,
          sortOrder: 1,
        },
        multiReferences: {
          amenities: ["community-kitchen", "coworking", "high-speed-wifi", "rooftop"],
        },
      },
      {
        key: "andorra",
        data: {
          slug: "andorra",
          name: "Circles House Andorra",
          shortName: "Andorra",
          city: "Andorra la Vella",
          country: "Andorra",
          timezone: "Europe/Andorra",
          status: "coming-soon",
          summary: "A future Circles House location in the Pyrenees.",
          accessLabel: "Coming soon",
          featuredHome: true,
          homeSortOrder: 2,
          published: true,
          sortOrder: 2,
        },
      },
    ],
  },
  {
    collectionId: "CHPeople",
    keyField: "slug",
    items: [
      {
        key: "sandbox-house-manager",
        data: {
          slug: "sandbox-house-manager",
          personTypes: ["team", "house-manager"],
          name: "Alex Sandbox",
          role: "House Manager",
          bio: "Sandbox profile used to validate people and location references.",
          location: reference("CHLocations", "barcelona"),
          published: true,
          sortOrder: 1,
        },
      },
      {
        key: "sandbox-community-lead",
        data: {
          slug: "sandbox-community-lead",
          personTypes: ["team", "author"],
          name: "Sam Circle",
          role: "Community Lead",
          bio: "Sandbox author and team member.",
          location: reference("CHLocations", "barcelona"),
          published: true,
          sortOrder: 2,
        },
      },
      {
        key: "kimberly-defors",
        editorialStatus: "figma-bio-expanded-awaiting-approval",
        data: {
          slug: "kimberly-defors",
          personTypes: ["member"],
          name: "Kimberly Defors",
          role: "Member",
          bio: "A digital nomad specializing in branding, marketing, and wellness projects.",
          location: reference("CHLocations", "barcelona"),
          published: true,
          sortOrder: 3,
        },
      },
    ],
  },
  {
    collectionId: "CHSocialLinks",
    keyField: "networkKey",
    items: [
      ["instagram", "Instagram", "https://www.instagram.com/", "brand-instagram"],
      ["linkedin", "LinkedIn", "https://www.linkedin.com/", "brand-linkedin"],
      ["youtube", "YouTube", "https://www.youtube.com/", "brand-youtube"],
    ].map(([networkKey, label, url, iconKey], index) => ({
      key: networkKey,
      data: { networkKey, label, url, iconKey, published: true, sortOrder: index + 1 },
    })),
  },
  {
    collectionId: "CHNavigationItems",
    keyField: "itemKey",
    items: [
      ["header.home", "header", "Home", "home"],
      ["header.locations", "header", "Locations", "location", "barcelona"],
      ["header.rooms", "header", "Rooms", "rooms"],
      ["header.events", "header", "Events", "events"],
      ["header.founders-month", "header", "Founders Month", "program", "founders-month"],
      ["header.memberships", "header", "Memberships", "memberships"],
      ["footer.team", "footer", "Team", "team"],
      ["footer.partnerships", "footer", "Partnerships", "partnerships"],
      ["footer.investors", "footer", "For investors", "for-investors"],
      ["footer.news", "footerExtras", "News", "news"],
      ["footer.terms", "footerLegal", "Terms & Conditions", "terms"],
      ["footer.cookies", "footerLegal", "Cookies Policy", "cookies"],
      ["footer.notice", "footerLegal", "Legal Notice", "notice"],
      ["footer.privacy", "footerLegal", "Privacy Policy", "privacy"],
    ].map(([itemKey, area, label, routeKey, routeParam], index) => ({
      key: itemKey,
      data: {
        itemKey,
        area,
        label,
        status: "active",
        routeKey,
        routeParam,
        location:
          routeKey === "location"
            ? reference("CHLocations", "barcelona")
            : undefined,
        published: true,
        sortOrder: index + 1,
      },
    })),
  },
  {
    collectionId: "CHPageSections",
    keyField: "sectionKey",
    items: [
      ["home.hero", "home", "home.hero", "The coliving and coworking community, designed for entrepreneurs and innovators."],
      ["home.network", "home", "home.network", "A more meaningful way to live, work, and connect."],
      ["home.happeningNow", "home", "home.happeningNow", "Here's what's coming up"],
      ["home.memberships", "home", "home.memberships", "Become a Member"],
      ["home.introduction", "home", "home.introduction", "ONE COMMUNITY, ONE HOME WORLDWIDE"],
      ["home.news", "home", "home.news", "Latest announcements"],
      ["rooms.intro", "rooms", "rooms.intro", "A room for your needs"],
      ["rooms.band", "rooms", "rooms.band", "Stay longer and save more"],
      ["rooms.empty", "rooms", "rooms.empty", "No rooms are published for this location yet."],
      ["events.intro", "events", "events.intro", "Happening now"],
      ["team.intro", "team", "team.intro", "Meet the community team"],
      ["memberships.intro", "memberships", "memberships.intro", "Become a Member"],
      ["memberships.benefits", "memberships", "memberships.benefits", "Membership Benefits"],
      ["memberships.hub", "memberships", "memberships.hub", "Circles Member Hub"],
      ["memberships.pricing", "memberships", "memberships.pricing", "A membership designed around how you live and work."],
      ["memberships.members", "memberships", "memberships.members", "Meet our Members"],
      ["memberships.band", "memberships", "memberships.band", "Stay longer and Save more"],
      ["memberships.faq", "memberships", "memberships.faq", "What you need to know"],
      ["what-is-circles.intro", "what-is-circles", "what-is-circles.intro", "A more meaningful way to live"],
      ["life-at-circles.intro", "life-at-circles", "life-at-circles.intro", "Life at Circles"],
      ["partnerships.intro", "partnerships", "partnerships.intro", "Partner with Circles"],
      ["ambassadors.intro", "ambassadors", "ambassadors.intro", "Become an ambassador"],
      ["for-investors.intro", "for-investors", "for-investors.intro", "Invest in community-led living"],
      ["location-barcelona.hero", "location-barcelona", "location.hero", "Circles House Barcelona"],
      ["location-barcelona.space", "location-barcelona", "location.space", "Modern private lofts and shared rooftop spaces to live, work & play."],
      ["location-barcelona.rooms", "location-barcelona", "location.rooms", "A room for your needs"],
      ["location-barcelona.band", "location-barcelona", "location.band", "Stay longer and Save more"],
      ["location-barcelona.experiences", "location-barcelona", "location.experiences", "Travel slowly in Barcelona"],
      ["location-barcelona.location", "location-barcelona", "location.location", "In the hills above Barcelona"],
      ["location-barcelona.manager", "location-barcelona", "location.manager", "Hi, I'm Teagan, community manager."],
      ["location-barcelona.faq", "location-barcelona", "location.faq", "What you need to know"],
      ["coworking-barcelona.hero", "coworking-barcelona", "coworking.hero", "Work Surrounded by Nature"],
      ["coworking-barcelona.spaces", "coworking-barcelona", "coworking.spaces", "Coworking spaces"],
      ["coworking-barcelona.pricing", "coworking-barcelona", "coworking.pricing", "Coworking Pricing Options"],
      ["coworking-barcelona.band", "coworking-barcelona", "coworking.band", "Stay longer and Save more"],
      ["coworking-barcelona.faq", "coworking-barcelona", "coworking.faq", "What you need to know"],
      ["june.hero", "june", "month.hero", "June at Circles House Barcelona"],
      ["june.form", "june", "month.form", "Start your stay here"],
      ["june.space", "june", "month.space", "Modern private lofts and shared rooftop spaces to live, work & play."],
      ["june.rooms", "june", "month.rooms", "A room for your needs"],
      ["june.band", "june", "month.band", "Stay longer and save more"],
      ["june.events", "june", "month.events", "What you will say yes to"],
      ["june.external", "june", "month.external", "What else is happening in the city this month"],
      ["june.seasonal", "june", "month.seasonal", "Summer @ Circles"],
      ["june.faq", "june", "month.faq", "What you need to know"],
    ].map(([sectionKey, pageKey, componentKey, title], index) => ({
      key: sectionKey,
      editorialStatus:
        sectionKey.startsWith("home.") ||
        sectionKey.startsWith("rooms.") ||
        sectionKey.startsWith("memberships.") ||
        sectionKey.startsWith("location-barcelona.") ||
        sectionKey.startsWith("coworking-barcelona.")
          ? "figma"
          : "provisional",
      data: {
        sectionKey,
        page: reference("CHPages", pageKey),
        componentKey,
        eyebrow:
          sectionKey.startsWith("home.") ||
          sectionKey.startsWith("rooms.") ||
          sectionKey.startsWith("memberships.") ||
          sectionKey.startsWith("location-barcelona.") ||
          sectionKey.startsWith("coworking-barcelona.")
            ? undefined
            : "Sandbox",
        title,
        body: "This section is CMS-managed staging content.",
        ...(pageSectionOverrides[sectionKey] ?? {}),
        enabled: true,
        sortOrder: index + 1,
      },
      reconcile: sectionKey.startsWith("location-barcelona."),
    })),
  },
  {
    collectionId: "CHSectionItems",
    keyField: "itemKey",
    items: [
      {
        key: "home.memberships.community",
        editorialStatus: "figma",
        data: {
          itemKey: "home.memberships.community",
          section: reference("CHPageSections", "home.memberships"),
          title: "Instant Community",
          highlighted: true,
          wide: false,
          published: true,
          sortOrder: 1,
        },
      },
      {
        key: "home.memberships.focus",
        editorialStatus: "figma",
        data: {
          itemKey: "home.memberships.focus",
          section: reference("CHPageSections", "home.memberships"),
          title: "Focused Channels",
          published: true,
          sortOrder: 2,
        },
      },
      {
        key: "home.memberships.collaboration",
        editorialStatus: "figma",
        data: {
          itemKey: "home.memberships.collaboration",
          section: reference("CHPageSections", "home.memberships"),
          title: "Collaboration",
          published: true,
          sortOrder: 3,
        },
      },
      ...[
        ["booking-rates", "Discounted price for every booking", "Unlock exclusive booking access to over 30 Members Only locations."],
        ["entrepreneurs-hub", "Entrepreneur’s Hub", "Join the online community to exchange ideas, opportunities, and practical knowledge with other Circles members."],
        ["priority-booking", "Priority in Bookings", "Get early access to selected rooms, stays, and experiences across the Circles network."],
        ["new-locations", "Access when opening a New Location", "Be among the first members invited to discover new Circles House locations."],
        ["partner-perks", "Partners’ perks all over the world", "Access benefits from a curated network of partners aligned with the way our community lives and works."],
        ["member-offers", "Exclusive Members only offers", "Receive offers created for members, from extended stays to community-led experiences."],
      ].map(([key, title, text], index) => ({
        key: `memberships.benefits.${key}`,
        editorialStatus: "figma-copy-refined",
        data: {
          itemKey: `memberships.benefits.${key}`,
          section: reference("CHPageSections", "memberships.benefits"),
          title,
          text,
          published: true,
          sortOrder: index + 1,
        },
      })),
      ...[
        ["next-trip", "Plan your next trip to Circles Spaces"],
        ["network", "Expand your nomadic network"],
        ["knowledge", "Ask Questions and Share Knowledge"],
      ].map(([key, title], index) => ({
        key: `memberships.hub.topic.${key}`,
        editorialStatus: "figma",
        data: {
          itemKey: `memberships.hub.topic.${key}`,
          section: reference("CHPageSections", "memberships.hub"),
          title,
          highlighted: index === 0,
          published: true,
          sortOrder: index + 1,
        },
      })),
      ...[
        ["nationalities", "globe", "+40 Nationalities represented"],
        ["average-age", "age", "36 years average age"],
        ["average-stay", "stay", "2 weeks of average stay"],
      ].map(([key, iconKey, label], index) => ({
        key: `memberships.hub.stat.${key}`,
        editorialStatus: "figma-values-awaiting-verification",
        data: {
          itemKey: `memberships.hub.stat.${key}`,
          section: reference("CHPageSections", "memberships.hub"),
          iconKey,
          label,
          published: true,
          sortOrder: index + 10,
        },
      })),
      ...[
        "Members-only booking rates",
        "Access to the Circles Member Hub",
        "Priority booking opportunities",
        "Invitations to community events",
        "Partner perks and member offers",
        "Early access to new locations",
      ].map((title, index) => ({
        key: `memberships.pricing.feature.${index + 1}`,
        editorialStatus: "figma-copy-refined",
        data: {
          itemKey: `memberships.pricing.feature.${index + 1}`,
          section: reference("CHPageSections", "memberships.pricing"),
          title,
          published: true,
          sortOrder: index + 1,
        },
      })),
      {
        key: "events.intro.barcelona",
        data: {
          itemKey: "events.intro.barcelona",
          section: reference("CHPageSections", "events.intro"),
          label: "Barcelona",
          title: "Sandbox events",
          text: "Events loaded from Wix CMS staging.",
          routeKey: "events",
          routeParam: "barcelona",
          linkLabel: "View events",
          highlighted: false,
          wide: false,
          published: true,
          sortOrder: 1,
        },
      },
      ...[
        ["day-pass", "Day pass", "Use it in a period of 30 days", "15€ +VAT", false],
        ["ten-day-pass", "10 days pass", "Use it in a period of 30 days", "120€ +VAT", false],
        ["monthly-pass", "Monthly pass", "30 days access", "150€ +VAT", true],
        ["monthly-fixed-desk", "Monthly pass", "+ FIXED DESK", "180€ +VAT", false],
      ].map(([key, title, subtitle, value, highlighted], index) => ({
        key: `coworking-barcelona.pricing.${key}`,
        editorialStatus: "figma",
        data: {
          itemKey: `coworking-barcelona.pricing.${key}`,
          section: reference("CHPageSections", "coworking-barcelona.pricing"),
          title,
          subtitle,
          text: coworkingPlanIncludes,
          value,
          highlighted,
          published: true,
          sortOrder: index + 1,
        },
      })),
      ...[
        ["coliving", "coliving"],
        ["coworking", "coworking"],
      ].map(([key, iconKey], index) => ({
        key: `location-barcelona.hero.${key}`,
        editorialStatus: "figma",
        reconcile: true,
        data: {
          itemKey: `location-barcelona.hero.${key}`,
          section: reference("CHPageSections", "location-barcelona.hero"),
          iconKey,
          published: true,
          sortOrder: index + 1,
        },
      })),
      ...[
        ["explore", "Explore Barcelona", "Move easily between the city centre, the coast and the hills from Vallvidrera", false],
        ["barceloneta", "Swim at Barceloneta", "Take the metro into the city and spend the day beside the Mediterranean", true],
      ].map(([key, title, text, wide], index) => ({
        key: `location-barcelona.experiences.${key}`,
        editorialStatus: "figma-media-pending",
        reconcile: true,
        data: {
          itemKey: `location-barcelona.experiences.${key}`,
          section: reference("CHPageSections", "location-barcelona.experiences"),
          title,
          text,
          wide,
          published: true,
          sortOrder: index + 1,
        },
      })),
      ...[
        ["june.external.sonar", "Sónar Barcelona", "Fira Montjuïc and Fira Gran Via", "Thursday, June 17", "4:00 PM"],
        ["june.external.design-week", "Barcelona Design Week", "Venues across Barcelona", "Monday, June 21", "10:00 AM"],
        ["june.external.grec", "Grec Festival", "Montjuïc and venues across Barcelona", "Friday, June 25", "8:00 PM"],
        ["june.seasonal.rooftop", "Rooftop Community Dinner", "Circles House Barcelona", "Friday, June 11", "8:00 PM"],
        ["june.seasonal.founders", "Founders Roundtable", "Circles House Barcelona", "Wednesday, June 16", "6:30 PM"],
        ["june.seasonal.midsummer", "Midsummer Gathering", "Circles House Barcelona", "Wednesday, June 23", "7:30 PM"],
      ].map(([itemKey, title, text, label, value], index) => ({
        key: itemKey,
        editorialStatus: "provisional-editable",
        data: {
          itemKey,
          section: reference("CHPageSections", itemKey.startsWith("june.external.") ? "june.external" : "june.seasonal"),
          title,
          text,
          label,
          value,
          published: true,
          sortOrder: (index % 3) + 1,
        },
      })),
    ],
  },
  {
    collectionId: "CHPrograms",
    keyField: "slug",
    items: [
      {
        key: "founders-month",
        data: {
          slug: "founders-month",
          location: reference("CHLocations", "barcelona"),
          page: reference("CHPages", "june"),
          name: "Founders Month",
          theme: "Build with community",
          startsOn: "2027-06-01",
          endsOn: "2027-06-30",
          registrationEnabled: true,
          published: true,
          sortOrder: 1,
        },
      },
    ],
  },
  {
    collectionId: "CHSpaces",
    keyField: "slug",
    items: [
      {
        key: "barcelona-hot-desks",
        data: {
          slug: "barcelona-hot-desks",
          location: reference("CHLocations", "barcelona"),
          spaceType: "coworking",
          categoryLabel: "Coworking space",
          title: "Hot desks",
          description:
            "Our hot desks are situated in a vibrant co-working space, just a short stroll from public transport. They offer a flexible and convenient option for those looking to work in a dynamic environment.",
          accessLabel: "Members only",
          status: "active",
          featuredHome: true,
          homeCardSize: "large",
          homeSortOrder: 1,
          published: true,
          sortOrder: 1,
        },
        editorialStatus: "figma",
        multiReferences: {
          amenities: ["coworking", "high-speed-wifi", "meeting-room", "printing-area", "event-room", "rooftop"],
        },
      },
      {
        key: "barcelona-cabins",
        data: {
          slug: "barcelona-cabins",
          location: reference("CHLocations", "barcelona"),
          spaceType: "coworking",
          categoryLabel: "Coworking space",
          title: "Cabins",
          description: "Private cabins for focused calls and individual work within the shared coworking space.",
          accessLabel: "Members only",
          status: "active",
          featuredHome: false,
          published: true,
          sortOrder: 2,
        },
        editorialStatus: "figma-with-provisional-description",
        multiReferences: {
          amenities: ["high-speed-wifi", "booths"],
        },
      },
      {
        key: "barcelona-gym",
        data: {
          slug: "barcelona-gym",
          location: reference("CHLocations", "barcelona"),
          spaceType: "coworking",
          categoryLabel: "Health",
          title: "Gyms",
          description: "A gym and shower area available alongside the coworking facilities.",
          accessLabel: "Members only",
          status: "active",
          featuredHome: false,
          published: true,
          sortOrder: 3,
        },
        editorialStatus: "figma-with-provisional-description",
        multiReferences: {
          amenities: ["gym-and-shower"],
        },
      },
      {
        key: "barcelona-booths",
        data: {
          slug: "barcelona-booths",
          location: reference("CHLocations", "barcelona"),
          spaceType: "coworking",
          categoryLabel: "Coworking space",
          title: "Booths",
          description: "Enclosed booths for calls, online meetings and focused conversations.",
          accessLabel: "Members only",
          status: "active",
          featuredHome: false,
          published: true,
          sortOrder: 4,
        },
        editorialStatus: "figma-with-provisional-description",
        multiReferences: {
          amenities: ["high-speed-wifi", "booths"],
        },
      },
      {
        key: "andorra-spa",
        data: {
          slug: "andorra-spa",
          location: reference("CHLocations", "andorra"),
          spaceType: "spa",
          categoryLabel: "Wellness",
          title: "Spa Andorra",
          description: "Thermal circuits, breathwork and cold exposure designed to restore energy and clarity.",
          accessLabel: "Public",
          status: "comingSoon",
          featuredHome: true,
          homeCardSize: "small",
          homeSortOrder: 2,
          published: true,
          sortOrder: 2,
        },
        editorialStatus: "figma",
      },
      {
        key: "andorra-restaurant",
        data: {
          slug: "andorra-restaurant",
          location: reference("CHLocations", "andorra"),
          spaceType: "restaurant",
          categoryLabel: "Culinary experience",
          title: "Restaurant Andorra",
          description: "Local produce, biodynamic methods and a table built for conversation.",
          accessLabel: "Public",
          status: "comingSoon",
          featuredHome: true,
          homeCardSize: "medium",
          homeSortOrder: 3,
          published: true,
          sortOrder: 3,
        },
        editorialStatus: "figma",
      },
      {
        key: "barcelona-rooftop",
        data: {
          slug: "barcelona-rooftop",
          location: reference("CHLocations", "barcelona"),
          spaceType: "events",
          categoryLabel: "Events",
          title: "Rooftop",
          description: "Cinema, dinners and ideas above the city.",
          accessLabel: "Members only",
          status: "active",
          featuredHome: true,
          homeCardSize: "small",
          homeSortOrder: 4,
          published: true,
          sortOrder: 4,
        },
        editorialStatus: "figma",
        multiReferences: {
          amenities: ["rooftop"],
        },
      },
    ],
  },
  {
    collectionId: "CHRooms",
    keyField: "slug",
    items: canonicalRooms.map(({ amenities, ...room }, index) => ({
      key: room.slug,
      editorialStatus: "figma-with-provisional-booking-url-and-price",
      data: {
        ...room,
        location: reference("CHLocations", "barcelona"),
        houseLabel: "Barcelona House",
        priceLabel: "Starting from",
        priceValue: "€1.900/month",
        bookingUrl: "https://hotels.cloudbeds.com/",
        published: true,
        sortOrder: index + 1,
      },
      multiReferences: { amenities },
    })),
  },
  {
    collectionId: "CHEvents",
    keyField: "slug",
    items: [
      {
        key: "movie-night-2027-06",
        data: {
          slug: "movie-night-2027-06",
          location: reference("CHLocations", "barcelona"),
          program: reference("CHPrograms", "founders-month"),
          eventType: "circles",
          title: "Movie Night",
          subtitle: "Rooftop cinema, snacks and good company",
          description:
            "Join us for a cozy rooftop movie night with a film, snacks and time to connect with fellow members.",
          accessLabel: "Members only",
          venueName: "Circles House Barcelona",
          venueAddress: "Camí de Vallvidrera al Tibidabo 5, Barcelona",
          startsAt: "2027-06-04T18:00:00.000Z",
          endsAt: "2027-06-04T21:00:00.000Z",
          timezone: "Europe/Madrid",
          featuredHome: true,
          homeSortOrder: 1,
          published: true,
          sortOrder: 1,
        },
        editorialStatus: "figma-concept-provisional-date",
      },
      {
        key: "hiit-workout-2027-06",
        data: {
          slug: "hiit-workout-2027-06",
          location: reference("CHLocations", "barcelona"),
          program: reference("CHPrograms", "founders-month"),
          eventType: "circles",
          title: "HIIT Workout",
          subtitle: "A high-energy community training session",
          description: "A high-energy workout designed to build strength, stamina and community.",
          accessLabel: "Public",
          venueName: "Circles House Barcelona",
          venueAddress: "Camí de Vallvidrera al Tibidabo 5, Barcelona",
          startsAt: "2027-06-07T07:00:00.000Z",
          endsAt: "2027-06-07T08:00:00.000Z",
          timezone: "Europe/Madrid",
          featuredHome: true,
          homeSortOrder: 2,
          published: true,
          sortOrder: 2,
        },
        editorialStatus: "figma-concept-provisional-date",
      },
      {
        key: "spanish-conversation-club-2027-06",
        data: {
          slug: "spanish-conversation-club-2027-06",
          location: reference("CHLocations", "barcelona"),
          program: reference("CHPrograms", "founders-month"),
          eventType: "circles",
          title: "Spanish Conversation Club",
          subtitle: "Practice Spanish with an international community",
          description:
            "Practice Spanish in a relaxed setting and meet an international community of founders and creatives.",
          accessLabel: "Public",
          venueName: "Circles House Barcelona",
          venueAddress: "Camí de Vallvidrera al Tibidabo 5, Barcelona",
          startsAt: "2027-06-10T17:00:00.000Z",
          endsAt: "2027-06-10T18:30:00.000Z",
          timezone: "Europe/Madrid",
          featuredHome: true,
          homeSortOrder: 3,
          published: true,
          sortOrder: 3,
        },
        editorialStatus: "figma-concept-provisional-date",
      },
    ],
  },
  {
    collectionId: "CHNewsArticles",
    keyField: "slug",
    items: [
      {
        key: "science-of-supper-community-dinners",
        data: {
          slug: "science-of-supper-community-dinners",
          title: "The Science of Supper: How Community Dinners Cultivate Wellbeing",
          excerpt:
            "Why sharing a table can improve happiness, resilience and the quality of our connections.",
          body: richContent(
            "Community dinners are more than a shared meal. They create a regular space to slow down, exchange ideas and build trust with the people around us.",
            "At Circles House Barcelona, the table is one of the places where residents and members turn everyday encounters into genuine relationships.",
          ),
          contentType: "feature",
          category: "Announcement",
          publishedAt: "2025-08-21T09:00:00.000Z",
          seoTitle: "How community dinners cultivate wellbeing · Circles House",
          seoDescription:
            "Discover how shared meals at Circles House Barcelona help strengthen wellbeing and meaningful connection.",
          featuredHome: true,
          homeSortOrder: 1,
          published: true,
        },
        editorialStatus: "figma-title-and-summary-expanded",
      },
      {
        key: "gen-z-work-and-housing",
        data: {
          slug: "gen-z-work-and-housing",
          title: "Why Gen Z Doesn’t Want a 9-to-5 — and What That Means for Housing",
          excerpt: "A new generation is redrawing the lines between home, work and community.",
          body: richContent(
            "For a generation shaped by remote work and global mobility, housing is no longer separate from professional life or community.",
            "Flexible coliving environments can offer the focus, relationships and sense of belonging that conventional rentals often leave out.",
          ),
          contentType: "feature",
          category: "Announcement",
          publishedAt: "2025-08-21T09:00:00.000Z",
          seoTitle: "Gen Z, work and the future of housing · Circles House",
          seoDescription:
            "Explore how flexible work is changing what a new generation expects from home and community.",
          featuredHome: true,
          homeSortOrder: 2,
          published: true,
        },
        editorialStatus: "figma-title-expanded",
      },
      {
        key: "summer-giveaway-barcelona-2025",
        data: {
          slug: "summer-giveaway-barcelona-2025",
          title: "Win a One-Week Stay at Circles House Barcelona",
          excerpt:
            "A private room, inspiring workspace and one week inside the Circles House community.",
          body: richContent(
            "Circles House Barcelona offered one entrepreneur or creative a one-week coliving and coworking stay during summer 2025.",
            "The giveaway is now closed, but the story remains part of the Circles House news archive.",
          ),
          contentType: "announcement",
          category: "Announcement",
          publishedAt: "2025-08-21T09:00:00.000Z",
          seoTitle: "Circles House Barcelona summer giveaway",
          seoDescription:
            "Read about the 2025 Circles House Barcelona one-week coliving and coworking giveaway.",
          featuredHome: true,
          homeSortOrder: 3,
          published: true,
        },
        editorialStatus: "figma-historical-announcement",
      },
    ],
  },
  {
    collectionId: "CHDeals",
    keyField: "slug",
    items: [
      {
        key: "sandbox-extended-stay",
        data: {
          slug: "sandbox-extended-stay",
          eyebrow: "Sandbox deal",
          title: "Extended stay test offer",
          description: "Representative CMS deal; not valid for real bookings.",
          terms: "Testing only. This promotion has no commercial validity.",
          ctaLabel: "View rooms",
          routeKey: "rooms",
          startsOn: "2027-01-01",
          endsOn: "2027-12-31",
          published: true,
          sortOrder: 1,
        },
      },
    ],
  },
  {
    collectionId: "CHTestimonials",
    keyField: "testimonialKey",
    items: [
      {
        key: "maria-isabel-arbelaez-google",
        data: {
          testimonialKey: "maria-isabel-arbelaez-google",
          quote:
            "I’ve been staying at Circles and I absolutely love it! The location up in Tibidabo is incredible, the views are breathtaking, and it’s so peaceful, yet still close enough to enjoy everything the city has to offer. The house itself is beautiful, super comfortable, and always spotless.",
          authorName: "Maria Isabel Arbelaez",
          sourceLabel: "5 out of 5 Review on Google",
          rating: 5,
          location: reference("CHLocations", "barcelona"),
          featuredHome: true,
          published: true,
          sortOrder: 1,
        },
        editorialStatus: "figma-google-review",
      },
      {
        key: "forne-ce",
        data: {
          testimonialKey: "forne-ce",
          quote:
            "Circles House is a great place to work. The coworking space is productive. I have met lots of interesting people just by being there. It’s easy to focus, network with professionals, and even stay healthy thanks to the on-site gym.",
          authorName: "Forne Ce",
          sourceLabel: "5 out of 5 Review on Google",
          rating: 5,
          location: reference("CHLocations", "barcelona"),
          featuredHome: true,
          published: true,
          sortOrder: 2,
        },
        editorialStatus: "figma-google-review",
      },
      {
        key: "enrico-schmidt",
        data: {
          testimonialKey: "enrico-schmidt",
          quote:
            "From the very first moment, it became clear that this place is more than just a temporary home. I was warmly welcomed into an atmosphere where everything felt not only well-organized but also genuinely heartfelt.",
          authorName: "Enrico Schmidt",
          sourceLabel: "5 out of 5 Review on Google",
          rating: 5,
          location: reference("CHLocations", "barcelona"),
          featuredHome: true,
          published: true,
          sortOrder: 3,
        },
        editorialStatus: "figma-google-review",
      },
    ],
  },
  {
    collectionId: "CHPartners",
    keyField: "slug",
    items: [
      {
        key: "sandbox-community-partner",
        data: {
          slug: "sandbox-community-partner",
          name: "Sandbox Community Partner",
          description: "Representative partner record for staging.",
          url: "https://example.com/",
          featured: true,
          published: true,
          sortOrder: 1,
        },
      },
    ],
  },
  {
    collectionId: "CHFaqs",
    keyField: "faqKey",
    items: [
      {
        key: "sandbox.getting-there",
        data: {
          faqKey: "sandbox.getting-there",
          question: "How do I get to Circles House Barcelona?",
          answer: richContent(
            "Take the S1 or S2 train to Peu del Funicular and continue to Vallvidrera Superior.",
          ),
          published: true,
          sortOrder: 1,
        },
        multiReferences: {
          pages: ["what-is-circles", "location-barcelona", "coworking-barcelona"],
          locations: ["barcelona"],
        },
      },
      {
        key: "sandbox.minimum-stay",
        data: {
          faqKey: "sandbox.minimum-stay",
          question: "What is the minimum stay?",
          answer: richContent(
            "This is sandbox copy. The final policy will be approved before production.",
          ),
          published: true,
          sortOrder: 2,
        },
        multiReferences: {
          pages: ["location-barcelona", "coworking-barcelona", "june"],
          locations: ["barcelona"],
        },
      },
      {
        key: "memberships.included",
        editorialStatus: "provisional-membership-policy",
        data: {
          faqKey: "memberships.included",
          question: "What does a Circles Membership include?",
          answer: richContent(
            "Membership includes access to the Circles Member Hub, members-only opportunities, community events, and selected partner benefits. The final offer is being reviewed before production.",
          ),
          published: true,
          sortOrder: 3,
        },
        multiReferences: {
          pages: ["memberships"],
        },
      },
      {
        key: "memberships.apply",
        editorialStatus: "provisional-application-flow",
        data: {
          faqKey: "memberships.apply",
          question: "How do I apply?",
          answer: richContent(
            "Use the application link to tell us about yourself. The final application destination and review process must be confirmed before production.",
          ),
          published: true,
          sortOrder: 4,
        },
        multiReferences: {
          pages: ["memberships"],
        },
      },
    ],
  },
  {
    collectionId: "CHMembershipPlans",
    keyField: "slug",
    items: [
      {
        key: "yearly",
        editorialStatus: "figma-price-awaiting-approval",
        data: {
          slug: "yearly",
          label: "Yearly",
          priceValue: "€2,350/Year",
          note: "Cancel anytime",
          features: ["Member Hub", "Priority booking", "Community events", "Partner benefits"],
          ctaLabel: "Apply",
          routeKey: "memberships",
          highlighted: true,
          published: true,
          sortOrder: 1,
        },
      },
    ],
  },
  {
    collectionId: "CHLegalPages",
    keyField: "slug",
    items: [
      ["privacy", "Privacy Policy"],
      ["terms", "Terms and Conditions"],
      ["cookies", "Cookie Policy"],
      ["legal-notice", "Legal Notice"],
    ].map(([slug, title], index) => ({
      key: slug,
      data: {
        slug,
        title,
        body: richContent(
          `${title} sandbox placeholder.`,
          "This text is for integration testing and requires legal approval before production.",
        ),
        seoTitle: `${title} · Circles House Sandbox`,
        seoDescription: `Sandbox placeholder for ${title.toLowerCase()}.`,
        version: "sandbox-1",
        effectiveFrom: "2027-01-01",
        published: true,
        sortOrder: index + 1,
      },
    })),
  },
];

export const multiReferenceTargets = {
  CHLocations: { amenities: { collectionId: "CHAmenities", keyField: "amenityKey" } },
  CHSpaces: { amenities: { collectionId: "CHAmenities", keyField: "amenityKey" } },
  CHRooms: { amenities: { collectionId: "CHAmenities", keyField: "amenityKey" } },
  CHFaqs: {
    pages: { collectionId: "CHPages", keyField: "pageKey" },
    locations: { collectionId: "CHLocations", keyField: "slug" },
  },
};
