import type {
  AmbassadorsPage,
  CoworkingPage,
  Deal,
  DealsPage,
  EventSummary,
  EventsPage,
  FaqSection,
  ForInvestorsPage,
  HomePage,
  LifePage,
  LocationPage,
  LocationSpacePage,
  MembershipsPage,
  MonthPage,
  PartnershipsPage,
  PlaceDetails,
  ProgramPage,
  ProgramSummary,
  RoomsPage,
  SiteSettings,
  StayCampaign,
  TeamMember,
  TeamPage,
  WhatIsCirclesPage,
} from "@/domain/content";
import type { Room } from "@/domain/booking";

export const siteSettingsFixture: SiteSettings = {
  promotion: "Members save 15 % on trips of 7+ nights, 30% on 30+ nights trips and 35% on 60+ night trips.",
  newsletter: {
    title: "Join our Newsletter",
    description: "Join our newsletter to connect with a vibrant community of entrepreneurs and innovators at Circles House. Stay updated and be part of our unique ecosystem!",
    consentText: "I agree to receive communications from Circles House.",
  },
  footer: {
    image: "/images/shared/footer/coworking-office.png",
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
  cta: { label: "Book Now", href: "/rooms/barcelona" },
  page: { label: "Learn more", href: "/locations/barcelona" },
};

export const homePageFixture: HomePage = {
  seo: {
    title: "Circles House · Coliving and coworking community",
    description: "Live, work and connect with entrepreneurs and innovators at Circles House.",
  },
  hero: {
    title: "The coliving and coworking community, designed for entrepreneurs and innovators.",
    description:
      "Circles House is a thriving community of entrepreneurs, digital nomads, and innovators. To ensure everyone is a good fit and adds value to our unique ecosystem, we’ve designed a simple and quick application process.",
    video: {
      label: "Discover Circles House",
      poster: "/images/locations/barcelona/house-exterior.png",
      src: "/images/home/hero/circles-house.mp4",
    },
  },
  slider: [
    {
      name: "Circles House Barcelona",
      address: "Cami de Vallvidrera al Tibidabo 5, Barcelona, Spain",
      href: "/rooms/barcelona",
      image: "/images/locations/barcelona/house-exterior.png",
      access: "Members only",
      details: barcelonaDetails,
    },
    {
      name: "Circles House Andorra",
      address: "Andorra la Vella, Andorra",
      href: "/rooms/andorra",
      image: "/images/locations/andorra/landscape.png",
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
        image: "/images/locations/andorra/spa-pool.png",
        comingSoon: true,
      },
      {
        size: "large",
        category: "Coworking space",
        title: "Circles House Barcelona",
        description: "A home in the hills where focused work and honest community coexist.",
        access: "Members only",
        address: "Vallvidrera, Barcelona",
        image: "/images/locations/barcelona/house-exterior.png",
        details: barcelonaDetails,
      },
      {
        size: "medium",
        category: "Culinary experience",
        title: "Restaurant Andorra",
        description: "Local produce, biodynamic methods and a table built for conversation.",
        access: "Public",
        address: "Andorra la Vella, Andorra",
        image: "/images/locations/andorra/restaurant-kitchen.png",
        comingSoon: true,
      },
      {
        size: "small",
        category: "Events",
        title: "Rooftop",
        description: "Cinema, dinners and ideas above the city.",
        access: "Members only",
        address: "Vallvidrera, Barcelona",
        image: "/images/locations/barcelona/rooftop-community.png",
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
        image: "/images/events/barcelona/movie-night.jpg",
      },
      {
        ...eventDate,
        city: "Barcelona",
        access: "Public",
        title: "HIIT Workout",
        description: "A high-energy session led by guest instructor Raluca Andreea.",
        image: "/images/events/barcelona/hiit-workout.jpg",
      },
      {
        ...eventDate,
        city: "Andorra",
        access: "Public",
        title: "Spanish Conversation Club",
        description: "Practice Spanish and meet an international community of founders and creatives.",
        image: "/images/events/barcelona/spanish-conversation-club.jpg",
      },
    ],
  },
  memberships: {
    eyebrow: "Join us",
    title: "Become a Member",
    description: "Our digital community is where ambitious entrepreneurs come together with seamless opportunities to engage, share ideas, spark connections, and turn visions into reality.",
    cta: { label: "Apply", href: "/api/auth/login" },
    highlights: ["Instant Community", "Focused Channels", "Collaboration"],
    image: "/images/home/membership/rooftop-community.png",
    thumbnail: "/images/home/membership/house-exterior.png",
  },
  introduction: {
    title: "ONE COMMUNITY, ONE HOME WORLDWIDE",
    highlight: "MANY LIFE EXPERIENCES",
    intro:
      "Circles House is a thriving community of entrepreneurs, digital nomads, and innovators. To ensure everyone is a good fit and adds value to our unique ecosystem, we’ve designed a simple and quick application process.",
    body: "We bring humans to the center of every decision. Kindness, love, respect, genuinity and the desire to see your peers grow is key to creating personal and professional relationships that will last a lifetime.",
    cta: { label: "About us", href: "/#about" },
    images: {
      main: "/images/home/introduction/circles-house-aerial.png",
      left: "/images/locations/barcelona/rooftop-community.png",
      right: "/images/home/introduction/balcony-view.png",
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
        contentType: "feature",
        category: "News",
        date: "Aug 21, 2025",
        href: "/#news",
        image: "/images/news/community-dinners.png",
      },
      {
        title: "Why Gen Z Doesn't Want a 9-to-5 — and What That Means for Housing",
        excerpt: "A new generation is redrawing the lines between home, work and community.",
        contentType: "feature",
        category: "Announcement",
        date: "Aug 21, 2025",
        href: "/#news",
        image: "/images/news/gen-z-housing.png",
      },
      {
        title: "Win a One-Week Stay at Circles House Barcelona",
        excerpt: "A private room, inspiring workspace and one week inside the Circles community.",
        contentType: "announcement",
        category: "Announcement",
        date: "Aug 21, 2025",
        href: "/#news",
        image: "/images/news/summer-giveaway.png",
      },
    ],
  },
};

export const roomsPageFixture: RoomsPage = {
  seo: {
    title: "Rooms · Circles House Barcelona",
    description:
      "Explore private studios, suites and shared rooms at Circles House Barcelona, then continue to Cloudbeds to check live availability.",
  },
  intro: {
    eyebrow: "Stay with us",
    title: "A room for your needs",
    body:
      "Choose from private studios, comfortable suites and shared rooms designed for focused work, meaningful rest and life in community.",
  },
  band: {
    title: "Stay longer and save more",
    secondaryCta: { label: "Explore Barcelona", href: "/locations/barcelona" },
    primaryCta: { label: "Become a member", href: "/memberships" },
  },
  empty: {
    title: "No rooms are published for this location yet.",
    body: "View every available room or choose another location.",
    cta: { label: "View every room", href: "/rooms" },
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

export const dealsPageFixture: DealsPage = {
  seo: {
    title: "Deals · Circles House",
    description: "Current Circles House offers for coliving and coworking stays in Barcelona and Andorra.",
  },
  deals: {
    eyebrow: "Current offers",
    title: "Stay longer, experience more.",
    emptyText: "There are no deals available right now.",
    source: { mode: "automatic", key: "deals.active" },
  },
};

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
    source: { mode: "automatic", key: "partners.published" },
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

export const forInvestorsPageFixture: ForInvestorsPage = {
  seo: {
    title: "For Investors · Circles House",
    description: "Open the world up to your team with Circles House: homes built for work, a remote community and a dedicated account manager.",
  },
  intro: {
    eyebrow: "For investors",
    title: "Open the world up to your team.",
    // Desktop Figma (v1.14); mobile (v1.13) reads "Countless personal adventures."
    lead: "Unlock new opportunities for your team.",
    body: "Our team of founders are passionate about building this community of entrepreneurs and making a difference for digital nomads around the world to make them feel like they have a home away from home.",
    // Desktop ends at "digital conscious."; mobile has the full sentence.
    note: "We create a culturally diverse international community through digital conscious nomadism.",
    // "Book a Call" and "Request a Quote" appear once they have destinations.
  },
  benefits: {
    eyebrow: "Benefits",
    title: "Advantages of Being an Investor",
    items: [
      {
        label: "Locations",
        title: "Comfortable Homes, Built for Work",
        text: "Ensure team members stay focused and productive with lightning fast wifi and comfortable workspaces.",
      },
      {
        label: "People",
        title: "Remote Community",
        text: "Help employees network with other work-focused professionals to stay happy and connected.",
      },
      {
        label: "Managing",
        title: "Dedicated Account Manager",
        text: "Your dedicated Account Manager is always available for any questions.",
      },
    ],
  },
  features: {
    eyebrow: "Why invest",
    title: "Investment Features",
    items: [
      {
        title: "Instant Approval",
        text: "All employees are granted immediate approval, allowing them to effortlessly bypass the Circles application process. This streamlined approach ensures that they can quickly access the necessary resources and tools without any delays, enhancing overall productivity and efficiency within the organization.",
      },
      {
        title: "Flexible Membership Transfer",
        text: "In the event that an employee decides to leave the company, it is important to note that their membership can be seamlessly transferred to another employee within the organization. This process ensures that the benefits and privileges associated with the membership are not lost and can continue to be utilized by a new team member, thereby maintaining continuity and support for our workforce.",
      },
      {
        title: "Referral Incentive",
        // As in Figma; "Outsite" is another coliving brand, so this likely needs to read "Circles".
        text: "Earn an impressive $500 in Outsite credits by referring a company that has 10 or more employees and successfully signs up with us. This is a fantastic opportunity to not only help your network discover our services but also to reap the rewards for your efforts!",
      },
    ],
  },
  band: { title: "Become an Investor" },
  faq: sharedFaq,
};

export const teamPageFixture: TeamPage = {
  seo: {
    title: "Our team · Circles House",
    description: "Meet the founders behind Circles House, a culturally diverse international community for digital nomads and entrepreneurs.",
  },
  intro: {
    eyebrow: "Our team",
    title: "BEHIND CIRCLES",
    lead: "Countless personal adventures.",
    body: "Whether you’re a remote-first company or hybrid team, Business Memberships make it easy for your employees to stay comfortable and productive while traveling and working remotely.",
    note: "We create a culturally diverse international community through digital conscious nomadism.",
  },
  members: { eyebrow: "Meet the founders", title: "Our Values that we Share" },
  // Same destination as "Join us" on Partnerships.
  band: { title: "Stay longer and Save more", primaryCta: { label: "Join us", href: "/api/auth/login" } },
  faq: sharedFaq,
};

// Photos and "Learn more" links are pending.
export const teamMembersFixture: TeamMember[] = [
  { slug: "natalia-juncosa", name: "Natalia Juncosa", role: "Co-founder & design director" },
  { slug: "enric-sole", name: "Enric Sole", role: "Co-founder & CEO" },
  { slug: "loic-malsch", name: "Loic Malsch", role: "Co-founder" },
  { slug: "karen-prats", name: "Karen Prats", role: "Co-founder" },
  { slug: "vanina-arballo", name: "Vanina Arballo", role: "Creative" },
  { slug: "gui-perdrix", name: "Gui Perdrix", role: "Co-founder" },
];

export const whatIsCirclesPageFixture: WhatIsCirclesPage = {
  seo: {
    title: "What is Circles · Circles House",
    description: "One community, one home worldwide: a global boutique coliving chain for self-starters, entrepreneurs and creators.",
  },
  intro: {
    eyebrow: "What is Circles",
    title: "ONE COMMUNITY, ONE HOME WORLDWIDE",
    lead: "A multitude of life journeys.",
    body: "Our mission is to build a global and decentralized modern boutique coliving chain for self-starters, entrepreneurs, and creators focused on creating meaningful relationships.\nWe strive to inspire humans to embrace digital nomadism and live a fulfilling life by exploring the world and working remotely.",
    note: "We create a culturally diverse international community through digital conscious nomadism.",
  },
  purpose: {
    eyebrow: "Why join",
    text: "Here at Circles, our primary purpose is to create a culturally diverse international community through digital conscious nomadism.",
  },
  values: {
    eyebrow: "Why join",
    title: "Our Values that we Share",
    items: [
      {
        title: "Human centric",
        text: "We bring humans to the center of every decision. Kindness, love, respect, genuinity and the desire to see your peers grow is key to creating personal and professional relationships that will last a lifetime.",
      },
      {
        title: "Creativity",
        text: "Innovation, design, and passion are fundamental elements of Circles. Every detail says something, we innovate to make a difference, and our passion for design makes us unique.",
      },
      {
        title: "Wellbeing",
        text: "When you co—live at Circles, life is about enjoying the ride and having experiences that focus on wellbeing and personal growth. Find your purpose and thrive!",
      },
      {
        title: "Inner sense of accountability",
        text: "We believe in doing things that matter and being worldly conscious individuals. We strive to do more with less and we are always thinking about how to create a positive impact for ourselves, others, and our planet as a collective.",
      },
    ],
  },
  edge: {
    title: "Beyond the edge",
    text: "Sometimes pushing yourself to do things that make you uncomfortable is the best way to grow as a person. Explore every ambitious aspect outside of your comfort zone to live a brave and enriching life.",
    footnote: "Diamonds are made from pressure and so are we as humans.",
  },
  manifesto: {
    eyebrow: "Manifesto",
    title: "Our Invitation",
    lead: "To the curious, the courageous, the creatives, the doers—\nYou are welcome here.",
    paragraphs: [
      "At Circles House, we believe in a new way of living and working—one that challenges isolation, fuels purpose, and cultivates connection. We are the intersection of human relationships, meaningful work, and personal wellbeing. Here, life isn’t compartmentalized—living and working converge into a richer, more intentional existence.",
      "We exist to reinvent what it means to be home and what it means to build.\nIn a world fragmented by endless screens and solo pursuits, we choose community, collaboration, and consciousness.\nWe empower individuals to be creators of impact, not just consumers of space.",
    ],
    // Gallery photos are pending; the arrows appear once there is more than one.
    images: [],
  },
  faq: sharedFaq,
};

export const membershipsPageFixture: MembershipsPage = {
  seo: {
    title: "Memberships · Circles House",
    description: "Join Circles Membership for exclusive access to locations, deals, events, and the Member Hub.",
  },
  intro: {
    eyebrow: "Memberships",
    title: "Become a Member",
    body: "Join Circles Membership for exclusive access to locations, deals, events, and the Member Hub.\nIt’s where everything begins.",
    // Same destination as "Apply" in the home Memberships section; "Book a Call" is pending.
    cta: { label: "Apply", href: "/api/auth/login" },
  },
  benefits: {
    eyebrow: "Why join",
    title: "Membership Benefits",
    items: [
      { title: "Discounted price for every booking", text: "Unlock exclusive booking access to over 30 Members Only locations." },
      {
        title: "Entrepreneur’s Hub",
        text: "Join the online community to exchange ideas, opportunities, and practical knowledge with other Circles members.",
      },
      { title: "Priority in Bookings", text: "Get early access to selected rooms, stays, and experiences across the Circles network." },
      { title: "Access when opening a New Location", text: "Be among the first members invited to discover new Circles House locations." },
      { title: "Partners’ perks all over the world", text: "Access benefits from a curated network of partners aligned with the way our community lives and works." },
      { title: "Exclusive Members only offers", text: "Receive offers created for members, from extended stays to community-led experiences." },
    ],
  },
  hub: {
    eyebrow: "What is the hub",
    title: "Circles Member Hub",
    subtitle: "Circles Member Hub is a place for Members to connect, share networking opportunities, and view community events",
    topics: ["Plan your next trip to Circles Spaces", "Expand your nomadic network", "Ask Questions and Share Knowledge"],
    text: "Explore the vibrant surroundings, immerse yourself in local culture, and discover hidden gems that await you at every turn. Whether you’re seeking relaxation or adventure, Circles Spaces has something for everyone.",
    // Four photos in Figma (two large, two small); pending.
    images: [],
    stats: [
      { icon: "globe", label: "+40 Nationalities represented" },
      { icon: "age", label: "36 years average age" },
      { icon: "stay", label: "2 weeks of average stay" },
    ],
  },
  pricing: {
    eyebrow: "Pricing",
    title: "A membership designed around how you live and work.",
    features: [
      "Members-only booking rates",
      "Access to the Circles Member Hub",
      "Priority booking opportunities",
      "Invitations to community events",
      "Partner perks and member offers",
      "Early access to new locations",
    ],
    // The current Figma shows this yearly price. It remains provisional until the membership offer is approved.
    plans: [{ label: "Yearly", price: "€2,350/Year", note: "Cancel anytime" }],
    // "Contact" and "Subscribe" appear once they have destinations.
    images: [],
  },
  members: {
    eyebrow: "Members",
    title: "Meet our Members",
    items: [
      {
        name: "Kimberly Defors",
        // Truncated in Figma after "branding and ma…"; the ending needs confirming.
        bio: "Kimberly Defors, a digital nomad specializing in branding and marketing and wellness projects.",
      },
    ],
  },
  band: { title: "Stay longer and Save more", primaryCta: { label: "Join us", href: "/api/auth/login" } },
  faq: sharedFaq,
};

// Shared cards used by the reusable stay campaign template.
const juneSpaces: MonthPage["space"]["spaces"] = [
  { size: "large", category: "Coworking space", title: "Hot desks", access: "Members only" },
  { size: "medium", category: "Coliving space", title: "Cabins", access: "Members only" },
  { size: "small", category: "Health", title: "Gyms", access: "Members only" },
];

export const stayCampaignTemplateFixture: MonthPage = {
  slug: "stay-campaign-template",
  city: "barcelona",
  seo: {
    title: "Stay at Circles House",
    description: "Explore rooms, spaces and community events for a Circles House stay.",
  },
  hero: {
    eyebrow: "Stay @ Circles House",
    title: "Say yes to a Month of New Experiences",
    body: "Make space for deep work, new ideas and the moments in between that keep you balanced and connected.",
    cta: { label: "Reserve Now", href: "#rooms" },
  },
  form: {
    eyebrow: "Join us",
    title: "Start your stay here",
    subtitle: "Please complete the form to apply for your free week.",
  },
  space: {
    eyebrow: "The space",
    title: "Modern private lofts and shared rooftop spaces to live, work & play.",
    spaces: juneSpaces,
  },
  rooms: {
    eyebrow: "Why join",
    title: "A room for your needs",
    text: "Our house offers a range of thoughtfully designed rooms to suit various lifestyles, combining luxury and functionality. Whether you’re looking for a monthly stay or a flexible option, we’ve got you covered.",
  },
  band: { title: "Stay longer and Save more", primaryCta: { label: "Join us", href: "/api/auth/login" } },
  events: { eyebrow: "Why join", title: "What you will say Yes to" },
  faq: sharedFaq,
};

const coworkingIncludes = ["Coworking", "Social club", "Gym and Shower", "Meeting Rooms", "Booths", "Bar and free coffee", "Gardens", "Rooftop"];

// Shared by the Barcelona coworking page and Life @ Circles.
const barcelonaCoworkingSpaces: CoworkingPage["spaces"] = {
  eyebrow: "Coworking spaces",
  // Figma only exposes the Hot desks copy. The remaining descriptions are provisional and the photos are pending.
  items: [
    {
      title: "Hot desks",
      text: "Our hot desks are situated in a vibrant co-working space, just a short stroll from public transport. They offer a flexible and convenient option for those looking to work in a dynamic environment.",
      images: [],
    },
    { title: "Cabins", text: "Private cabins for focused calls and individual work within the shared coworking space.", images: [] },
    { title: "Gyms", text: "A gym and shower area available alongside the coworking facilities.", images: [] },
    { title: "Booths", text: "Enclosed booths for calls, online meetings and focused conversations.", images: [] },
  ],
  amenities: [
    { icon: "wifi", label: "High speed Wi-fi" },
    { icon: "booths", label: "Booths" },
    { icon: "meeting", label: "Meeting room" },
    { icon: "printing", label: "Printing area" },
    { icon: "gym", label: "Gym and shower" },
    { icon: "events", label: "Event room" },
    { icon: "rooftop", label: "360º Rooftop" },
  ],
  // "Book" appears once it has a destination.
};

export const coworkingPagesFixture: CoworkingPage[] = [
  {
    city: "barcelona",
    seo: {
      title: "Coworking in Barcelona · Circles House",
      description: "Hot desks, cabins, gyms and booths surrounded by nature, with day, 10-day and monthly passes.",
    },
    hero: {
      eyebrow: "Coworking @ Circles Barcelona",
      title: "Work Surrounded by Nature",
      subtitle: "See What Makes our Inspiring Coworking Spaces Perfect for Entrepreneurs and Innovators",
    },
    spaces: barcelonaCoworkingSpaces,
    pricing: {
      eyebrow: "Why join",
      title: "Coworking Pricing Options",
      includesLabel: "Includes access to:",
      // "Contact" and "Apply Now" appear once they have destinations.
      plans: [
        { title: "Day pass", subtitle: "Use it in a period of 30 days", includes: coworkingIncludes, price: "15€ +VAT" },
        { title: "10 days pass", subtitle: "Use it in a period of 30 days", includes: coworkingIncludes, price: "120€ +VAT" },
        { title: "Monthly pass", subtitle: "30 days access", includes: coworkingIncludes, price: "150€ +VAT", highlighted: true },
        { title: "Monthly pass", subtitle: "+ FIXED DESK", includes: coworkingIncludes, price: "180€ +VAT" },
      ],
    },
    band: {
      title: "Stay longer and Save more",
      secondaryCta: { label: "Book a Stay", href: "/rooms" },
      primaryCta: { label: "Join us", href: "/memberships" },
    },
    faq: sharedFaq,
  },
];

export const lifePageFixture: LifePage = {
  seo: {
    title: "Life @ Circles · Circles House",
    description: "A community where people grow, connect, and feel at home.",
  },
  intro: {
    eyebrow: "Life @ Circles",
    title: "A community where people grow, connect, and feel at home.",
    body: "Our digital community is where ambitious entrepreneurs come together with seamless opportunities to engage, share ideas, spark connections, and turn visions into reality.",
  },
  // Illustrations and photos are pending.
  highlights: [
    { stat: { value: "7.3", label: "Weeks Average Stay Duration" }, photo: { title: "Instant Community" } },
    { stat: { value: "312+", label: "Collaborative Projects Initiated" }, photo: { title: "Focused Channels" } },
    { stat: { value: "68%", label: "Members Engaged in Wellness Activities" }, photo: { title: "Collaboration" } },
  ],
  spaces: barcelonaCoworkingSpaces,
  // Desktop Figma (v1.14); mobile shows "Stay longer and Save more" with "Join us".
  band: {
    title: "Become a Member",
    secondaryCta: { label: "Book a Stay", href: "/rooms" },
    primaryCta: { label: "Become a member", href: "/memberships" },
  },
  faq: sharedFaq,
};

// Figma "Location - Barcelona" words two questions slightly differently from the shared FAQ.
const locationFaq: FaqSection = {
  ...sharedFaq,
  items: sharedFaq.items.map((item, index) =>
    index === 0 ? { ...item, question: "How do I get to Circle’s house?" } : index === 3 ? { ...item, question: "What’s included during my stay?" } : item,
  ),
};

export const locationPagesFixture: LocationPage[] = [
  {
    slug: "barcelona",
    seo: {
      title: "Circles House Barcelona",
      description: "Modern private lofts and shared rooftop spaces to live, work & play, a short walk from the metro in Vallvidrera.",
    },
    hero: {
      eyebrow: "Location",
      title: "Circles House Barcelona",
      image: "/images/locations/barcelona/house-exterior.png",
      // "See all Photos" appears once the gallery has photos.
      card: {
        eyebrow: "The space",
        title: "Your new home in Barcelona’s natural park.",
        text: "Located in a natural park and only a 5 minute walk from a metro station, our house in Vallvidrera is well-located and allows you to get anywhere quickly and easily.",
        cta: { label: "Book", href: "#rooms" },
        amenities: ["coliving", "coworking"],
        access: "Members only",
      },
    },
    space: {
      title: "Modern private lofts and shared rooftop spaces to live, work & play.",
      text: "Circles House is a thriving community of entrepreneurs, digital nomads, and innovators. To ensure everyone is a good fit and adds value to our unique ecosystem, we’ve designed a simple and quick application process.",
      amenitiesLabel: "Property amenities",
      amenities: [
        "A/C in rooms",
        "Towels",
        "Room door locks",
        "High-speed Wi-Fi",
        "Community kitchen",
        "Coworking",
        "360º rooftop",
        "Gym and shower",
      ],
    },
    rooms: {
      eyebrow: "Rooms",
      title: "A room for your needs",
      text: "Our house offers a range of thoughtfully designed rooms to suit various lifestyles, combining luxury and functionality. Whether you’re looking for a monthly stay or a flexible option, we’ve got you covered.",
      source: { mode: "automatic", key: "location.rooms" },
    },
    band: { title: "Stay longer and Save more", primaryCta: { label: "Join us", href: "/memberships" } },
    experiences: {
      eyebrow: "Experience",
      title: "Travel slowly in Barcelona",
      subtitle: "Take your time, get to know the city",
      // Photos are pending.
      items: [
        { title: "Explore Barcelona", text: "Move easily between the city centre, the coast and the hills from Vallvidrera" },
        { title: "Swim at Barceloneta", text: "Take the metro into the city and spend the day beside the Mediterranean", wide: true },
      ],
    },
    location: {
      eyebrow: "Location",
      title: "In the hills above Barcelona",
      text: "Located in a natural park and only a 5 minute walk from a metro station, our house in Vallvidrera is well-located and allows you to get anywhere quickly and easily. Whether you want to go to the heart of Placa Catalunya, Barceloneta beach, or the mountains, the proximity of our house to the metro means all of this is possible.",
      address: "Camí de Vallvidrera al Tibidabo, 5, 08017 Barcelona, Spain",
      mapHref: "https://www.google.com/maps/search/?api=1&query=Cam%C3%AD%20de%20Vallvidrera%20al%20Tibidabo%2C%205%2C%2008017%20Barcelona",
    },
    manager: {
      eyebrow: "Meet your House Manager",
      title: "Hi, I'm Teagan, community manager.",
      paragraphs: [
        "I’ll make sure you will enjoy your time in Circles House—whether that’s joining our events, discovering the best work spots, or connecting with like-minded members who make this place special.",
        "Connect with fellow members who share your passions and interests, you’ll find that this community is what makes Circles House a truly special place to be.",
      ],
    },
    faq: locationFaq,
  },
];

export const locationSpacesFixture: LocationSpacePage[] = [
  {
    slug: "barcelona-rooftop",
    routeSlug: "rooftop",
    location: { slug: "barcelona", name: "Circles House Barcelona" },
    category: "Events",
    title: "Rooftop",
    description: "Cinema, dinners and ideas above the city.",
    access: "Members only",
    status: "active",
    href: "/locations/barcelona/spaces/rooftop",
    seo: { title: "Rooftop · Circles House Barcelona", description: "Cinema, dinners and ideas above Barcelona." },
    gallery: [],
    amenities: ["360° Rooftop"],
  },
  {
    slug: "andorra-restaurant",
    routeSlug: "restaurant",
    location: { slug: "andorra", name: "Circles House Andorra" },
    category: "Culinary experience",
    title: "Restaurant Andorra",
    description: "Local produce, biodynamic methods and a table built for conversation.",
    access: "Public",
    status: "comingSoon",
    href: "/locations/andorra/spaces/restaurant",
    seo: { title: "Restaurant · Circles House Andorra", description: "A culinary experience built around local produce and shared tables." },
    gallery: [],
    amenities: [],
  },
  {
    slug: "andorra-spa",
    routeSlug: "spa",
    location: { slug: "andorra", name: "Circles House Andorra" },
    category: "Wellness",
    title: "Spa Andorra",
    description: "Thermal circuits, breathwork and cold exposure designed to restore energy and clarity.",
    access: "Coming soon",
    status: "comingSoon",
    href: "/locations/andorra/spaces/spa",
    seo: { title: "Spa · Circles House Andorra", description: "A restorative wellness space at Circles House Andorra." },
    gallery: [],
    amenities: [],
  },
];

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

const augustEvening = {
  month: "Aug",
  day: 18,
  dateLabel: "Monday, August 18",
  timeLabel: "9:00 PM - 11:30 PM GMT+2",
  startsAt: "2027-08-18T19:00:00.000Z",
  endsAt: "2027-08-18T21:30:00.000Z",
  monthKey: "2027-08",
  locationName: "Circles House Barcelona",
};

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

const foundersMonthEventsFixture: EventSummary[] = [
  {
    slug: "movie-night-2027-06",
    city: "barcelona",
    title: "Movie Night",
    subtitle: "Rooftop cinema, snacks and good company",
    month: "Jun",
    day: 4,
    dateLabel: "Friday, June 4",
    timeLabel: "8:00 PM - 11:00 PM GMT+2",
    startsAt: "2027-06-04T18:00:00.000Z",
    endsAt: "2027-06-04T21:00:00.000Z",
    monthKey: "2027-06",
    locationName: "Circles House Barcelona",
    program: { slug: "founders-month", name: "Founders Month" },
  },
  {
    slug: "hiit-workout-2027-06",
    city: "barcelona",
    title: "HIIT Workout",
    subtitle: "A high-energy community training session",
    month: "Jun",
    day: 7,
    dateLabel: "Monday, June 7",
    timeLabel: "9:00 AM - 10:00 AM GMT+2",
    startsAt: "2027-06-07T07:00:00.000Z",
    endsAt: "2027-06-07T08:00:00.000Z",
    monthKey: "2027-06",
    locationName: "Circles House Barcelona",
    program: { slug: "founders-month", name: "Founders Month" },
  },
  {
    slug: "spanish-conversation-club-2027-06",
    city: "barcelona",
    title: "Spanish Conversation Club",
    subtitle: "Practice Spanish with an international community",
    month: "Jun",
    day: 10,
    dateLabel: "Thursday, June 10",
    timeLabel: "7:00 PM - 8:30 PM GMT+2",
    startsAt: "2027-06-10T17:00:00.000Z",
    endsAt: "2027-06-10T18:30:00.000Z",
    monthKey: "2027-06",
    locationName: "Circles House Barcelona",
    program: { slug: "founders-month", name: "Founders Month" },
  },
];

export const programPagesFixture: ProgramPage[] = [
  {
    slug: "founders-month",
    name: "Founders Month",
    theme: "Build with community",
    locations: [{ slug: "barcelona", name: "Circles House Barcelona" }],
    locationScope: "selected",
    startsOn: "2027-06-01",
    endsOn: "2027-06-30",
    registrationEnabled: true,
    seo: {
      title: "Founders Month · Circles House Barcelona",
      description: "Explore the events connected to Founders Month at Circles House Barcelona.",
    },
    events: foundersMonthEventsFixture,
  },
];

export const programsFixture: ProgramSummary[] = programPagesFixture.map((program) => ({
  slug: program.slug,
  name: program.name,
  locations: program.locations,
  locationScope: program.locationScope,
}));

export const stayCampaignsFixture: StayCampaign[] = [
  {
    campaignKey: "barcelona-2027-06",
    name: "June at Circles House Barcelona",
    period: "2027-06",
    legacyRouteParam: "june",
    location: { slug: "barcelona", name: "Circles House Barcelona" },
    page: {
      ...stayCampaignTemplateFixture,
      slug: "june",
      seo: {
        title: "June at Circles House Barcelona · Circles House",
        description: "Explore rooms, spaces and community events for June at Circles House Barcelona.",
      },
      hero: { ...stayCampaignTemplateFixture.hero, eyebrow: "June at Circles House Barcelona" },
    },
  },
];

const barcelonaHouseAmenities = ["Community kitchen", "Coworking", "High-speed Wi-Fi", "360º Rooftop", "Gym and shower"];
const standardRoomFeatures = ["20m2", "Bathroom", "Terrace", "Desk", "360º View", "Couple friendly"];
const standardRoomAmenities = ["Air conditioning", "Desk", "Wardrobe / storage"];
const commonRoom = {
  locationId: "barcelona",
  locationName: "Circles House Barcelona",
  bookingUrl: "https://hotels.cloudbeds.com/",
  houseLabel: "Barcelona House",
  price: { label: "Starting from", value: "€1.900/month" },
  locationAmenities: barcelonaHouseAmenities,
} satisfies Partial<Room>;

// Canonical Figma room categories. Photos, exact Cloudbeds URLs and ambiguous card attributes remain editorially reviewable in Wix.
export const roomsFixture: Room[] = [
  {
    ...commonRoom,
    id: "king-studio-terrace-sea-view",
    discoverable: true,
    href: "/locations/barcelona/rooms/king-studio-terrace-sea-view",
    name: "King Studio + Terrace",
    occupancyType: "private",
    description: "Private studio with an ensuite bathroom and terrace, featuring a desk, wardrobe and air conditioning.",
    features: standardRoomFeatures,
    amenities: [...standardRoomAmenities, "Terrace"],
    views: "Mountain View + Sea View",
  },
  {
    ...commonRoom,
    id: "king-studio-terrace-city-view",
    name: "King Studio + Terrace",
    occupancyType: "private",
    description: "Private studio with an ensuite bathroom and terrace, featuring a desk, wardrobe and air conditioning.",
    features: standardRoomFeatures,
    amenities: [...standardRoomAmenities, "Terrace"],
    views: "Mountain View + City View",
  },
  {
    ...commonRoom,
    id: "king-studio",
    name: "King Studio",
    occupancyType: "private",
    description: "Private studio with an ensuite bathroom, featuring a desk, wardrobe and air conditioning.",
    features: standardRoomFeatures,
    amenities: standardRoomAmenities,
    views: "Mountain View",
  },
  {
    ...commonRoom,
    id: "queen-suite",
    name: "Queen Suite",
    occupancyType: "private",
    description: "Private suite with an ensuite bathroom, featuring a desk, wardrobe and air conditioning.",
    features: standardRoomFeatures,
    amenities: standardRoomAmenities,
    views: "Sea View + City View",
  },
  {
    ...commonRoom,
    id: "queen-room",
    name: "Queen Room",
    occupancyType: "private",
    description: "Private room with access to a shared bathroom, featuring a desk, wardrobe and air conditioning.",
    features: ["20m2", "Shared Bathroom", "Terrace", "Desk", "360º View", "Couple friendly"],
    amenities: standardRoomAmenities,
    views: "Mountain View",
  },
  {
    ...commonRoom,
    id: "4-bed-shared-suite",
    name: "4 Bed Shared Suite",
    occupancyType: "shared",
    description: "Shared suite with four beds, bathroom access, dedicated storage and air conditioning.",
    features: standardRoomFeatures,
    amenities: standardRoomAmenities,
    views: "Sea View + City View",
  },
  {
    ...commonRoom,
    id: "6-bed-shared-suite",
    name: "6 Bed Shared Suite",
    occupancyType: "shared",
    description: "Shared suite with six beds, bathroom access, dedicated storage and air conditioning.",
    features: standardRoomFeatures,
    amenities: standardRoomAmenities,
    views: "Sea View + City View",
  },
];
