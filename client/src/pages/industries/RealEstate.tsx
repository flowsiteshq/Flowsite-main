import IndustryLanding, { IndustryConfig, TechFeature } from "@/components/IndustryLanding";
import { Bot, Clock, CalendarDays, CreditCard, MessageSquare, BarChart3, Users, TrendingUp } from "lucide-react";

const realEstateFeatures: TechFeature[] = [
  {
    icon: Bot,
    category: "AI & Automation",
    title: "AI Lead Qualification Chatbot",
    description:
      "A 24/7 AI assistant qualifies leads, answers property questions, schedules showings, and sends listing links — so you only spend time on serious buyers and sellers.",
    bullets: [
      "Qualifies buyer & seller leads 24/7",
      "Answers property & neighborhood questions",
      "Schedules showings automatically",
      "Sends listing links & virtual tours",
      "Scores leads: hot / warm / cold",
    ],
    badge: "Most Popular",
  },
  {
    icon: Clock,
    category: "Business Automation",
    title: "Live Listing & Availability Updates",
    description:
      "Your website automatically shows current listing status, open house schedules, and price changes — keeping buyers informed without manual updates.",
    bullets: [
      "Real-time listing status (Active/Pending/Sold)",
      "Open house schedule display",
      "Price reduction alerts",
      "New listing notifications for saved searches",
      "Market update automation",
    ],
  },
  {
    icon: CalendarDays,
    category: "Scheduling",
    title: "Showing & Consultation Scheduling",
    description:
      "Buyers and sellers can book showings and consultations directly on your website — with automated confirmations and reminders that eliminate no-shows.",
    bullets: [
      "Online showing scheduling",
      "Buyer & seller consultation booking",
      "Automated confirmation & reminder texts",
      "Virtual tour scheduling",
      "Open house RSVP management",
    ],
  },
  {
    icon: CreditCard,
    category: "Transactions",
    title: "Online Document & Payment Processing",
    description:
      "Digital offers, e-signatures, earnest money collection, and transaction management — streamlining the entire deal process from your website.",
    bullets: [
      "Digital offer submission",
      "E-signature for documents",
      "Earnest money collection",
      "Transaction milestone tracking",
      "Commission invoice automation",
    ],
  },
  {
    icon: MessageSquare,
    category: "Lead Nurturing",
    title: "Automated Buyer & Seller Drip Campaigns",
    description:
      "Long-term nurture sequences for buyers not ready to act yet, and seller campaigns that keep your name top of mind until they're ready to list.",
    bullets: [
      "Buyer drip: new listings matching criteria",
      "Seller drip: market update reports",
      "Past client anniversary check-ins",
      "Referral request automation",
      "Neighborhood market report emails",
    ],
  },
  {
    icon: BarChart3,
    category: "Analytics",
    title: "Lead & Pipeline Analytics",
    description:
      "Track where your leads come from, which listings get the most views, your conversion rate from inquiry to close, and your average days to close.",
    bullets: [
      "Lead source attribution",
      "Listing view & inquiry tracking",
      "Pipeline conversion rates",
      "Average days to close",
      "Revenue per lead source",
    ],
  },
  {
    icon: Users,
    category: "Client Experience",
    title: "Buyer & Seller Portal",
    description:
      "Give clients a branded portal to track their transaction progress, view documents, communicate with you, and access market reports.",
    bullets: [
      "Transaction milestone tracker",
      "Document storage & signing",
      "Direct messaging with agent",
      "Saved searches & favorites",
      "Market report access",
    ],
  },
  {
    icon: TrendingUp,
    category: "Growth",
    title: "Review & Referral Automation",
    description:
      "Automatically request Zillow and Google reviews after closing, and build a referral engine that turns past clients into your best lead source.",
    bullets: [
      "Automated post-close review requests",
      "Zillow & Google review management",
      "Referral program with tracking",
      "Testimonial collection & display",
      "Past client re-engagement campaigns",
    ],
  },
];

const config: IndustryConfig = {
  slug: "real-estate",
  name: "Real Estate",
  tagline: "More listings, more closings, less manual work",
  heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/realestate-hero_3071c9ca.jpg",
  galleryImages: [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/realestate-hero_3071c9ca.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/realestate-listing_02ebdebd.jpg",
  ],
  splitImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/realestate-listing_02ebdebd.jpg",
  heroHeadline: "A Real Estate Website That ||Closes Deals|| While You're at the Table",
  heroSubheadline:
    "We build AI-powered websites for real estate agents and brokerages that qualify leads, schedule showings, and nurture buyers and sellers automatically — so you focus on closing.",
  accentColor: "oklch(0.50 0.16 240)",
  painPoints: [
    {
      icon: "—",
      title: "Leads Go Cold While You're Busy",
      desc: "You're showing a property and a new lead fills out your contact form. By the time you follow up, they've already called another agent.",
    },
    {
      icon: "—",
      title: "Spending Hours Qualifying Leads",
      desc: "Most of your inquiries are tire-kickers. You're spending valuable time on people who aren't ready to buy or sell for 18 months.",
    },
    {
      icon: "—",
      title: "Past Clients Forget About You",
      desc: "You closed a deal 2 years ago and that client just listed with someone else. No follow-up system = no referrals.",
    },
    {
      icon: "—",
      title: "Invisible in Local Search",
      desc: "When someone searches 'real estate agent in [city]', you're not showing up. Zillow and Realtor.com are eating your leads.",
    },
    {
      icon: "—",
      title: "Showing Scheduling Chaos",
      desc: "Coordinating showings by text and phone is a full-time job. Buyers want to book instantly — not wait for you to respond.",
    },
    {
      icon: "—",
      title: "No Visibility Into Your Pipeline",
      desc: "You don't know which lead sources are most profitable, which listings get the most interest, or where deals are stalling.",
    },
  ],
  techFeatures: realEstateFeatures,
  results: [
    { stat: "5min", label: "Lead response time (AI)" },
    { stat: "72hrs", label: "Site live after kickoff" },
    { stat: "4×", label: "More qualified showings" },
    { stat: "2hrs", label: "Admin time saved daily" },
  ],
  testimonial: {
    quote:
      "The AI chatbot qualifies every lead before I even see them. My conversion rate went from 8% to 31% because I'm only talking to serious buyers now.",
    name: "Marcus Thompson",
    business: "Thompson Realty Group",
  },
  ctaHeadline: "Ready to Build a Real Estate Business That Runs on Autopilot?",
  ctaSubtext:
    "Schedule a free 30-minute strategy call. We'll audit your current online presence and show you exactly how many leads you're losing — and how to capture them.",
};

export default function RealEstatePage() {
  return <IndustryLanding config={config} />;
}
