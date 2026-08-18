/**
 * Shared add-ons catalog — used by both the GetStarted wizard and the client portal upgrade flow.
 * Keep this in sync with GetStarted.tsx if you add/remove add-ons.
 */

export interface AddOn {
  id: string;
  label: string;
  price: number;
  description?: string;
  category: "website" | "automation" | "industry";
  industry?: string; // only set for industry-specific add-ons
}

export const CORE_ADDONS: AddOn[] = [
  { id: "extra_page",               label: "Extra Page",                      price: 75,  description: "Each additional page beyond base", category: "website" },
  { id: "custom_homepage_section",  label: "Custom Homepage Section",         price: 350, category: "website" },
  { id: "faq_section",              label: "FAQ Section",                     price: 75,  category: "website" },
  { id: "testimonials_section",     label: "Testimonials Section",            price: 99,  category: "website" },
  { id: "gallery_portfolio",        label: "Gallery / Portfolio",             price: 250, category: "website" },
  { id: "blog_setup",               label: "Blog Setup",                      price: 299, category: "website" },
  { id: "careers_page",             label: "Careers Page",                    price: 199, category: "website" },
  { id: "video_embed",              label: "Video Embed / Background",        price: 99,  category: "website" },
  { id: "popup_lead_capture",       label: "Popup / Lead Capture Modal",      price: 149, category: "website" },
  { id: "countdown_timer",          label: "Countdown Timer / Urgency Bar",   price: 75,  category: "website" },
  { id: "live_chat",                label: "Live Chat Integration",           price: 99,  category: "website" },
  { id: "social_feed",              label: "Social Media Feed",               price: 99,  category: "website" },
  { id: "google_reviews",           label: "Google Reviews Display",          price: 99,  category: "website" },
  { id: "multilingual",             label: "Multilingual / Spanish Version",  price: 499, category: "website" },
  { id: "accessibility",            label: "Accessibility Compliance (WCAG)", price: 299, category: "website" },
  { id: "speed_optimization",       label: "Speed / Core Web Vitals Optimization", price: 149, category: "website" },
  { id: "analytics_setup",          label: "Analytics & Tracking Setup",      price: 149, category: "website" },
  { id: "custom_404",               label: "Custom 404 Page",                 price: 75,  category: "website" },
];

export const AUTO_ADDONS: AddOn[] = [
  { id: "crm_integration",          label: "CRM Integration (DojoFlow / GoHighLevel)", price: 599, category: "automation" },
  { id: "booking_system",           label: "Booking / Appointment System",    price: 399, category: "automation" },
  { id: "email_automation",         label: "Email Automation Sequences",      price: 399, category: "automation" },
  { id: "sms_automation",           label: "SMS Automation Sequences",        price: 249, category: "automation" },
  { id: "lead_pipeline",            label: "Lead Pipeline / CRM Dashboard",   price: 499, category: "automation" },
  { id: "stripe_payments",          label: "Stripe Payment Integration",      price: 399, category: "automation" },
  { id: "member_portal",            label: "Member / Client Portal",          price: 999, category: "automation" },
  { id: "admin_dashboard",          label: "Custom Admin Dashboard",          price: 999, category: "automation" },
  { id: "ai_chatbot",               label: "AI Chatbot",                      price: 499, description: "Starting at $499", category: "automation" },
  { id: "review_automation",        label: "Review Request Automation",       price: 149, category: "automation" },
  { id: "referral_program",         label: "Referral Program Setup",          price: 299, category: "automation" },
  { id: "loyalty_program",          label: "Loyalty / Rewards Program",       price: 499, category: "automation" },
  { id: "lead_magnet",              label: "Lead Magnet / Free Offer Page",   price: 149, category: "automation" },
  { id: "webinar_event",            label: "Webinar / Event Registration",    price: 299, category: "automation" },
  { id: "affiliate_tracking",       label: "Affiliate / Referral Tracking",   price: 499, category: "automation" },
];

export const INDUSTRY_ADDONS: Record<string, AddOn[]> = {
  martial_arts: [
    { id: "class_schedule",          label: "Class Schedule Page",            price: 149, category: "industry", industry: "martial_arts" },
    { id: "trial_class_funnel",      label: "Free Trial Class Funnel",        price: 299, category: "industry", industry: "martial_arts" },
    { id: "program_pages",           label: "Program Pages",                  price: 75,  description: "Per page", category: "industry", industry: "martial_arts" },
    { id: "belt_rank_tracker",       label: "Belt / Rank Tracker",            price: 499, category: "industry", industry: "martial_arts" },
    { id: "parent_portal",           label: "Parent / Student Portal",        price: 999, category: "industry", industry: "martial_arts" },
    { id: "tournament_events",       label: "Tournament / Events Page",       price: 149, category: "industry", industry: "martial_arts" },
    { id: "instructor_bios",         label: "Instructor Bios",                price: 199, category: "industry", industry: "martial_arts" },
    { id: "dojoflow_integration",    label: "DojoFlow Full Integration",      price: 399, category: "industry", industry: "martial_arts" },
    { id: "kiosk_checkin_ma",        label: "Kiosk Check-In",                 price: 999, category: "industry", industry: "martial_arts" },
  ],
  restaurant: [
    { id: "menu_page",               label: "Menu Page",                      price: 149, category: "industry", industry: "restaurant" },
    { id: "online_ordering",         label: "Online Ordering Integration",    price: 299, category: "industry", industry: "restaurant" },
    { id: "reservation_form",        label: "Reservation Form / Integration", price: 299, category: "industry", industry: "restaurant" },
    { id: "photo_gallery_rest",      label: "Photo Gallery",                  price: 149, category: "industry", industry: "restaurant" },
    { id: "events_live_music",       label: "Events / Live Music Page",       price: 125, category: "industry", industry: "restaurant" },
    { id: "catering_inquiry",        label: "Catering Inquiry Form",          price: 149, category: "industry", industry: "restaurant" },
    { id: "gift_card_page",          label: "Gift Card Page",                 price: 125, category: "industry", industry: "restaurant" },
    { id: "loyalty_signup",          label: "Loyalty Signup Form",            price: 99,  category: "industry", industry: "restaurant" },
    { id: "promo_seasonal",          label: "Promo Popups & Seasonal Banners",price: 99,  category: "industry", industry: "restaurant" },
    { id: "multi_location_rest",     label: "Multi-Location Setup",           price: 199, description: "+location fees", category: "industry", industry: "restaurant" },
    { id: "review_integration",      label: "Review Integration",             price: 99,  category: "industry", industry: "restaurant" },
    { id: "email_sms_capture",       label: "Email / SMS Campaign Capture",   price: 299, category: "industry", industry: "restaurant" },
  ],
  salon: [
    { id: "service_menu",            label: "Service Menu Page",              price: 149, category: "industry", industry: "salon" },
    { id: "appointment_booking",     label: "Appointment Booking Integration",price: 399, category: "industry", industry: "salon" },
    { id: "staff_bios",              label: "Staff / Team Bios",              price: 199, category: "industry", industry: "salon" },
    { id: "service_detail_pages",    label: "Treatment / Service Detail Pages",price: 75, description: "Per page", category: "industry", industry: "salon" },
    { id: "before_after_gallery",    label: "Before / After Gallery",         price: 149, category: "industry", industry: "salon" },
    { id: "intake_form",             label: "Intake / Consultation Form",     price: 149, category: "industry", industry: "salon" },
    { id: "membership_packages",     label: "Membership / Package Sales",     price: 499, category: "industry", industry: "salon" },
    { id: "sms_reminders_salon",     label: "SMS Reminders",                  price: 249, category: "industry", industry: "salon" },
    { id: "review_showcase",         label: "Review Showcase",                price: 99,  category: "industry", industry: "salon" },
  ],
  insurance: [
    { id: "quote_request_form",      label: "Quote Request Form",             price: 149, category: "industry", industry: "insurance" },
    { id: "consultation_booking",    label: "Consultation Booking Flow",      price: 199, category: "industry", industry: "insurance" },
    { id: "lead_qualification_quiz", label: "Lead Qualification Quiz",        price: 499, category: "industry", industry: "insurance" },
    { id: "crm_integration_ins",     label: "CRM Integration",                price: 599, category: "industry", industry: "insurance" },
    { id: "policy_service_pages",    label: "Policy / Service Pages",         price: 75,  description: "Per page", category: "industry", industry: "insurance" },
    { id: "educational_blog",        label: "Educational Blog Setup",         price: 199, category: "industry", industry: "insurance" },
    { id: "secure_document_upload",  label: "Secure Document Upload Form",    price: 399, category: "industry", industry: "insurance" },
    { id: "ai_chatbot_ins",          label: "AI Chatbot",                     price: 499, description: "Starting at $499", category: "industry", industry: "insurance" },
  ],
  real_estate: [
    { id: "listings_showcase",       label: "Listings Showcase",              price: 599, category: "industry", industry: "real_estate" },
    { id: "property_inquiry_forms",  label: "Property Inquiry Forms",         price: 149, category: "industry", industry: "real_estate" },
    { id: "consultation_valuation",  label: "Consultation / Valuation Request",price: 149, category: "industry", industry: "real_estate" },
    { id: "financing_lead_capture",  label: "Financing / Pre-Approval Lead Capture", price: 149, category: "industry", industry: "real_estate" },
    { id: "neighborhood_pages",      label: "Neighborhood / Location Pages",  price: 75,  description: "Per page", category: "industry", industry: "real_estate" },
    { id: "crm_integration_re",      label: "CRM Integration",                price: 599, category: "industry", industry: "real_estate" },
    { id: "gallery_video_walkthrough",label: "Gallery / Video Walkthrough",   price: 199, category: "industry", industry: "real_estate" },
  ],
  general: [
    { id: "service_overview_page",   label: "Service Overview Page",          price: 149, category: "industry", industry: "general" },
    { id: "team_bios_general",       label: "Team / Staff Bios",              price: 199, category: "industry", industry: "general" },
    { id: "case_studies_page",       label: "Case Studies / Results Page",    price: 249, category: "industry", industry: "general" },
    { id: "quote_request_general",   label: "Quote / Estimate Request Form",  price: 149, category: "industry", industry: "general" },
    { id: "portfolio_showcase",      label: "Portfolio / Work Showcase",      price: 250, category: "industry", industry: "general" },
    { id: "process_page",            label: "Our Process / How It Works Page",price: 149, category: "industry", industry: "general" },
  ],
};

export const ALL_ADDONS: AddOn[] = [
  ...CORE_ADDONS,
  ...AUTO_ADDONS,
  ...Object.values(INDUSTRY_ADDONS).flat(),
];

export function fmt(n: number) { return "$" + n.toLocaleString(); }
