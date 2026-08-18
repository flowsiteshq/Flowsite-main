import IndustryLanding, { CORE_TECH_FEATURES, IndustryConfig } from "@/components/IndustryLanding";

const config: IndustryConfig = {
  slug: "martial-arts",
  name: "Martial Arts & Fitness",
  tagline: "Pack your mats with new students every month",
  heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/ma-hero_3e29f469.jpg",
  galleryImages: [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/ma-kids_edb30b4a.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/ma-class_320a1256.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/ma-belt_d9292214.jpg",
  ],
  splitImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/ma-kids_edb30b4a.jpg",
  heroHeadline: "Turn Your Dojo Website Into an ||Enrollment Machine||",
  heroSubheadline:
    "We build AI-powered websites for martial arts schools and fitness studios that book classes, capture leads, and enroll students automatically — 24/7, without lifting a finger.",
  accentColor: "oklch(0.52 0.22 25)",
  painPoints: [
    {
      icon: "—",
      title: "Leads Fall Through the Cracks",
      desc: "Someone fills out your form at 10pm and you don't follow up until morning. They've already signed up with your competitor.",
    },
    {
      icon: "—",
      title: "Manual Class Scheduling Chaos",
      desc: "You're spending hours every week answering 'what times do you have?' instead of coaching your students.",
    },
    {
      icon: "—",
      title: "Expensive Ads, Low Conversions",
      desc: "You're paying for clicks but your website isn't converting them into enrolled students. Money is leaking out.",
    },
    {
      icon: "—",
      title: "No Follow-Up System",
      desc: "Prospects visit your site, leave, and you never hear from them again. No automated follow-up = lost revenue.",
    },
    {
      icon: "—",
      title: "Generic Website, Zero Personality",
      desc: "Your current site looks like every other dojo. There's nothing that makes a parent choose YOU over the school down the street.",
    },
    {
      icon: "—",
      title: "No Idea What's Working",
      desc: "You have no visibility into where your leads come from, which pages convert, or why students drop off.",
    },
  ],
  techFeatures: CORE_TECH_FEATURES.map((f) => {
    if (f.title === "Advanced Class & Appointment Scheduling") {
      return {
        ...f,
        bullets: [
          "Real-time class availability display",
          "\"Only 3 spots left\" urgency triggers",
          "AI-recommended class times by age & belt level",
          "Instant confirmation + reminder texts",
          "Syncs with DojoFlow & Google Calendar",
        ],
      };
    }
    if (f.title === "AI Enrollment Engine") {
      return {
        ...f,
        bullets: [
          "One-click trial class enrollment",
          "Digital waivers & parent consent forms",
          "Auto account creation in DojoFlow CRM",
          "Recurring belt program billing",
          "Summer camp & event registration",
        ],
      };
    }
    if (f.title === "Member Portal & Dashboard") {
      return {
        ...f,
        bullets: [
          "Belt rank & progression tracker",
          "Attendance history & streaks",
          "Achievement badges & leaderboards",
          "Book & cancel classes online",
          "Parent portal for kids' accounts",
        ],
      };
    }
    return f;
  }),
  results: [
    { stat: "30+", label: "New students/month avg." },
    { stat: "72hrs", label: "Site live after kickoff" },
    { stat: "4×", label: "More leads vs. old site" },
    { stat: "90%", label: "Less manual follow-up" },
  ],
  testimonial: {
    quote:
      "We went from 3 leads a month to over 22 in the first 60 days. The AI chatbot alone books 5–8 intro classes a week without me doing anything.",
    name: "Master Vincent Holmes",
    business: "MyDojo Martial Arts",
  },
  ctaHeadline: "Ready to Pack Your Mats with New Students?",
  ctaSubtext:
    "Schedule a free 30-minute strategy call. We'll audit your current website, show you exactly what's costing you students, and map out a system to fix it.",
};

export default function MartialArtsPage() {
  return <IndustryLanding config={config} />;
}
