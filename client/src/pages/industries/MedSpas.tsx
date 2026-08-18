import IndustryLanding, { CORE_TECH_FEATURES, IndustryConfig } from "@/components/IndustryLanding";

const config: IndustryConfig = {
  slug: "med-spas",
  name: "Med Spas",
  tagline: "Fill your treatment calendar and retain high-value clients",
  heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-hero-medspa-TwJY5hUhrhiChdX6upsdqs.webp",
  galleryImages: [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-gallery-medspa-1-7Rjw9veP8JcoSGcBMkNdQH.webp",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-hero-medspa-TwJY5hUhrhiChdX6upsdqs.webp",
  ],
  splitImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-gallery-medspa-1-7Rjw9veP8JcoSGcBMkNdQH.webp",
  heroHeadline: "A Med Spa Website That ||Books Treatments|| Around the Clock",
  heroSubheadline:
    "We build AI-powered websites for medical spas and aesthetic clinics that book consultations, sell treatment packages, and retain high-value clients automatically — 24/7, without a single phone call.",
  accentColor: "oklch(0.60 0.12 330)",
  painPoints: [
    {
      icon: "—",
      title: "Empty Appointment Slots Costing You Revenue",
      desc: "Every unfilled treatment slot is $200–$800 in lost revenue. Without an automated booking system that fills cancellations instantly, you're leaving money on the table every day.",
    },
    {
      icon: "—",
      title: "Clients Don't Return for Follow-Up Treatments",
      desc: "Botox lasts 3–4 months. Filler lasts 6–12 months. If you're not automatically reminding clients when they're due for their next treatment, your competitor is getting that appointment.",
    },
    {
      icon: "—",
      title: "Competing on Price Instead of Experience",
      desc: "Groupon and discount med spas are racing to the bottom. Your website needs to communicate luxury, expertise, and results — not just prices — to attract high-value clients.",
    },
    {
      icon: "—",
      title: "No System to Upsell Treatment Packages",
      desc: "A client comes in for Botox. They're a perfect candidate for filler, laser, or a membership package. Without an automated upsell system, that revenue walks out the door.",
    },
    {
      icon: "—",
      title: "Before & After Photos Not Converting",
      desc: "You have incredible results but your website doesn't showcase them effectively. A properly designed results gallery with consent management is your most powerful conversion tool.",
    },
    {
      icon: "—",
      title: "HIPAA Compliance Concerns Online",
      desc: "You're hesitant to collect client information online because of compliance concerns. The right system handles intake forms, consent, and data securely and compliantly.",
    },
  ],
  techFeatures: CORE_TECH_FEATURES.map((f) => {
    if (f.title === "Advanced Class & Appointment Scheduling") {
      return {
        ...f,
        title: "Treatment & Consultation Scheduling",
        bullets: [
          "Online booking for all treatment types",
          "Provider-specific availability management",
          "Consultation vs. treatment appointment types",
          "Automated pre-treatment instructions via SMS",
          "Cancellation fill — auto-books waitlisted clients",
        ],
      };
    }
    if (f.title === "AI Enrollment Engine") {
      return {
        ...f,
        title: "Client Intake & Package Sales",
        bullets: [
          "Digital intake forms & medical history",
          "Treatment package & membership sales",
          "Deposit collection with Stripe",
          "E-consent forms & HIPAA-compliant storage",
          "Loyalty points & referral rewards",
        ],
      };
    }
    if (f.title === "Member Portal & Dashboard") {
      return {
        ...f,
        title: "Client Portal & Treatment History",
        bullets: [
          "Personal treatment history & notes",
          "Before & after photo gallery (private)",
          "Upcoming appointment management",
          "Package balance & loyalty points",
          "Product recommendations & shop",
        ],
      };
    }
    return f;
  }),
  results: [
    { stat: "35%", label: "More bookings per month" },
    { stat: "72hrs", label: "Site live after kickoff" },
    { stat: "2×", label: "Client retention rate" },
    { stat: "45%", label: "More package upsells" },
  ],
  testimonial: {
    quote:
      "Our treatment calendar went from 60% to 95% full within 6 weeks. The automated rebooking reminders alone generate an extra $12,000 a month in treatments we used to lose to competitors.",
    name: "Dr. Sophia Martinez",
    business: "Lumière Medical Aesthetics",
  },
  ctaHeadline: "Ready to Fill Your Treatment Calendar and Retain Every Client?",
  ctaSubtext:
    "Schedule a free 30-minute strategy call. We'll audit your current website, show you exactly how much revenue you're losing to empty slots and lapsed clients, and build a system to capture it all.",
};

export default function MedSpasPage() {
  return <IndustryLanding config={config} />;
}
