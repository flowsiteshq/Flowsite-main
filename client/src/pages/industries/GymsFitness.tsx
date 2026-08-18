import IndustryLanding, { CORE_TECH_FEATURES, IndustryConfig } from "@/components/IndustryLanding";

const config: IndustryConfig = {
  slug: "gyms-fitness",
  name: "Gyms & Fitness",
  tagline: "Fill every class, retain every member",
  heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-hero-gym-DWvQq2rgQcqD6sQLHhUUVd.webp",
  galleryImages: [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-gallery-gym-1-8hiVviSixGKxRReSWVFu5B.webp",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-gallery-gym-2-USxGQ8A5bo83FYbmaoCPaj.webp",
  ],
  splitImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-gallery-gym-1-8hiVviSixGKxRReSWVFu5B.webp",
  heroHeadline: "Turn Your Gym Website Into a ||Member Acquisition Machine||",
  heroSubheadline:
    "We build AI-powered websites for gyms and fitness studios that sell memberships, fill classes, and retain members automatically — 24/7, without a single sales call.",
  accentColor: "oklch(0.55 0.22 145)",
  painPoints: [
    {
      icon: "—",
      title: "Empty Classes & Unused Capacity",
      desc: "You have 30 spots in your 6am class and only 12 people show up. That's lost revenue every single day — and your website isn't doing anything to fix it.",
    },
    {
      icon: "—",
      title: "High Member Churn",
      desc: "Members sign up, come for 3 weeks, then quietly cancel. Without automated re-engagement, you're constantly replacing churned members instead of growing.",
    },
    {
      icon: "—",
      title: "Trial Leads That Go Cold",
      desc: "Someone books a free trial class and then ghosts you. No automated follow-up = no conversion. You're leaving thousands on the table every month.",
    },
    {
      icon: "—",
      title: "Manual Scheduling Headaches",
      desc: "Your front desk is fielding 'what classes do you have?' calls all day. That's not a front desk job — it's a job for an AI system that works 24/7.",
    },
    {
      icon: "—",
      title: "Competing Against Big Box Gyms",
      desc: "Planet Fitness charges $10/month. You can't win on price — but you can win on experience, community, and results. Your website needs to show that.",
    },
    {
      icon: "—",
      title: "No Visibility Into What's Working",
      desc: "You don't know which membership tier converts best, which class times fill fastest, or which marketing channel drives your best members.",
    },
  ],
  techFeatures: CORE_TECH_FEATURES.map((f) => {
    if (f.title === "Advanced Class & Appointment Scheduling") {
      return {
        ...f,
        bullets: [
          "Real-time class schedule with live availability",
          "\"Only 4 spots left\" urgency triggers",
          "Waitlist management with auto-fill",
          "Recurring class booking for regulars",
          "Instant confirmation + 1hr reminder texts",
        ],
      };
    }
    if (f.title === "AI Enrollment Engine") {
      return {
        ...f,
        bullets: [
          "Free trial class booking in 60 seconds",
          "One-click membership upgrade flows",
          "Digital membership agreements",
          "Stripe recurring billing & failed payment recovery",
          "Family & couple membership bundles",
        ],
      };
    }
    if (f.title === "Member Portal & Dashboard") {
      return {
        ...f,
        bullets: [
          "Personal fitness progress tracker",
          "Class attendance history & streaks",
          "Achievement badges & challenges",
          "Book & cancel classes online",
          "Nutrition & workout resource library",
        ],
      };
    }
    return f;
  }),
  results: [
    { stat: "40+", label: "New members/month avg." },
    { stat: "72hrs", label: "Site live after kickoff" },
    { stat: "3×", label: "More trial conversions" },
    { stat: "85%", label: "Reduction in member churn" },
  ],
  testimonial: {
    quote:
      "We used to lose 15–20 members a month to cancellations. The automated re-engagement sequences cut that in half. The AI chatbot fills our morning classes every single day.",
    name: "Coach Dana Rivera",
    business: "Elevate Fitness Studio",
  },
  ctaHeadline: "Ready to Fill Every Class and Stop Losing Members?",
  ctaSubtext:
    "Schedule a free 30-minute strategy call. We'll audit your current website, show you exactly how many members you're losing, and map out an AI system to fix it.",
};

export default function GymsFitnessPage() {
  return <IndustryLanding config={config} />;
}
