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
    body: "A community for entrepreneurs and innovators to live, work and connect.",
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
    body: "Connect with ambitious entrepreneurs and turn shared ideas into action.",
    primaryCtaLabel: "Apply",
    primaryRouteKey: "memberships",
  },
  "home.introduction": {
    subtitle: "Many life experiences",
    lead: "Circles House brings entrepreneurs, digital nomads and innovators together.",
    body: "We put people, kindness and meaningful collaboration at the centre of every decision.",
    primaryCtaLabel: "About us",
    primaryRouteKey: "what-is-circles",
  },
  "home.news": {
    eyebrow: "News",
  },
};

export const seedCollections = [
  {
    collectionId: "CHSiteSettings",
    keyField: "key",
    items: [
      {
        key: "global",
        data: {
          key: "global",
          siteName: "Circles House Sandbox",
          defaultSeoTitle: "Circles House Sandbox",
          defaultSeoDescription:
            "Staging content used to validate the Circles House Astro integration.",
          promotionText:
            "Sandbox promotion: members save on extended stays.",
          contactAbout:
            "Circles House is a community for entrepreneurs and innovators.",
          contactPhone: "+34 619 43 24 69",
          contactEmail: "sandbox@example.com",
          contactAddress:
            "Camí de Vallvidrera al Tibidabo 5, Barcelona, Spain",
          copyrightTemplate: "© {year} Circles House — Sandbox",
          newsletterTitle: "Stay in the circle",
          newsletterDescription:
            "Sandbox newsletter copy used to verify global CMS settings.",
          newsletterConsentText:
            "I agree to receive sandbox communications.",
        },
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
      { key: "home", data: page("home", "static", "home") },
      { key: "events", data: page("events", "static", "events") },
      { key: "team", data: page("team", "static", "team") },
      {
        key: "memberships",
        data: page("memberships", "static", "memberships"),
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
          title: "Circles House Barcelona · Sandbox",
        }),
      },
      {
        key: "coworking-barcelona",
        data: page("coworking-barcelona", "coworking", "coworking", {
          routeParam: "barcelona",
          title: "Coworking Barcelona · Sandbox",
        }),
      },
      {
        key: "june",
        data: page("june", "month", "month", {
          routeParam: "june",
          title: "June at Circles House Barcelona · Sandbox",
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
      ["home.hero", "home", "home.hero", "Welcome to the Circles House sandbox"],
      ["home.network", "home", "home.network", "A more meaningful way to live, work and connect"],
      ["home.happeningNow", "home", "home.happeningNow", "Here's what's coming up"],
      ["home.memberships", "home", "home.memberships", "Become a Member"],
      ["home.introduction", "home", "home.introduction", "One community, one home worldwide"],
      ["home.news", "home", "home.news", "Latest announcements"],
      ["events.intro", "events", "events.intro", "Happening now"],
      ["team.intro", "team", "team.intro", "Meet the community team"],
      ["memberships.intro", "memberships", "memberships.intro", "Become a member"],
      ["what-is-circles.intro", "what-is-circles", "what-is-circles.intro", "A more meaningful way to live"],
      ["life-at-circles.intro", "life-at-circles", "life-at-circles.intro", "Life at Circles"],
      ["partnerships.intro", "partnerships", "partnerships.intro", "Partner with Circles"],
      ["ambassadors.intro", "ambassadors", "ambassadors.intro", "Become an ambassador"],
      ["for-investors.intro", "for-investors", "for-investors.intro", "Invest in community-led living"],
      ["location-barcelona.hero", "location-barcelona", "location.hero", "Circles House Barcelona"],
      ["coworking-barcelona.hero", "coworking-barcelona", "coworking.hero", "Coworking Barcelona"],
      ["june.hero", "june", "month.hero", "June at Circles House Barcelona"],
    ].map(([sectionKey, pageKey, componentKey, title], index) => ({
      key: sectionKey,
      data: {
        sectionKey,
        page: reference("CHPages", pageKey),
        componentKey,
        eyebrow: "Sandbox",
        title,
        body: "This section is CMS-managed staging content.",
        ...(pageSectionOverrides[sectionKey] ?? {}),
        enabled: true,
        sortOrder: index + 1,
      },
    })),
  },
  {
    collectionId: "CHSectionItems",
    keyField: "itemKey",
    items: [
      {
        key: "home.memberships.community",
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
        data: {
          itemKey: "home.memberships.collaboration",
          section: reference("CHPageSections", "home.memberships"),
          title: "Collaboration",
          published: true,
          sortOrder: 3,
        },
      },
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
        key: "barcelona-coworking",
        data: {
          slug: "barcelona-coworking",
          location: reference("CHLocations", "barcelona"),
          spaceType: "coworking",
          categoryLabel: "Coworking space",
          title: "Circles House Barcelona Coworking",
          description: "A focused workspace surrounded by nature.",
          accessLabel: "Members only",
          status: "open",
          featuredHome: true,
          homeCardSize: "large",
          homeSortOrder: 1,
          published: true,
          sortOrder: 1,
        },
        multiReferences: {
          amenities: ["coworking", "high-speed-wifi", "rooftop"],
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
          description: "A future wellness space in Andorra.",
          accessLabel: "Coming soon",
          status: "coming-soon",
          featuredHome: true,
          homeCardSize: "small",
          homeSortOrder: 2,
          published: true,
          sortOrder: 2,
        },
      },
    ],
  },
  {
    collectionId: "CHRooms",
    keyField: "slug",
    items: [
      {
        key: "barcelona-garden-room",
        data: {
          slug: "barcelona-garden-room",
          location: reference("CHLocations", "barcelona"),
          name: "Garden Room",
          occupancyType: "private",
          description: "Sandbox room connected to Barcelona and Cloudbeds.",
          features: ["Private bathroom", "Garden view", "Desk"],
          houseLabel: "Circles House Barcelona",
          views: "Garden",
          priceLabel: "Starting from",
          priceValue: "€1,900/month",
          bookingUrl: "https://hotels.cloudbeds.com/",
          published: true,
          sortOrder: 1,
        },
        multiReferences: {
          amenities: ["air-conditioning", "desk", "wardrobe-storage"],
        },
      },
      {
        key: "barcelona-rooftop-room",
        data: {
          slug: "barcelona-rooftop-room",
          location: reference("CHLocations", "barcelona"),
          name: "Rooftop Room",
          occupancyType: "private",
          description: "Sandbox room with rooftop access.",
          features: ["Private room", "Desk", "Rooftop access"],
          houseLabel: "Circles House Barcelona",
          views: "Barcelona skyline",
          priceLabel: "Starting from",
          priceValue: "€2,100/month",
          bookingUrl: "https://hotels.cloudbeds.com/",
          published: true,
          sortOrder: 2,
        },
        multiReferences: {
          amenities: ["air-conditioning", "desk", "wardrobe-storage", "terrace"],
        },
      },
    ],
  },
  {
    collectionId: "CHEvents",
    keyField: "slug",
    items: [
      {
        key: "sandbox-community-dinner",
        data: {
          slug: "sandbox-community-dinner",
          location: reference("CHLocations", "barcelona"),
          program: reference("CHPrograms", "founders-month"),
          eventType: "circles",
          title: "Sandbox Community Dinner",
          subtitle: "A shared table for the staging community",
          description: "Representative event used to test dates and references.",
          accessLabel: "Members only",
          venueName: "Circles House Barcelona",
          venueAddress: "Camí de Vallvidrera al Tibidabo 5",
          startsAt: "2027-06-12T18:00:00.000Z",
          endsAt: "2027-06-12T20:00:00.000Z",
          timezone: "Europe/Madrid",
          featuredHome: true,
          homeSortOrder: 1,
          published: true,
          sortOrder: 1,
        },
      },
      {
        key: "sandbox-morning-workout",
        data: {
          slug: "sandbox-morning-workout",
          location: reference("CHLocations", "barcelona"),
          eventType: "circles",
          title: "Sandbox Morning Workout",
          description: "A public wellness event for CMS testing.",
          accessLabel: "Public",
          venueName: "Circles House Barcelona",
          startsAt: "2027-06-15T07:00:00.000Z",
          endsAt: "2027-06-15T08:00:00.000Z",
          timezone: "Europe/Madrid",
          featuredHome: true,
          homeSortOrder: 2,
          published: true,
          sortOrder: 2,
        },
      },
    ],
  },
  {
    collectionId: "CHNewsArticles",
    keyField: "slug",
    items: [
      {
        key: "sandbox-community-living",
        data: {
          slug: "sandbox-community-living",
          title: "How community changes the way we live",
          excerpt: "Sandbox article used to validate Wix Rich Content.",
          body: richContent(
            "This is representative staging content stored as a valid Ricos document.",
            "It verifies that articles can be created, queried and referenced without affecting production.",
          ),
          contentType: "feature",
          category: "Community",
          author: reference("CHPeople", "sandbox-community-lead"),
          publishedAt: "2027-05-20T09:00:00.000Z",
          seoTitle: "Community living · Circles House Sandbox",
          seoDescription: "Sandbox article for CMS integration testing.",
          featuredHome: true,
          homeSortOrder: 1,
          published: true,
        },
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
        key: "sandbox-review-1",
        data: {
          testimonialKey: "sandbox-review-1",
          quote: "The sandbox CMS makes every content relationship easy to verify.",
          authorName: "Sandbox Guest",
          sourceLabel: "Integration test",
          rating: 5,
          location: reference("CHLocations", "barcelona"),
          featuredHome: true,
          published: true,
          sortOrder: 1,
        },
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
          pages: ["what-is-circles", "location-barcelona"],
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
          pages: ["location-barcelona", "june"],
          locations: ["barcelona"],
        },
      },
    ],
  },
  {
    collectionId: "CHMembershipPlans",
    keyField: "slug",
    items: [
      {
        key: "sandbox-community",
        data: {
          slug: "sandbox-community",
          label: "Community Membership",
          priceValue: "€0 sandbox",
          note: "Testing only",
          features: ["Community access", "Events", "Member benefits"],
          ctaLabel: "Learn more",
          routeKey: "memberships",
          highlighted: true,
          published: true,
          sortOrder: 1,
        },
      },
      {
        key: "sandbox-resident",
        data: {
          slug: "sandbox-resident",
          label: "Resident Membership",
          priceValue: "€0 sandbox",
          note: "Testing only",
          features: ["Coliving", "Coworking", "Community access"],
          ctaLabel: "View rooms",
          routeKey: "rooms",
          highlighted: false,
          published: true,
          sortOrder: 2,
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
