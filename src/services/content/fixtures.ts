import type { HomePage, SiteSettings } from "@/domain/content";
import type { Room } from "@/domain/booking";

export const siteSettingsFixture: SiteSettings = {
  promotion: "Members save 15% on trips of 7+ nights, 30% on 30+ nights and 35% on 60+ nights.",
  mainNav: [
    { label: "Coliving", href: "/#network" },
    { label: "Coworking", href: "/#network" },
    { label: "Community", href: "/#community" },
    { label: "Happening Now", href: "/#events" },
    { label: "About", href: "/#about" },
    { label: "Rooms", href: "/rooms" },
  ],
  login: { label: "Members Login", href: "/api/auth/login" },
  book: { label: "Book a Stay", href: "/rooms" },
  footer: {
    main: [
      { label: "Coliving", href: "/#network" },
      { label: "Coworking", href: "/#network" },
      { label: "Community", href: "/#community" },
      { label: "Happening Now", href: "/#events" },
      { label: "Rooms", href: "/rooms" },
    ],
    extras: [
      { label: "Memberships", href: "/#membership" },
      { label: "About us", href: "/#about" },
      { label: "News", href: "/#news" },
    ],
    legal: [
      { label: "Terms & Conditions", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Cookie Policy", href: "/legal/cookies" },
      { label: "Legal Notice", href: "/legal/notice" },
    ],
    image: "/home/footer.png",
  },
  contact: {
    about: "Circles House is a community for entrepreneurs and innovators seeking a more meaningful way to live, work and connect.",
    phone: "+34 619 43 24 69",
    address: "Camí de Vallvidrera al Tibidabo, 05 · 08017 Barcelona, Spain",
    copyright: `© ${new Date().getFullYear()} circles.house · All rights reserved`,
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
  timeLabel: "9:00 PM – 11:30 PM GMT+2",
};

export const homePageFixture: HomePage = {
  hero: {
    title: "The coliving and coworking community, designed for entrepreneurs and innovators.",
    description:
      "Circles House is a thriving community of entrepreneurs, digital nomads, and innovators. A home designed to focus deeply, live fully, and meet the people who move your ideas forward.",
    video: {
      label: "Discover Circles House",
      poster: "/home/circles-front.png",
      src: "/home/video.mp4",
    },
  },
  slider: [
    {
      name: "Circles House Barcelona",
      address: "Camí de Vallvidrera al Tibidabo 5, Barcelona, Spain",
      href: "/rooms?location=barcelona",
      image: "/home/circles-front.png",
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
        category: "Coliving & coworking",
        title: "Circles House Barcelona",
        description: "A home in the hills where focused work and honest community coexist.",
        access: "Members only",
        address: "Vallvidrera, Barcelona",
        image: "/home/circles-front.png",
        details: {
          about: "Located in a natural park and a five-minute walk from the metro, our Barcelona house offers quiet without disconnecting you from the city.",
          rating: 5,
          price: { label: "Starting from", value: "€1,900 / month" },
          amenities: ["coliving", "coworking"],
          directions: "20 minutes from Gràcia by public transport.",
          page: { label: "Choose a room", href: "/rooms?location=barcelona" },
        },
      },
      {
        size: "medium",
        category: "Culinary experience",
        title: "Restaurant Andorra",
        description: "Local produce, biodynamic methods and a table built for conversation.",
        access: "Public",
        address: "Andorra la Vella, Andorra",
        image: "/home/kitchen.png",
      },
      {
        size: "small",
        category: "Events",
        title: "The Rooftop",
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
        description: "A rooftop film, something good to eat, and the kind of conversation that runs long after the credits.",
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
    description: "A digital and physical community where ambitious people share ideas, create opportunities and help one another move forward.",
    cta: { label: "Apply", href: "/api/auth/login" },
    highlights: ["Instant Community", "Focused Channels", "Collaboration"],
    image: "/home/become-a-member.png",
    thumbnail: "/home/rooftop.png",
  },
  introduction: {
    title: "ONE COMMUNITY, ONE HOME WORLDWIDE",
    highlight: "MANY LIFE EXPERIENCES",
    intro: "Circles House brings together entrepreneurs, digital nomads and innovators who want more from the places where they live and work.",
    body: "We put humans at the center of every decision. Kindness, respect, curiosity and the desire to see your peers grow are how lasting relationships begin.",
    cta: { label: "About us", href: "/#about" },
    images: {
      main: "/home/more-meaningfull-1.png",
      left: "/home/kitchen.png",
      right: "/home/rooftop.png",
    },
  },
  testimonials: [
    {
      quote: "The views are breathtaking and the house feels peaceful, yet still close enough to enjoy everything Barcelona has to offer.",
      author: "Maria Isabel Arbelaez",
      source: "5 out of 5 · Google",
    },
    {
      quote: "It is easy to focus, meet interesting people and stay healthy. A genuinely solid place to work and connect.",
      author: "Forne Ce",
      source: "5 out of 5 · Google",
    },
    {
      quote: "More than a temporary home: beautifully prepared, heartfelt and immediately comfortable.",
      author: "Enrico Schmidt",
      source: "5 out of 5 · Google",
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
        image: "/home/last-announcements-1.png",
      },
      {
        title: "Why Gen Z Doesn't Want a 9-to-5 — and What That Means for Housing",
        excerpt: "A new generation is redrawing the lines between home, work and community.",
        category: "Perspective",
        date: "Aug 21, 2025",
        href: "/#news",
        image: "/home/last-announcements-2.png",
      },
      {
        title: "Win a One-Week Stay at Circles House Barcelona",
        excerpt: "A private room, inspiring workspace and one week inside the Circles community.",
        category: "Community",
        date: "Aug 21, 2025",
        href: "/#news",
        image: "/home/last-announcements-3.png",
      },
    ],
  },
  newsletter: {
    description: "Stay close to the people, places and ideas shaping life at Circles House.",
  },
};

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
