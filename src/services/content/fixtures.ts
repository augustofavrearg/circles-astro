import type { AmbassadorsPage, Deal, EventSummary, EventsPage, FaqSection, HomePage, PartnershipsPage, PlaceDetails, SiteSettings } from "@/domain/content";
import type { Room } from "@/domain/booking";

export const siteSettingsFixture: SiteSettings = {
  promotion: "Members save 15 % on trips of 7+ nights, 30% on 30+ nights trips and 35% on 60+ night trips.",
  mainNav: [
    { label: "Coliving", href: "/#network" },
    { label: "Coworking", href: "/#network" },
    { label: "Community", href: "/#community" },
    { label: "Happening Now", href: "/#events" },
    { label: "About", href: "/#about" },
    { label: "Deals", href: "/deals" },
  ],
  login: { label: "Members Login", href: "/api/auth/login" },
  book: { label: "Book a Stay", href: "/rooms" },
  footer: {
    main: [
      { label: "Coliving", href: "/#network" },
      { label: "Coworking", href: "/#network" },
      { label: "Community", href: "/#community" },
      { label: "Happening Now", href: "/#events" },
      { label: "About", href: "/#about" },
      { label: "Deals", href: "/deals" },
      { label: "Book a Stay", href: "/rooms" },
    ],
    extras: [
      { label: "Memberships", href: "/#membership" },
      { label: "About us", href: "/#about" },
      { label: "News", href: "/#news" },
      { label: "Events Barcelona", href: "/events/barcelona" },
      { label: "Events Andorra", href: "/events/andorra" },
      { label: "Become an Ambassador", href: "/ambassadors" },
    ],
    legal: [
      { label: "Terms & Conditions", href: "/legal/terms" },
      { label: "Cookies Policy", href: "/legal/cookies" },
      { label: "Legal Notice", href: "/legal/notice" },
      { label: "Privacy Policy", href: "/legal/privacy" },
    ],
    image: "/home/footer.png",
  },
  contact: {
    about: "Circles House is a community designed for entrepreneurs and innovators seeking a more meaningful way to live, work, and connect.",
    phone: "+34 619 43 24 69",
    address: "Camí de Vallvidrera al Tibidabo, 05 - 08017 - Barcelona, Barcelona, Spain",
    copyright: `© ${new Date().getFullYear()} circles.house - All rights reserved`,
  },
  socials: [
    { network: "instagram", label: "Instagram", href: "https://instagram.com" },
    { network: "linkedin", label: "LinkedIn", href: "https://linkedin.com" },
    { network: "youtube", label: "YouTube", href: "https://youtube.com" },
  ],
};

const eventDate = {
  month: "Aug",
  day: 18,
  dateLabel: "Monday, August 18",
  timeLabel: "9:00 PM - 11:30 PM GMT+2",
};

/** Figma: detail panel for Circles House Barcelona, shared by the locations slider and the network carousel. */
const barcelonaDetails: PlaceDetails = {
  category: "Coworking location",
  about:
    "Located in a natural park and only a 5 minute walk from a metro station, our house in Vallvidrera is well-located and allows you to get anywhere quickly and easily.",
  rating: 5,
  // Copied as written in Figma ("$" and "€" together); confirm the intended currency format.
  price: { label: "Starting from", value: "$1.900€/month" },
  amenities: ["coliving", "coworking"],
  directions: "20 minutes from Gràcia by public transport.",
  cta: { label: "Book Now", href: "/rooms?location=barcelona" },
  // "Learn more" goes here once the Barcelona location page exists.
};

export const homePageFixture: HomePage = {
  hero: {
    title: "The coliving and coworking community, designed for entrepreneurs and innovators.",
    description:
      "Circles House is a thriving community of entrepreneurs, digital nomads, and innovators. To ensure everyone is a good fit and adds value to our unique ecosystem, we’ve designed a simple and quick application process.",
    video: {
      label: "Discover Circles House",
      poster: "/home/circles-front.png",
      src: "/home/video.mp4",
    },
  },
  slider: [
    {
      name: "Circles House Barcelona",
      address: "Cami de Vallvidrera al Tibidabo 5, Barcelona, Spain",
      href: "/rooms?location=barcelona",
      image: "/home/circles-front.png",
      access: "Members only",
      details: barcelonaDetails,
    },
    {
      name: "Circles House Andorra",
      address: "Andorra la Vella, Andorra",
      href: "/rooms?location=andorra",
      image: "/home/andorra-panoremic.png",
    },
  ],
  searchLocations: [
    { slug: "barcelona", name: "Circles House Barcelona", city: "Barcelona" },
    { slug: "andorra", name: "Circles House Andorra", city: "Andorra", comingSoon: true },
  ],
  network: {
    eyebrow: "The Circles House network",
    title: "A more meaningful way to live, work, and connect.",
    spaces: [
      {
        size: "small",
        category: "Wellness",
        title: "Spa · Coming Soon",
        description: "Thermal circuits, breathwork and cold exposure designed to restore energy and clarity.",
        access: "Public",
        address: "Andorra la Vella, Andorra",
        image: "/home/more-meaningfull-1.png",
        comingSoon: true,
      },
      {
        size: "large",
        category: "Coworking space",
        title: "Circles House Barcelona",
        description: "A home in the hills where focused work and honest community coexist.",
        access: "Members only",
        address: "Vallvidrera, Barcelona",
        image: "/home/circles-front.png",
        details: barcelonaDetails,
      },
      {
        size: "medium",
        category: "Culinary experience",
        title: "Restaurant Andorra",
        description: "Local produce, biodynamic methods and a table built for conversation.",
        access: "Public",
        address: "Andorra la Vella, Andorra",
        image: "/home/kitchen.png",
        comingSoon: true,
      },
      {
        size: "small",
        category: "Events",
        title: "Rooftop",
        description: "Cinema, dinners and ideas above the city.",
        access: "Members only",
        address: "Vallvidrera, Barcelona",
        image: "/home/rooftop.png",
      },
    ],
  },
  happeningNow: {
    eyebrow: "Happening now",
    title: "Here's what's coming up",
    cities: ["Barcelona", "Andorra"],
    viewAll: { label: "View all", href: "/#events" },
    events: [
      {
        ...eventDate,
        city: "Barcelona",
        access: "Members only",
        title: "Movie Night",
        description:
          "Join us for a cozy Rooftop Movie Night exclusively for Circles House members! Relax and unwind with a film, great company, and snacks. This is a great chance to connect with fellow members while enjoying a laid-back evening.",
        image: "/home/whats-comming-1.jpg",
      },
      {
        ...eventDate,
        city: "Barcelona",
        access: "Public",
        title: "HIIT Workout",
        description: "A high-energy session led by guest instructor Raluca Andreea.",
        image: "/home/whats-comming-2.jpg",
      },
      {
        ...eventDate,
        city: "Andorra",
        access: "Public",
        title: "Spanish Conversation Club",
        description: "Practice Spanish and meet an international community of founders and creatives.",
        image: "/home/whats-comming-3.jpg",
      },
    ],
  },
  memberships: {
    eyebrow: "Join us",
    title: "Become a Member",
    description: "Our digital community is where ambitious entrepreneurs come together with seamless opportunities to engage, share ideas, spark connections, and turn visions into reality.",
    cta: { label: "Apply", href: "/api/auth/login" },
    highlights: ["Instant Community", "Focused Channels", "Collaboration"],
    image: "/home/become-a-member.png",
    thumbnail: "/home/rooftop.png",
  },
  introduction: {
    title: "ONE COMMUNITY, ONE HOME WORLDWIDE",
    highlight: "MANY LIFE EXPERIENCES",
    intro:
      "Circles House is a thriving community of entrepreneurs, digital nomads, and innovators. To ensure everyone is a good fit and adds value to our unique ecosystem, we’ve designed a simple and quick application process.",
    body: "We bring humans to the center of every decision. Kindness, love, respect, genuinity and the desire to see your peers grow is key to creating personal and professional relationships that will last a lifetime.",
    cta: { label: "About us", href: "/#about" },
    images: {
      main: "/home/more-meaningfull-1.png",
      left: "/home/rooftop.png",
      right: "/home/kitchen.png",
    },
  },
  testimonials: [
    {
      // Figma only shows the first four lines of each review; the endings come from the previous fixtures and need checking.
      quote:
        "I’ve been staying at Circles and I absolutely love it! The location up in Tibidabo is incredible, the views are breathtaking, and it’s so peaceful, yet still close enough to enjoy everything the city has to offer.",
      author: "Maria Isabel Arbelaez",
      source: "5 out of 5 Review on Google",
    },
    {
      quote:
        "Circles House is a great place to work. The coworking space is productive. I have met lots of interesting people just by being there. It’s easy to focus, network with professionals, and stay healthy.",
      author: "Forne Ce",
      source: "5 out of 5 Review on Google",
    },
    {
      quote:
        "From the very first moment, it became clear that this place is more than just a temporary home. I was warmly welcomed into an atmosphere where everything felt not only well prepared, but heartfelt.",
      author: "Enrico Schmidt",
      source: "5 out of 5 Review on Google",
    },
  ],
  news: {
    eyebrow: "News",
    title: "Latest announcements",
    items: [
      {
        title: "The Science of Supper: How Community Dinners Cultivate Wellbeing",
        excerpt: "Why sharing a table can improve happiness, resilience and the quality of our connections.",
        category: "Announcement",
        date: "Aug 21, 2025",
        href: "/#news",
        image: "/home/last-announcements-3.png",
      },
      {
        title: "Why Gen Z Doesn't Want a 9-to-5 — and What That Means for Housing",
        excerpt: "A new generation is redrawing the lines between home, work and community.",
        category: "Announcement",
        date: "Aug 21, 2025",
        href: "/#news",
        image: "/home/last-announcements-1.png",
      },
      {
        title: "Win a One-Week Stay at Circles House Barcelona",
        excerpt: "A private room, inspiring workspace and one week inside the Circles community.",
        category: "Announcement",
        date: "Aug 21, 2025",
        href: "/#news",
        image: "/home/last-announcements-2.png",
      },
    ],
  },
  newsletter: {
    description:
      "Join our newsletter to connect with a vibrant community of entrepreneurs and innovators at Circles House. Stay updated and be part of our unique ecosystem!",
  },
};

// Figma only shows the answer to the first question; the others are still pending.
const PENDING_ANSWER = [{ type: "paragraph" as const, text: "Answer coming soon." }];

// Figma shows the same FAQ on Ambassadors and Partnerships.
const sharedFaq: FaqSection = {
  eyebrow: "FAQ",
  title: "What you need to know",
  items: [
    {
      question: "How do I get to Circles house?",
      answer: [
        {
          type: "paragraph",
          text: "We’re located in a fantastic area within a natural park, offering stunning views and a peaceful environment. Plus, it’s just a short trip to the city center when you want to explore!\nWe’re near Sarria, a charming local Catalan neighborhood, accessible by a single funicular. It’s a great spot to experience local life and the real essence of Barcelona. Other central areas like Gracia, Plaça Catalunya, and Diagonal are only 20–30 minutes away.",
        },
        { type: "paragraph", text: "Here’s how to get to us:" },
        {
          type: "list",
          items: [
            "Take the S1/S2 metro to Peu de Funicular, then the Funicular to Vallvidrera Superior. From there, it’s a 7-minute walk or a ride on bus 111 to our location.",
            "From the airport, take the Aerobús to Plaça Catalunya, then connect to the S1/S2 metro line. By taxi, we’re just 20 minutes from the airport.",
          ],
        },
      ],
    },
    { question: "What’s the minimum stay?", answer: PENDING_ANSWER },
    { question: "How do I do groceries or get essentials?", answer: PENDING_ANSWER },
    { question: "What’s covered during my stay?", answer: PENDING_ANSWER },
    { question: "What’s the community like? How is it managed?", answer: PENDING_ANSWER },
  ],
};

export const ambassadorsPageFixture: AmbassadorsPage = {
  seo: {
    title: "Become a Circles Ambassador · Circles House",
    description: "Bring people together at Circles and earn a reward every time someone joins an event through your referral code.",
  },
  intro: {
    // Desktop Figma (v1.14) reads "Ambasadors"; mobile (v1.13) reads "Partnerships".
    eyebrow: "Ambassadors",
    title: "Become a Circles Ambassador",
    lead: "At Circles, we love collaborating with people who naturally bring others together.",
    body: "If you enjoy our events and want to earn a referral fee when friends or followers join through you, we’d love to have you as an ambassador. The process is simple: apply below, and if approved, we’ll give you a unique referral code you can share. Every time someone joins a Circles event through your code, you earn a reward.",
    note: "No complicated dashboard — just a straightforward partnership.",
    // The application destination is not defined yet; the button appears once `cta` has a link.
  },
  faq: sharedFaq,
};

export const dealsFixture: Deal[] = [
  {
    slug: "book-3-get-1",
    eyebrow: "New deal",
    title: "Book 3 weeks, get 1 extra week for free",
    description: "Spend your winter mornings in the sun, work with focus, and share evenings that feel like home.",
    terms: "Valid for continuous stays between December 1, 2025, and January 31, 2026. Cannot be combined with other promotions. Terms and conditions here.",
    cta: { label: "Book Now", href: "/rooms" },
  },
  {
    slug: "give-10-get-10",
    eyebrow: "New deal",
    title: "Give 10%, Get 10% – Invite Your Friends!",
    description:
      "Love your experience at Circles? Share it with your friends! When you refer someone to Circles House, both you and your friend receive 10% discount on your monthly stay.\n\nIt’s simple: spread the word, help grow our community, and enjoy great savings together.",
    terms: "*This promotion cannot be combined with other promotions and only applies for the first month.",
    cta: { label: "Book Now", href: "/rooms" },
  },
];

export const partnershipsPageFixture: PartnershipsPage = {
  seo: {
    title: "Partnerships · Circles House",
    description: "Partner with Circles House to increase your rental revenue through smart design and tech-enabled operations.",
  },
  intro: {
    eyebrow: "Partnerships",
    title: "Increase your rental revenue by up to +50%",
    lead: "Unlock new opportunities for your team.",
    body: "Circles is a coliving brand and operator that designs and manages residential and commercial properties to appeal to the growing market of remote workers and\ndistributed teams. We deliver exceptional performance to our partners through smart design and tech-enabled operations.",
    // Desktop Figma (v1.14); mobile (v1.13) reads "We create a culturally diverse international community through digital conscious nomadism."
    note: "We deliver exceptional performance to our partners through smart design and tech-enabled operations.",
    // "Become a Partner" appears once it has a destination.
  },
  partners: {
    eyebrow: "Why join",
    title: "Why partner with Circles?",
    featuredLabel: "Partner of the month",
    // Logos and partner links are pending; the name stands in for the logo meanwhile.
    items: [
      {
        slug: "barcelona-tech-city",
        name: "Barcelona Tech City",
        description:
          "Tech Barcelona is an independent private non-profit association that works to reinforce Barcelona as a model of the international digital and technological ecosystem.",
        featured: true,
      },
      {
        slug: "nomad-in-transylvania",
        name: "Nomad in Transylvania",
        description: "We craft unique journeys that offer a blend of working, exploration, adventure, and networking.",
      },
      {
        slug: "karisma",
        name: "Karisma",
        description: "Join a curated community of growth-minded 7+ figure founders, vetted and matched to accelerate your next chapter.",
      },
      {
        slug: "nomadico",
        name: "Nomadico",
        description: "We are building a network of affordable and authentic community coliving spaces for nomads and remote workers.",
      },
    ],
  },
  membership: {
    title: "Become a member and get discounts for all our partners",
    // Same destination as "Apply" in the home Memberships section; "Book a Call" is pending.
    primaryCta: { label: "Join us", href: "/api/auth/login" },
  },
  faq: sharedFaq,
};

export const eventsPageFixture: EventsPage = {
  title: "Live Surrounded by Nature",
  subtitle: "See What Makes our Inspiring Coworking Spaces Perfect for Entrepreneurs and Innovators",
  eyebrows: {
    barcelona: "Coliving @ Circles Barcelona",
    // Figma only shows Barcelona; these follow the same pattern and need confirming.
    andorra: "Coliving @ Circles Andorra",
    all: "Happening now",
  },
  cities: [
    { slug: "barcelona", name: "Barcelona" },
    { slug: "andorra", name: "Andorra" },
  ],
};

const augustEvening = { month: "Aug", day: 18, dateLabel: "Monday, August 18", timeLabel: "9:00 PM - 11:30 PM GMT+2" };

// Figma "Events - Barcelona". Thumbnails and detail links are pending; rows render without them.
export const eventsFixture: EventSummary[] = [
  { slug: "evening-innovation-jam", city: "barcelona", title: "Evening Innovation Jam", subtitle: "A 4-Hour Focused Collaboration Session", ...augustEvening },
  { slug: "nighttime-coding-challenge", city: "barcelona", title: "Nighttime Coding Challenge", subtitle: "A 4-Hour Teamwork Workshop", ...augustEvening },
  { slug: "late-night-brainstorming-session", city: "barcelona", title: "Late Night Brainstorming Session", subtitle: "A 4-Hour Creative Collaboration", ...augustEvening },
  { slug: "midnight-hackathon", city: "barcelona", title: "Midnight Hackathon", subtitle: "A 4-Hour Innovation Sprint", ...augustEvening },
  { slug: "twilight-tech-challenge", city: "barcelona", title: "Twilight Tech Challenge", subtitle: "A 4-Hour Synergy Session", ...augustEvening },
  { slug: "evening-code-fest", city: "barcelona", title: "Evening Code Fest", subtitle: "A 4-Hour Team Building Event", ...augustEvening },
  { slug: "nocturnal-development-workshop", city: "barcelona", title: "Nocturnal Development Workshop", subtitle: "A 4-Hour Collaborative Hack Session", ...augustEvening },
];

export const roomsFixture: Room[] = [
  {
    id: "garden-room",
    name: "Garden Room",
    locationId: "barcelona",
    locationName: "Circles House Barcelona",
    image: "/home/circles-front.png",
    description: "A quiet private room with natural light and direct access to the garden level.",
    bookingUrl: "https://hotels.cloudbeds.com/",
  },
  {
    id: "panorama-room",
    name: "Panorama Room",
    locationId: "barcelona",
    locationName: "Circles House Barcelona",
    image: "/home/andorra-panoremic.png",
    description: "Our brightest room, designed for long stays and slow mornings above the city.",
    bookingUrl: "https://hotels.cloudbeds.com/",
  },
];
