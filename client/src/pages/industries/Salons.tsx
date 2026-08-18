import IndustryLanding, { IndustryConfig, TechFeature } from "@/components/IndustryLanding";
import { Bot, Clock, CalendarDays, CreditCard, MessageSquare, BarChart3, Users, TrendingUp } from "lucide-react";

const salonFeatures: TechFeature[] = [
  {
    icon: Bot,
    category: "AI & Automation",
    title: "AI Booking Assistant",
    description:
      "A 24/7 AI assistant handles appointment requests, service questions, and stylist availability — so you never miss a booking, even after hours.",
    bullets: [
      "Books appointments automatically 24/7",
      "Answers service & pricing questions",
      "Recommends services based on client needs",
      "Handles cancellations & rescheduling",
      "Remembers returning clients' preferences",
    ],
    badge: "Most Popular",
  },
  {
    icon: Clock,
    category: "Business Automation",
    title: "Live Hours & Availability Display",
    description:
      "Show real-time open/closed status, next available appointment, and stylist availability — so clients can book the moment they're ready.",
    bullets: [
      "Live \"Open Now\" / \"Closed\" badge",
      "Next available appointment display",
      "Individual stylist availability",
      "Holiday & special hours support",
      "Reduces phone interruptions by 70%",
    ],
  },
  {
    icon: CalendarDays,
    category: "Scheduling",
    title: "Smart Appointment Scheduling",
    description:
      "Real-time booking with stylist selection, service duration management, and automated reminders that slash no-shows.",
    bullets: [
      "Real-time stylist availability",
      "Service duration & buffer time management",
      "Automated SMS & email reminders",
      "Waitlist for popular stylists",
      "Recurring appointment booking",
    ],
  },
  {
    icon: CreditCard,
    category: "Payments",
    title: "Online Deposits & Payments",
    description:
      "Collect deposits at booking to eliminate no-shows, and accept full payment online — reducing cash handling and awkward checkout moments.",
    bullets: [
      "Booking deposits to reduce no-shows",
      "Full online payment at checkout",
      "Gift card sales & redemption",
      "Membership & package billing",
      "Tip processing & split payments",
    ],
  },
  {
    icon: MessageSquare,
    category: "Client Retention",
    title: "Automated Client Follow-Ups",
    description:
      "Re-booking reminders, birthday offers, and lapsed client win-back campaigns that keep your chair full without any manual outreach.",
    bullets: [
      "Re-booking reminder at 4/6/8 weeks",
      "Birthday discount automation",
      "Lapsed client win-back campaigns",
      "Post-visit review requests",
      "Seasonal promotion blasts",
    ],
  },
  {
    icon: BarChart3,
    category: "Analytics",
    title: "Salon Performance Dashboard",
    description:
      "Track revenue per stylist, average ticket size, rebooking rate, and product sales — all in one dashboard.",
    bullets: [
      "Revenue per stylist tracking",
      "Average ticket & service mix",
      "Rebooking rate by stylist",
      "Product retail sales tracking",
      "Client retention & churn rates",
    ],
  },
  {
    icon: Users,
    category: "Client Experience",
    title: "Client Portal & Loyalty Program",
    description:
      "Give clients a branded portal to manage appointments, view service history, and earn loyalty rewards — building long-term relationships.",
    bullets: [
      "Appointment history & rebooking",
      "Loyalty points & rewards",
      "Service notes & preferences saved",
      "Photo gallery of past styles",
      "Mobile-optimized experience",
    ],
  },
  {
    icon: TrendingUp,
    category: "Growth",
    title: "Review & Referral Automation",
    description:
      "Automatically request Google reviews after every visit and incentivize referrals — turning happy clients into your best marketing channel.",
    bullets: [
      "Automated Google review requests",
      "Referral program with rewards",
      "Social media share prompts",
      "Before/after photo showcase",
      "Influencer & VIP client tracking",
    ],
  },
];

const config: IndustryConfig = {
  slug: "salons",
  name: "Salons & Spas",
  tagline: "Keep your chairs full and clients coming back",
  heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/salon-hero_b603fce2.jpg",
  galleryImages: [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/salon-hero_b603fce2.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/salon-client_bb907373.jpg",
  ],
  splitImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/salon-client_bb907373.jpg",
  heroHeadline: "A Salon Website That ||Books Itself|| While You Focus on Your Clients",
  heroSubheadline:
    "We build AI-powered websites for salons and spas that book appointments 24/7, reduce no-shows with deposits, and automatically bring clients back — without you lifting a finger.",
  accentColor: "oklch(0.55 0.15 320)",
  painPoints: [
    {
      icon: "—",
      title: "Constant Phone Interruptions",
      desc: "You're in the middle of a color treatment and your phone won't stop ringing with booking requests. It's costing you focus and clients.",
    },
    {
      icon: "—",
      title: "No-Shows Killing Your Revenue",
      desc: "Last-minute cancellations and no-shows leave empty chairs and lost income with no way to fill them quickly.",
    },
    {
      icon: "—",
      title: "Clients Don't Rebook",
      desc: "You do amazing work but clients forget to rebook. Without a follow-up system, you're constantly chasing new clients instead of retaining existing ones.",
    },
    {
      icon: "—",
      title: "Your Work Isn't Showcased",
      desc: "Your Instagram is full of stunning work but your website doesn't reflect it. Potential clients can't see why they should choose you.",
    },
    {
      icon: "—",
      title: "Awkward Payment Moments",
      desc: "Handling payment at the chair is uncomfortable for everyone. Online payments and deposits make the experience seamless.",
    },
    {
      icon: "—",
      title: "No Idea Who Your Best Clients Are",
      desc: "You don't know which stylists generate the most revenue, which services have the best margins, or which clients are at risk of churning.",
    },
  ],
  techFeatures: salonFeatures,
  results: [
    { stat: "70%", label: "Fewer phone interruptions" },
    { stat: "72hrs", label: "Site live after kickoff" },
    { stat: "60%", label: "Reduction in no-shows" },
    { stat: "2×", label: "More rebookings" },
  ],
  testimonial: {
    quote:
      "My chair is fully booked 3 weeks out now. The automated rebooking reminders alone added $2,400 to my monthly revenue.",
    name: "Jessica Rivera",
    business: "Studio Luxe Salon",
  },
  ctaHeadline: "Ready to Keep Your Chairs Full on Autopilot?",
  ctaSubtext:
    "Schedule a free 30-minute strategy call. We'll show you exactly how many appointments you're losing and how to fix it.",
};

export default function SalonsPage() {
  return <IndustryLanding config={config} />;
}
