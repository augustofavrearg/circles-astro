import type { HomePage, SiteSettings } from "@/domain/content";
import type { Room } from "@/domain/booking";

export const siteSettingsFixture: SiteSettings = {
  promotion: "Members save 15 % on trips of 7+ nights, 30% on 30+ nights trips and 35% on 60+ night trips.",
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
      { label: "About", href: "/#about" },
      { label: "Book a Stay", href: "/rooms" },
    ],
    extras: [
      { label: "Memberships", href: "/#membership" },
      { label: "About us", href: "/#about" },
      { label: "News", href: "/#news" },
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
