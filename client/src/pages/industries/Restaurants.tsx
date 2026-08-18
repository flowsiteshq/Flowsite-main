import IndustryLanding, { CORE_TECH_FEATURES, IndustryConfig, TechFeature } from "@/components/IndustryLanding";
import { Bot, Clock, CalendarDays, CreditCard, MessageSquare, BarChart3, Users, TrendingUp } from "lucide-react";

const restaurantFeatures: TechFeature[] = [
  {
    icon: Bot,
    category: "AI & Automation",
    title: "AI Reservation & Order Chatbot",
    description:
      "A 24/7 AI assistant on your website takes reservations, answers menu questions, handles special requests, and upsells — while your staff focuses on the dining experience.",
    bullets: [
      "Takes reservations automatically",
      "Answers menu & allergy questions instantly",
      "Handles special event & private dining inquiries",
      "Upsells specials and add-ons",
      "Integrates with OpenTable & Resy",
    ],
    badge: "Most Popular",
  },
  {
    icon: Clock,
    category: "Business Automation",
    title: "Live Hours & Kitchen Status",
    description:
      "Show real-time open/closed status, today's specials, wait times, and holiday hours — automatically updated so customers always know what to expect.",
    bullets: [
      "Live \"Open Now\" / \"Closed\" badge",
      "Today's specials auto-display",
      "Estimated wait time display",
      "Holiday & special hours support",
      "Reduces \"are you open?\" calls by 80%",
    ],
  },
  {
    icon: CalendarDays,
    category: "Reservations",
    title: "Smart Reservation System",
    description:
      "Real-time table availability, party size management, and automated confirmation texts — no more phone tag for reservations.",
    bullets: [
      "Real-time table availability",
      "Party size & seating preferences",
      "Automated SMS & email confirmations",
      "Waitlist management with auto-notify",
      "Private event & buyout booking",
    ],
  },
  {
    icon: CreditCard,
    category: "Online Ordering",
    title: "Direct Online Ordering & Payments",
    description:
      "Skip the 30% third-party app fees. Take online orders directly through your website with Stripe — keeping more money in your pocket.",
    bullets: [
      "Direct online ordering (no 3rd-party fees)",
      "Pickup & delivery scheduling",
      "Stripe payments & tips",
      "Loyalty points & repeat customer rewards",
      "Catering & bulk order forms",
    ],
  },
  {
    icon: MessageSquare,
    category: "Marketing Automation",
    title: "SMS & Email Campaigns",
    description:
      "Automated birthday offers, weekly specials, and re-engagement campaigns that bring customers back without any manual work.",
    bullets: [
      "Birthday & anniversary special offers",
      "Weekly specials SMS blasts",
      "Lapsed customer re-engagement",
      "Event & holiday promotion campaigns",
      "Google review request automation",
    ],
  },
  {
    icon: BarChart3,
    category: "Analytics",
    title: "Revenue & Guest Analytics",
    description:
      "Know your busiest hours, most popular dishes, average check size, and which marketing campaigns drive the most covers.",
    bullets: [
      "Cover count & revenue by day/hour",
      "Most ordered items tracking",
      "Average check size trends",
      "Campaign attribution (which promo drove covers)",
      "Google & Yelp review monitoring",
    ],
  },
  {
    icon: Users,
    category: "Guest Experience",
    title: "Guest Portal & Loyalty Program",
    description:
      "Give your regulars a branded loyalty experience — points, rewards, order history, and exclusive offers that keep them coming back.",
    bullets: [
      "Loyalty points & rewards system",
      "Order history & reorder shortcuts",
      "Exclusive member-only offers",
      "Birthday & milestone perks",
      "Mobile-optimized experience",
    ],
  },
  {
    icon: TrendingUp,
    category: "Business Intelligence",
    title: "Restaurant Performance Dashboard",
    description:
      "A real-time dashboard showing revenue, table turnover, no-show rates, and marketing ROI — so you always know the health of your restaurant.",
    bullets: [
      "Daily/weekly/monthly revenue tracking",
      "Table turnover & utilization rates",
      "No-show & cancellation tracking",
      "Staff performance metrics",
      "Competitor review monitoring",
    ],
  },
];

const config: IndustryConfig = {
  slug: "restaurants",
  name: "Restaurants & Cafés",
  tagline: "Fill every table, every night",
  heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/rest-hero_b921c723.jpg",
  galleryImages: [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/rest-hero_b921c723.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/rest-food_fc820d29.jpg",
  ],
  splitImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/rest-food_fc820d29.jpg",
  heroHeadline: "A Restaurant Website That ||Fills Tables|| — Not Just Looks Pretty",
  heroSubheadline:
    "We build AI-powered restaurant websites with online ordering, smart reservations, and automated marketing that brings customers back — without paying 30% to third-party apps.",
  accentColor: "oklch(0.58 0.18 55)",
  painPoints: [
    {
      icon: "—",
      title: "Losing 30% to DoorDash & UberEats",
      desc: "Third-party apps take a massive cut of every order. Your website should be your most profitable sales channel.",
    },
    {
      icon: "—",
      title: "Phone Ringing Off the Hook",
      desc: "Your staff is answering the same questions all day — 'are you open?', 'do you have gluten-free?', 'can I make a reservation?' — instead of serving guests.",
    },
    {
      icon: "—",
      title: "Customers Don't Come Back",
      desc: "You have no system to bring first-time diners back. No loyalty program, no follow-up, no reason to choose you over the place next door.",
    },
    {
      icon: "—",
      title: "Reservation Chaos",
      desc: "Managing reservations by phone and paper means double-bookings, no-shows, and frustrated guests.",
    },
    {
      icon: "—",
      title: "Outdated or Generic Website",
      desc: "Your website doesn't reflect the quality of your food. Customers judge you before they ever walk in the door.",
    },
    {
      icon: "—",
      title: "No Visibility Into What's Working",
      desc: "You don't know which nights are most profitable, which menu items drive revenue, or which marketing efforts actually bring people in.",
    },
  ],
  techFeatures: restaurantFeatures,
  results: [
    { stat: "30%", label: "More in your pocket (no app fees)" },
    { stat: "72hrs", label: "Site live after kickoff" },
    { stat: "3×", label: "More repeat customers" },
    { stat: "80%", label: "Fewer \"are you open?\" calls" },
  ],
  testimonial: {
    quote:
      "We cut our DoorDash dependency in half in the first month. The online ordering system paid for itself in 3 weeks.",
    name: "Maria Chen",
    business: "Café Soleil",
  },
  ctaHeadline: "Ready to Fill Every Table and Keep More of Your Revenue?",
  ctaSubtext:
    "Schedule a free 30-minute strategy call. We'll audit your current online presence and show you exactly how much revenue you're leaving on the table.",
};

export default function RestaurantsPage() {
  return <IndustryLanding config={config} />;
}
