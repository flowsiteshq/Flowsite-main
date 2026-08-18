import IndustryLanding, { IndustryConfig, TechFeature } from "@/components/IndustryLanding";
import { Bot, Clock, CalendarDays, CreditCard, MessageSquare, BarChart3, Users, TrendingUp } from "lucide-react";

const healthFeatures: TechFeature[] = [
  {
    icon: Bot,
    category: "AI & Automation",
    title: "AI Intake & Scheduling Assistant",
    description:
      "A HIPAA-aware AI assistant handles new patient inquiries, answers service questions, and books initial consultations — 24/7, without staff involvement.",
    bullets: [
      "Books initial consultations automatically",
      "Answers service & insurance questions",
      "Collects intake information pre-visit",
      "Handles cancellations & rescheduling",
      "Sensitive, professional tone built-in",
    ],
    badge: "Most Popular",
  },
  {
    icon: Clock,
    category: "Business Automation",
    title: "Live Availability & Wait Times",
    description:
      "Show real-time appointment availability, next open slot, and practitioner schedules — reducing the #1 barrier to booking: uncertainty.",
    bullets: [
      "Live \"Accepting New Patients\" badge",
      "Next available appointment display",
      "Individual practitioner availability",
      "Telehealth vs. in-person options",
      "Holiday & special hours support",
    ],
  },
  {
    icon: CalendarDays,
    category: "Scheduling",
    title: "Advanced Appointment Scheduling",
    description:
      "HIPAA-compliant online booking with practitioner selection, session type management, and automated reminders that reduce no-shows by 60%.",
    bullets: [
      "HIPAA-compliant booking flow",
      "Practitioner & session type selection",
      "Automated SMS & email reminders",
      "Recurring appointment scheduling",
      "Telehealth video link generation",
    ],
  },
  {
    icon: CreditCard,
    category: "Billing",
    title: "Online Payments & Insurance",
    description:
      "Accept payments, copays, and deposits online — with insurance verification prompts and flexible payment plans for longer treatment programs.",
    bullets: [
      "Online copay & session fee collection",
      "Insurance verification prompts",
      "Payment plans for treatment programs",
      "Superbill generation for HSA/FSA",
      "Automatic failed payment recovery",
    ],
  },
  {
    icon: MessageSquare,
    category: "Patient Retention",
    title: "Automated Patient Follow-Ups",
    description:
      "Check-in messages, appointment reminders, treatment milestone celebrations, and re-engagement for lapsed patients — all automated.",
    bullets: [
      "Post-session check-in messages",
      "Treatment milestone celebrations",
      "Lapsed patient re-engagement",
      "Referral request automation",
      "Seasonal wellness campaign emails",
    ],
  },
  {
    icon: BarChart3,
    category: "Analytics",
    title: "Practice Performance Dashboard",
    description:
      "Track patient retention, session completion rates, revenue per practitioner, and referral sources — all in one real-time dashboard.",
    bullets: [
      "Patient retention & churn rates",
      "Session completion & cancellation rates",
      "Revenue per practitioner",
      "Referral source tracking",
      "New patient acquisition cost",
    ],
  },
  {
    icon: Users,
    category: "Patient Experience",
    title: "Patient Portal",
    description:
      "Give patients a secure portal to manage appointments, view session notes, complete intake forms, and access resources — building trust and loyalty.",
    bullets: [
      "Secure appointment management",
      "Digital intake & consent forms",
      "Session notes & progress tracking",
      "Resource library & homework",
      "Telehealth video sessions",
    ],
  },
  {
    icon: TrendingUp,
    category: "Growth",
    title: "Review & Referral Automation",
    description:
      "Automatically request Google reviews from satisfied patients and incentivize referrals — turning your happiest patients into your best marketing.",
    bullets: [
      "Automated Google review requests",
      "Referral program with incentives",
      "Psychology Today & Zocdoc sync",
      "Testimonial collection & display",
      "Social proof widgets on homepage",
    ],
  },
];

const config: IndustryConfig = {
  slug: "health-wellness",
  name: "Health & Wellness",
  tagline: "Grow your practice without burning out",
  heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/health-hero_1ed3069e.jpg",
  galleryImages: [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/health-hero_1ed3069e.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/health-yoga_studio-Y36ZLvcHEy5fvnnvab2Y9B.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/health-consultation-Hpck5QvEwwLHDvZANMAguj.png",
  ],
  splitImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/health-consultation-Hpck5QvEwwLHDvZANMAguj.png",
  heroHeadline: "A Wellness Practice Website That ||Grows Itself|| While You Heal Others",
  heroSubheadline:
    "We build AI-powered websites for therapists, counselors, chiropractors, and wellness practitioners that book consultations, reduce no-shows, and keep patients engaged — automatically.",
  accentColor: "oklch(0.52 0.14 165)",
  painPoints: [
    {
      icon: "—",
      title: "Phone Tag With New Patients",
      desc: "You're playing phone tag with potential patients who called during a session. By the time you call back, they've found someone else.",
    },
    {
      icon: "—",
      title: "No-Shows Disrupting Your Day",
      desc: "Last-minute cancellations leave gaps in your schedule and lost income. Without deposits or automated reminders, it keeps happening.",
    },
    {
      icon: "—",
      title: "Paper Intake Forms Are Slow",
      desc: "Patients arrive 15 minutes early to fill out paper forms. Digital intake collected before the visit saves everyone time.",
    },
    {
      icon: "—",
      title: "Not Showing Up in Google Searches",
      desc: "When someone searches 'therapist near me' or 'chiropractor in [city]', your practice isn't appearing. You're invisible to the people who need you most.",
    },
    {
      icon: "—",
      title: "Patients Disappear After Treatment",
      desc: "Patients complete their treatment and you never hear from them again. No follow-up system means no referrals and no returning patients.",
    },
    {
      icon: "—",
      title: "Admin Work Eating Your Time",
      desc: "You spent years training to help people, not to manage scheduling, billing, and follow-ups. Automation gives you that time back.",
    },
  ],
  techFeatures: healthFeatures,
  results: [
    { stat: "60%", label: "Fewer no-shows" },
    { stat: "72hrs", label: "Site live after kickoff" },
    { stat: "3×", label: "More new patient inquiries" },
    { stat: "5hrs", label: "Admin time saved per week" },
  ],
  testimonial: {
    quote:
      "My practice went from 12 to 28 active clients in 90 days. The automated intake forms alone save me 45 minutes per new patient.",
    name: "Dr. Amara Osei",
    business: "Zolamind Counseling",
  },
  ctaHeadline: "Ready to Grow Your Practice Without the Admin Overwhelm?",
  ctaSubtext:
    "Schedule a free 30-minute strategy call. We'll audit your current online presence and show you exactly how many patients you're losing — and how to fix it.",
};

export default function HealthWellnessPage() {
  return <IndustryLanding config={config} />;
}
