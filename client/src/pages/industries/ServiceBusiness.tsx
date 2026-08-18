import IndustryLanding, { CORE_TECH_FEATURES, IndustryConfig } from "@/components/IndustryLanding";

const config: IndustryConfig = {
  slug: "service-business",
  name: "Service Businesses",
  tagline: "More bookings, better clients, less admin work",
  heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/service-hero_e404c7d7.jpg",
  galleryImages: [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/service-hero_e404c7d7.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/service-plumber-RZ9hgoJwQQa2KNeGCGyhkx.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/service-landscaping-kZTwUwjPAwECDRXNYZw9AN.png",
  ],
  splitImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/service-plumber-RZ9hgoJwQQa2KNeGCGyhkx.png",
  heroHeadline: "A Service Business Website That ||Books Clients|| While You Do the Work",
  heroSubheadline:
    "We build AI-powered websites for home services, professional services, and local businesses that generate leads, book appointments, and follow up automatically — 24/7.",
  accentColor: "oklch(0.50 0.18 145)",
  painPoints: [
    {
      icon: "—",
      title: "Missing Calls While You're on the Job",
      desc: "You're in the middle of a job and a potential client calls. They don't leave a voicemail. That's $500–$5,000 walking out the door.",
    },
    {
      icon: "—",
      title: "Slow Follow-Up Losing You Jobs",
      desc: "Prospects request a quote and don't hear back for hours. In service businesses, the first company to respond wins 78% of the time.",
    },
    {
      icon: "—",
      title: "Manual Quoting Takes Too Long",
      desc: "You're spending 30 minutes per quote request when you could have an automated system collecting the information and sending a preliminary estimate instantly.",
    },
    {
      icon: "—",
      title: "Clients Don't Rebook or Refer",
      desc: "You do great work but clients don't automatically come back or refer their friends. Without a follow-up system, you're always chasing new business.",
    },
    {
      icon: "—",
      title: "Not Showing Up in Local Search",
      desc: "When someone searches '[your service] near me', your competitors are showing up and you're not. They're getting the calls that should be yours.",
    },
    {
      icon: "—",
      title: "No Idea What's Driving Revenue",
      desc: "You don't know which services are most profitable, where your best clients come from, or which marketing efforts are actually working.",
    },
  ],
  techFeatures: CORE_TECH_FEATURES,
  results: [
    { stat: "5min", label: "Lead response time (AI)" },
    { stat: "72hrs", label: "Site live after kickoff" },
    { stat: "4×", label: "More inbound inquiries" },
    { stat: "3hrs", label: "Admin time saved daily" },
  ],
  testimonial: {
    quote:
      "The AI chatbot responds to every lead in under 60 seconds. I went from missing 40% of my calls to booking every qualified lead that comes through my website.",
    name: "James Wilson",
    business: "Wilson Home Services",
  },
  ctaHeadline: "Ready to Build a Service Business That Generates Leads on Autopilot?",
  ctaSubtext:
    "Schedule a free 30-minute strategy call. We'll audit your current website and show you exactly how many leads you're losing — and how to capture them.",
};

export default function ServiceBusinessPage() {
  return <IndustryLanding config={config} />;
}
