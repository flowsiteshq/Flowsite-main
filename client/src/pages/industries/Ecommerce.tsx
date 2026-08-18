import IndustryLanding, { IndustryConfig, TechFeature } from "@/components/IndustryLanding";
import {
  ShoppingCart,
  CreditCard,
  BarChart3,
  Search,
  RefreshCw,
  MessageSquare,
  Package,
  TrendingUp,
} from "lucide-react";

const ecommerceFeatures: TechFeature[] = [
  {
    icon: ShoppingCart,
    category: "Store Design",
    title: "High-Converting Product Pages",
    description:
      "We design product pages engineered to sell — with compelling copy, trust signals, urgency elements, and mobile-first layouts that turn browsers into buyers.",
    bullets: [
      "Conversion-optimized product layouts",
      "Trust badges, reviews & social proof",
      "Urgency timers & low-stock alerts",
      "Upsell & cross-sell product blocks",
      "Mobile-first, lightning-fast pages",
    ],
    badge: "Core Feature",
  },
  {
    icon: CreditCard,
    category: "Payments",
    title: "Seamless Checkout & Payments",
    description:
      "A frictionless checkout experience with multiple payment options — credit cards, Apple Pay, Google Pay, buy-now-pay-later — to maximize completed purchases.",
    bullets: [
      "One-page streamlined checkout",
      "Apple Pay & Google Pay support",
      "Buy now, pay later (Klarna, Afterpay)",
      "Abandoned cart recovery automation",
      "Secure SSL & PCI-compliant processing",
    ],
  },
  {
    icon: Package,
    category: "Inventory",
    title: "Smart Inventory Management",
    description:
      "Real-time inventory tracking, low-stock alerts, and automated reorder notifications keep your store running smoothly without manual oversight.",
    bullets: [
      "Real-time stock level display",
      "Low-stock & out-of-stock alerts",
      "Variant management (size, color, etc.)",
      "Bulk product import & export",
      "Supplier & fulfillment integrations",
    ],
  },
  {
    icon: Search,
    category: "SEO & Discovery",
    title: "Built-In SEO & Product Discovery",
    description:
      "Every product page is SEO-optimized from day one — structured data, fast load times, and smart search so customers find what they're looking for instantly.",
    bullets: [
      "Schema markup for rich search results",
      "Auto-generated sitemaps",
      "Smart site search with filters",
      "Category & collection pages",
      "Google Shopping feed integration",
    ],
  },
  {
    icon: RefreshCw,
    category: "Retention",
    title: "Automated Email & SMS Marketing",
    description:
      "Win-back campaigns, post-purchase sequences, and loyalty programs that turn one-time buyers into repeat customers — all running on autopilot.",
    bullets: [
      "Welcome series for new customers",
      "Abandoned cart recovery (email + SMS)",
      "Post-purchase thank you & review requests",
      "Win-back campaigns for lapsed buyers",
      "Loyalty points & rewards program",
    ],
  },
  {
    icon: MessageSquare,
    category: "Customer Support",
    title: "AI-Powered Customer Support",
    description:
      "An AI chat assistant handles order status, returns, product questions, and FAQs 24/7 — reducing support tickets while keeping customers happy.",
    bullets: [
      "24/7 AI order status lookup",
      "Returns & exchange automation",
      "Product recommendation chat",
      "FAQ deflection (reduces tickets 60%)",
      "Escalation to human agent when needed",
    ],
  },
  {
    icon: BarChart3,
    category: "Analytics",
    title: "Revenue & Conversion Analytics",
    description:
      "A real-time dashboard showing your best-selling products, conversion rates, customer lifetime value, and revenue trends — so you always know what's working.",
    bullets: [
      "Revenue & orders dashboard",
      "Conversion funnel analysis",
      "Best-seller & dead-stock reports",
      "Customer lifetime value tracking",
      "Ad spend ROI attribution",
    ],
  },
  {
    icon: TrendingUp,
    category: "Growth",
    title: "Social Commerce & Ad Integration",
    description:
      "Sell directly on Instagram, Facebook, and TikTok, and connect your store to Google Ads and Meta Ads for retargeting campaigns that bring shoppers back.",
    bullets: [
      "Instagram & Facebook Shop sync",
      "TikTok Shop integration",
      "Google Shopping ads feed",
      "Meta Pixel & conversion tracking",
      "Dynamic retargeting product ads",
    ],
  },
];

const config: IndustryConfig = {
  slug: "ecommerce",
  name: "E-Commerce",
  tagline: "Turn your online store into a revenue machine",
  heroImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=88",
  galleryImages: [
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=88",
    "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1600&q=88",
  ],
  splitImage: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1600&q=88",
  heroHeadline: "An Online Store That ||Sells While You Sleep||",
  heroSubheadline:
    "We build high-converting e-commerce websites with AI-powered automation, seamless checkout, and built-in marketing tools that grow your revenue on autopilot — from first click to loyal customer.",
  accentColor: "oklch(0.55 0.2 260)",
  painPoints: [
    {
      icon: "—",
      title: "High Traffic, Low Sales",
      desc: "You're getting visitors but they're not buying. Poor product pages, slow load times, and a clunky checkout are costing you thousands in lost revenue every month.",
    },
    {
      icon: "—",
      title: "Cart Abandonment Bleeding Revenue",
      desc: "70% of shoppers add items to their cart and leave. Without automated recovery sequences, that revenue is gone forever.",
    },
    {
      icon: "—",
      title: "One-Time Buyers, No Repeat Purchases",
      desc: "You work hard to acquire a customer and they buy once. Without a retention system, you're on a treadmill — constantly spending on ads to replace lost customers.",
    },
    {
      icon: "—",
      title: "Buried in Customer Support",
      desc: "Order status questions, return requests, and product inquiries flood your inbox. You're spending hours on support instead of growing the business.",
    },
    {
      icon: "—",
      title: "No Idea What's Actually Working",
      desc: "You don't know which products have the best margins, where customers drop off, or which ad campaigns are actually profitable.",
    },
    {
      icon: "—",
      title: "Missing Out on Social Commerce",
      desc: "Your competitors are selling on Instagram, TikTok, and Google Shopping while your store sits invisible to millions of potential buyers.",
    },
  ],
  techFeatures: ecommerceFeatures,
  results: [
    { stat: "3×", label: "Average revenue increase" },
    { stat: "68%", label: "Cart abandonment recovered" },
    { stat: "72hrs", label: "Store live after kickoff" },
    { stat: "40%", label: "Reduction in support tickets" },
  ],
  testimonial: {
    quote:
      "Our store was getting traffic but barely converting. FlowSites rebuilt everything and our monthly revenue tripled in 90 days. The abandoned cart automation alone pays for itself.",
    name: "Marcus Williams",
    business: "Urban Thread Co.",
  },
  ctaHeadline: "Ready to Build an E-Commerce Store That Actually Sells?",
  ctaSubtext:
    "Schedule a free 30-minute strategy call. We'll audit your current store (or start from scratch) and show you exactly how to turn more visitors into buyers.",
};

export default function EcommercePage() {
  return <IndustryLanding config={config} />;
}
