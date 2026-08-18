import IndustryLanding, { IndustryConfig, TechFeature } from "@/components/IndustryLanding";
import { Bot, Clock, CalendarDays, CreditCard, MessageSquare, BarChart3, Users, TrendingUp } from "lucide-react";

const insuranceFeatures: TechFeature[] = [
  {
    icon: Bot,
    category: "AI & Automation",
    title: "AI Lead Qualification & Quote Assistant",
    description:
      "A 24/7 AI assistant collects prospect information, answers coverage questions, and schedules consultations — delivering pre-qualified leads directly to your calendar.",
    bullets: [
      "Collects prospect info & coverage needs",
      "Answers common coverage questions",
      "Schedules consultations automatically",
      "Scores leads: hot / warm / cold",
      "Sends quote request follow-ups",
    ],
    badge: "Most Popular",
  },
  {
    icon: Clock,
    category: "Business Automation",
    title: "Live Office Hours & Response Time",
    description:
      "Show real-time availability, expected response times, and after-hours options — building trust and reducing the anxiety of \"will anyone call me back?\"",
    bullets: [
      "Live \"Available Now\" / \"After Hours\" badge",
      "Expected response time display",
      "After-hours AI coverage",
      "Holiday & special hours support",
      "Reduces \"are you available?\" calls",
    ],
  },
  {
    icon: CalendarDays,
    category: "Scheduling",
    title: "Consultation & Review Scheduling",
    description:
      "Prospects and existing clients can book consultations, annual reviews, and claims consultations directly online — with automated reminders.",
    bullets: [
      "New prospect consultation booking",
      "Annual policy review scheduling",
      "Claims consultation booking",
      "Automated SMS & email reminders",
      "Virtual & in-person options",
    ],
  },
  {
    icon: CreditCard,
    category: "Payments",
    title: "Online Premium Payments & Billing",
    description:
      "Accept premium payments, set up autopay, and send renewal reminders — reducing lapses and the administrative burden of manual billing.",
    bullets: [
      "Online premium payment portal",
      "Autopay setup & management",
      "Renewal reminder automation",
      "Lapse prevention alerts",
      "Payment plan options",
    ],
  },
  {
    icon: MessageSquare,
    category: "Client Retention",
    title: "Policy Review & Renewal Campaigns",
    description:
      "Automated annual review reminders, life event triggers (marriage, new baby, home purchase), and renewal campaigns that prevent policy lapses.",
    bullets: [
      "Annual review reminder campaigns",
      "Life event trigger campaigns",
      "Renewal 60/30/14-day reminders",
      "Cross-sell & upsell sequences",
      "Claims follow-up check-ins",
    ],
  },
  {
    icon: BarChart3,
    category: "Analytics",
    title: "Agency Performance Dashboard",
    description:
      "Track lead conversion rates, premium volume, retention rates, and referral sources — all in one real-time dashboard.",
    bullets: [
      "Lead-to-policy conversion rates",
      "Premium volume & growth tracking",
      "Policy retention & lapse rates",
      "Referral source attribution",
      "Agent performance metrics",
    ],
  },
  {
    icon: Users,
    category: "Client Experience",
    title: "Client Policy Portal",
    description:
      "Give clients a secure portal to view their policies, make payments, file claims, and request changes — reducing inbound calls and building loyalty.",
    bullets: [
      "Policy document storage & access",
      "Online payment & autopay",
      "Claims filing & status tracking",
      "Coverage change requests",
      "Certificate of insurance downloads",
    ],
  },
  {
    icon: TrendingUp,
    category: "Growth",
    title: "Referral & Review Automation",
    description:
      "Automatically request Google reviews from satisfied clients and build a referral engine that turns your best clients into your best lead source.",
    bullets: [
      "Automated Google review requests",
      "Referral program with tracking",
      "Testimonial collection & display",
      "LinkedIn & professional network campaigns",
      "Chamber of commerce & B2B referral tracking",
    ],
  },
];

const config: IndustryConfig = {
  slug: "insurance",
  name: "Insurance & Finance",
  tagline: "More policies, better retention, less manual work",
  heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/insurance-hero_acd4ae3b.jpg",
  galleryImages: [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/insurance-hero_acd4ae3b.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/insurance-family-ExhSZShNRs4mgW47WLNsRL.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/insurance-handshake-Nz8oqjndFKUHqGFsTeQZT4.png",
  ],
  splitImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/insurance-family-ExhSZShNRs4mgW47WLNsRL.png",
  heroHeadline: "An Insurance Agency Website That ||Generates Leads|| While You Service Clients",
  heroSubheadline:
    "We build AI-powered websites for insurance agents and financial advisors that qualify prospects, schedule consultations, and retain clients automatically — so you focus on closing policies.",
  accentColor: "oklch(0.48 0.14 250)",
  painPoints: [
    {
      icon: "—",
      title: "Prospects Don't Hear Back Fast Enough",
      desc: "Someone requests a quote on your website and you don't follow up until the next business day. They've already gotten a quote from a competitor.",
    },
    {
      icon: "—",
      title: "Wasting Time on Unqualified Leads",
      desc: "You're spending hours on prospects who aren't serious or don't qualify. AI pre-qualification means you only talk to ready buyers.",
    },
    {
      icon: "—",
      title: "Policy Lapses Costing You Revenue",
      desc: "Clients let policies lapse because they forgot to renew. Automated reminders and easy online payment prevent this entirely.",
    },
    {
      icon: "—",
      title: "Not Showing Up When People Search",
      desc: "When someone searches 'insurance agent in [city]', you're not appearing. Your competitors are capturing leads that should be yours.",
    },
    {
      icon: "—",
      title: "Annual Reviews Never Get Scheduled",
      desc: "You know annual reviews are the best time to upsell and retain clients, but they never get scheduled because no one follows up.",
    },
    {
      icon: "—",
      title: "No Visibility Into Your Book of Business",
      desc: "You don't know which clients are at risk of leaving, which products have the best retention, or where your best referrals come from.",
    },
  ],
  techFeatures: insuranceFeatures,
  results: [
    { stat: "5min", label: "Lead response time (AI)" },
    { stat: "72hrs", label: "Site live after kickoff" },
    { stat: "85%", label: "Policy renewal rate" },
    { stat: "3×", label: "More qualified consultations" },
  ],
  testimonial: {
    quote:
      "The automated renewal reminders alone reduced our lapse rate from 18% to 6%. The AI chatbot books 3–4 consultations a week without any staff involvement.",
    name: "David Park",
    business: "Bluetide Financial",
  },
  ctaHeadline: "Ready to Build an Insurance Agency That Grows on Autopilot?",
  ctaSubtext:
    "Schedule a free 30-minute strategy call. We'll audit your current online presence and show you exactly how many leads and renewals you're losing — and how to fix it.",
};

export default function InsurancePage() {
  return <IndustryLanding config={config} />;
}
