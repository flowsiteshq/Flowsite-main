import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Film,
  Globe2,
  Loader2,
  MessageSquareText,
  MousePointerClick,
  Pause,
  Play,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Smartphone,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { leadCaptureHref } from "@/lib/leadCapture";
import { useSEO } from "@/hooks/useSEO";

const HERO_VISUAL = "/flowsites-cinematic-hero.webp";
const SERVICE_VISUALS = {
  websites: "/flowsites-service-websites.webp",
  automation: "/flowsites-service-automation.webp",
  video: "/flowsites-service-video.webp",
} as const;

const packages = [
  {
    id: "starter",
    name: "Starter",
    price: "$499",
    description: "A polished foundation for a growing local business.",
    features: ["1–3-page website", "Mobile optimization", "Contact form", "Basic SEO setup"],
    popular: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: "$799",
    description: "More room to explain your offer and turn visitors into inquiries.",
    features: ["Up to 5 pages", "Mobile optimization", "Online booking integration", "Lead capture", "Automated email acknowledgment"],
    popular: true,
  },
  {
    id: "ai-business",
    name: "AI Business",
    price: "$1,499",
    description: "A streamlined website and practical automation for follow-up.",
    features: ["Everything in Growth", "AI chatbot configuration", "CRM integration", "Basic customer follow-up automation"],
    popular: false,
  },
] as const;

const projects = [
  {
    name: "MyDojo Martial Arts",
    subtitle: "Website · Booking · Enrollment system",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/mydojo-hero_ba21ac04.png",
    imageClassName: "object-top",
    alt: "MyDojo Martial Arts website preview",
    href: "/case-study/mydojo",
  },
  {
    name: "DojoFlow",
    subtitle: "Product preview · Operations platform",
    image: "/dojoflow-platform-preview.webp",
    imageClassName: "object-[center_58%]",
    alt: "DojoFlow platform preview shown across desktop and mobile devices",
    href: "/case-study/dojoflow",
  },
  {
    name: "Zolamind Counseling",
    subtitle: "Website · Booking · CRM integration",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/zolamind-hero_fbe3d3b0.png",
    imageClassName: "object-top",
    alt: "Zolamind Counseling website preview",
    href: "/case-study/zolamind",
  },
] as const;

const videoStudioPreviews = [
  { label: "Automotive", src: "/video-studio/automotive-showcase.mp4", poster: "/video-studio/automotive-poster.jpg" },
  { label: "Restaurant", src: "/video-studio/restaurant-showcase.mp4", poster: "/video-studio/restaurant-poster.jpg" },
  { label: "Professional services", src: "/video-studio/professional-services-showcase.mp4", poster: "/video-studio/professional-services-poster.jpg" },
] as const;

type ReviewForm = {
  businessName: string;
  website: string;
  email: string;
  phone: string;
  improvement: string;
};

type VideoPreview = (typeof videoStudioPreviews)[number];

function useVideoPlaybackPermission() {
  const [allowHoverPlayback, setAllowHoverPlayback] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const update = () => setAllowHoverPlayback(!motionQuery.matches && desktopQuery.matches);
    update();
    motionQuery.addEventListener("change", update);
    desktopQuery.addEventListener("change", update);
    return () => {
      motionQuery.removeEventListener("change", update);
      desktopQuery.removeEventListener("change", update);
    };
  }, []);

  return allowHoverPlayback;
}

function VideoPreviewCard({ item, compact = false }: { item: VideoPreview; compact?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const allowHoverPlayback = useVideoPlaybackPermission();

  const stop = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setPlaying(false);
  };

  const play = async () => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const toggle = async () => {
    if (playing) stop();
    else await play();
  };

  return (
    <article
      className={`group relative overflow-hidden bg-slate-950 ${compact ? "rounded-2xl" : "rounded-[1.75rem] border border-white/10 shadow-[0_28px_70px_rgba(0,0,0,0.4)]"}`}
      onMouseEnter={() => { if (allowHoverPlayback) void play(); }}
      onMouseLeave={stop}
    >
      <video
        ref={videoRef}
        src={item.src}
        poster={item.poster}
        muted
        loop
        playsInline
        preload={allowHoverPlayback ? "metadata" : "none"}
        className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.045] ${compact ? "aspect-[16/10]" : "aspect-video"}`}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(2,6,23,0.86)_100%)]" />
      <div className={`absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 ${compact ? "p-3" : "p-5 sm:p-6"}`}>
        <div>
          {!compact && <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">Original demonstration concept</p>}
          <p className={`${compact ? "text-xs" : "text-lg"} font-extrabold tracking-tight text-white`}>{item.label}</p>
        </div>
        <button
          type="button"
          onClick={() => void toggle()}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/15 text-white backdrop-blur transition hover:bg-white hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-blue-300/50"
          aria-label={`${playing ? "Pause" : "Play"} ${item.label} video preview`}
        >
          {playing ? <Pause size={15} fill="currentColor" /> : <Play size={16} fill="currentColor" className="translate-x-0.5" />}
        </button>
      </div>
    </article>
  );
}

function FreeWebsiteReview() {
  const [form, setForm] = useState<ReviewForm>({ businessName: "", website: "", email: "", phone: "", improvement: "" });
  const [submitted, setSubmitted] = useState(false);
  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Your website review request has been received.");
    },
    onError: error => toast.error(error.message || "We could not send your request. Please try again."),
  });

  const update = (field: keyof ReviewForm, value: string) => setForm(current => ({ ...current, [field]: value }));
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.email.trim() && !form.phone.trim()) {
      toast.error("Enter an email address or phone number so we can reply.");
      return;
    }
    submitMutation.mutate({
      name: form.businessName,
      businessName: form.businessName,
      email: form.email.trim(),
      phone: form.phone.trim(),
      lookingFor: `Free Website Review — ${form.improvement}${form.website.trim() ? ` | Website: ${form.website.trim()}` : ""}`,
    });
  };

  if (submitted) {
    return <div className="rounded-[1.75rem] border border-blue-300/20 bg-white/10 p-8 text-center text-white backdrop-blur"><CheckCircle2 className="mx-auto h-11 w-11 text-blue-300" /><h3 className="mt-4 text-xl font-extrabold">Review request received</h3><p className="mt-2 text-sm leading-6 text-slate-300">Thank you. A FlowSites team member will review the details you provided and follow up using your preferred contact method.</p></div>;
  }

  const fieldClass = "mt-1.5 h-11 w-full rounded-xl border border-white/15 bg-white/[0.08] px-3.5 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-blue-300 focus:bg-white/[0.12] focus:ring-4 focus:ring-blue-400/15";
  return (
    <form onSubmit={handleSubmit} className="rounded-[1.75rem] border border-white/12 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2"><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-100">Business name</span><input required value={form.businessName} onChange={event => update("businessName", event.target.value)} placeholder="Your business name" className={fieldClass} /></label>
        <label className="sm:col-span-2"><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-100">Website URL</span><input value={form.website} onChange={event => update("website", event.target.value)} placeholder="https://yourwebsite.com" className={fieldClass} /></label>
        <label><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-100">Email</span><input type="email" value={form.email} onChange={event => update("email", event.target.value)} placeholder="you@business.com" className={fieldClass} /></label>
        <label><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-100">Phone</span><input type="tel" value={form.phone} onChange={event => update("phone", event.target.value)} placeholder="(555) 123-4567" className={fieldClass} /></label>
        <label className="sm:col-span-2"><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-100">What needs the most improvement?</span><select required value={form.improvement} onChange={event => update("improvement", event.target.value)} className={`${fieldClass} appearance-none`}><option value="" className="text-slate-900">Select an option</option><option value="A new website" className="text-slate-900">A new website</option><option value="A redesign" className="text-slate-900">A redesign</option><option value="More leads" className="text-slate-900">More leads</option><option value="Online booking" className="text-slate-900">Online booking</option><option value="Customer follow-up" className="text-slate-900">Customer follow-up</option><option value="Not sure yet" className="text-slate-900">Not sure yet</option></select></label>
      </div>
      <button type="submit" disabled={submitMutation.isPending} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">{submitMutation.isPending ? <><Loader2 size={16} className="animate-spin" /> Sending request</> : <>Get my free review <ArrowRight size={16} /></>}</button>
      <p className="mt-3 text-center text-xs leading-5 text-slate-400">Enter an email address or phone number. We use your details only to respond to your request.</p>
    </form>
  );
}

function EditorialServicePanel({ eyebrow, title, copy, image, href, action, icon: Icon }: { eyebrow: string; title: string; copy: string; image: string; href: string; action: string; icon: typeof Globe2 }) {
  return (
    <article className="group relative min-h-[30rem] overflow-hidden rounded-[2rem] bg-slate-950 shadow-2xl shadow-blue-950/20">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]" />
      <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(2,6,23,0.98)_0%,rgba(2,6,23,0.68)_48%,rgba(2,6,23,0.10)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      <div className="relative flex h-full min-h-[30rem] flex-col justify-end p-7 sm:p-8">
        <div className="mb-auto flex items-center justify-between"><span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-blue-200 backdrop-blur"><Icon size={20} /></span><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">{eyebrow}</p></div>
        <h3 className="max-w-sm text-3xl font-black leading-[0.94] tracking-[-0.045em] text-white sm:text-4xl">{title}</h3>
        <p className="mt-4 max-w-sm text-sm leading-6 text-slate-200">{copy}</p>
        <Link href={href} className="mt-7 inline-flex h-11 w-fit items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white hover:text-slate-950">{action}<ArrowRight size={16} /></Link>
      </div>
    </article>
  );
}

export default function Home() {
  useSEO({
    title: "FlowSites | Websites, AI Automation & Cinematic Video",
    description: "FlowSites builds high-performance websites, intelligent AI automation, and cinematic video production for businesses ready to stand apart.",
    canonical: "/",
  });

  return (
    <div className="overflow-hidden bg-white text-slate-950">
      <section className="relative isolate overflow-hidden bg-[#020814] pt-28 text-white sm:pt-32">
        <img src={HERO_VISUAL} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-[66%_center]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,8,20,0.98)_0%,rgba(2,8,20,0.91)_36%,rgba(2,8,20,0.47)_61%,rgba(2,8,20,0.28)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(2,8,20,0.55)_0%,transparent_36%)]" />
        <div className="container grid min-h-[43rem] items-center gap-12 py-16 lg:grid-cols-[0.78fr_1.22fr] lg:py-24">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-300/25 bg-blue-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100 backdrop-blur"><Sparkles size={13} /> Websites · AI automation · cinematic video</p>
            <h1 className="mt-7 text-5xl font-black leading-[0.91] tracking-[-0.065em] text-white sm:text-6xl lg:text-8xl">Your Vision.<br />Engineered <span className="bg-gradient-to-r from-blue-300 via-blue-400 to-sky-300 bg-clip-text text-transparent">Into Reality.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">High-performance websites. Intelligent AI automation. Cinematic video production. Everything your business needs to stand apart.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href="#services" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 text-sm font-bold text-white shadow-[0_14px_38px_rgba(37,99,235,0.42)] transition hover:bg-blue-400 active:scale-[0.98]">Explore our services <ArrowRight size={16} /></a><Link href="/portfolio" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/[0.07] px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white hover:text-slate-950 active:scale-[0.98]"><Play size={15} /> View our work</Link></div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-blue-50/80"><span className="inline-flex items-center gap-2"><Globe2 size={16} className="text-blue-300" />Websites from $499</span><span className="inline-flex items-center gap-2"><Clock3 size={16} className="text-blue-300" />48-hour qualifying delivery</span><span className="inline-flex items-center gap-2"><Bot size={16} className="text-blue-300" />AI-powered automation</span><span className="inline-flex items-center gap-2"><Film size={16} className="text-blue-300" />Cinematic video production</span></div>
          </div>
          <div className="hidden lg:block" aria-hidden="true" />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-5"><div className="container flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">Built for business</span><span className="hidden h-1 w-1 rounded-full bg-blue-500 sm:block" /><p className="text-sm font-semibold text-slate-800">Professional websites starting at $499. Qualifying sites delivered in 48 hours.</p></div></section>

      <section id="services" className="scroll-mt-20 bg-[#f7faff] py-20 sm:py-28"><div className="container"><div className="mx-auto max-w-3xl text-center"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">One creative technology partner</p><h2 className="mt-4 text-4xl font-black leading-[0.95] tracking-[-0.05em] text-slate-950 sm:text-6xl">Built to look extraordinary. Engineered to work harder.</h2><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">FlowSites brings the public experience, the customer workflow, and the campaign creative together under one considered system.</p></div><div className="mt-12 grid gap-5 lg:grid-cols-3"><EditorialServicePanel eyebrow="01 · Digital presence" title="Website Design & Development" copy="Custom, conversion-minded websites designed around how your customers decide, book, and buy." image={SERVICE_VISUALS.websites} href="/#packages" action="Explore website packages" icon={Globe2} /><EditorialServicePanel eyebrow="02 · Operational edge" title="AI Business Automation" copy="Practical customer follow-up and business workflows that help your team stay responsive without a generic tech stack." image={SERVICE_VISUALS.automation} href="/ai-services" action="Explore AI services" icon={WandSparkles} /><EditorialServicePanel eyebrow="03 · Creative impact" title="AI Video Production" copy="Cinematic promotional concepts, professionally shaped and finished by the FlowSites production team." image={SERVICE_VISUALS.video} href="/ai-video-studio" action="Explore AI Video Studio" icon={Film} /></div></div></section>

      <section className="relative isolate overflow-hidden bg-[#020815] py-20 text-white sm:py-28"><div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_22%,rgba(37,99,235,0.28),transparent_25%),radial-gradient(circle_at_15%_88%,rgba(14,165,233,0.15),transparent_30%)]" /><div className="container"><div className="grid items-end gap-8 lg:grid-cols-[0.82fr_1.18fr]"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">Cinematic · engaging · built for business</p><h2 className="mt-4 text-4xl font-black leading-[0.93] tracking-[-0.055em] sm:text-6xl">AI Video Studio</h2><p className="mt-5 max-w-xl text-base leading-7 text-slate-300">Professional promotional videos powered by AI creativity and finished by our production team. The gallery uses real, playable FlowSites demonstration clips—not static placeholders.</p><ul className="mt-7 grid gap-3 text-sm text-blue-100 sm:grid-cols-2"><li className="flex items-center gap-2"><Check size={16} className="text-blue-300" />Social media ads</li><li className="flex items-center gap-2"><Check size={16} className="text-blue-300" />Business formats</li><li className="flex items-center gap-2"><Check size={16} className="text-blue-300" />Website promos</li><li className="flex items-center gap-2"><Check size={16} className="text-blue-300" />Landscape or portrait delivery</li></ul><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/ai-video-studio#video-order" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400">Order a video <ArrowRight size={16} /></Link><Link href="/ai-video-studio" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-5 text-sm font-bold text-white transition hover:bg-white hover:text-slate-950">Explore AI Video Studio <ExternalLink size={15} /></Link></div></div><div className="grid gap-4 md:grid-cols-[1.4fr_0.6fr]"><VideoPreviewCard item={videoStudioPreviews[0]} /><div className="grid gap-4">{videoStudioPreviews.slice(1).map(item => <VideoPreviewCard key={item.label} item={item} compact />)}</div></div></div><p className="mt-6 text-xs leading-5 text-slate-400">Original FlowSites demonstration concepts. Playback is muted; mobile and reduced-motion visitors initiate playback themselves.</p></div></section>

      <section id="packages" className="scroll-mt-24 bg-white py-20 sm:py-28"><div className="container"><div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-10 sm:flex-row sm:items-end"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Simple pricing. Serious results.</p><h2 className="mt-4 text-4xl font-black leading-[0.94] tracking-[-0.05em] text-slate-950 sm:text-6xl">Website packages built for the next move.</h2><p className="mt-5 text-base leading-7 text-slate-600">Professional websites and automation systems with transparent one-time setup pricing.</p></div><div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold"><span className="rounded-lg bg-blue-600 px-3 py-2 text-white">One-time setup</span><span className="px-3 py-2 text-slate-500">Ongoing tools quoted separately</span></div></div><div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">{packages.map(pkg => <article key={pkg.name} className={`relative flex min-h-[31rem] flex-col rounded-[1.7rem] border p-7 transition hover:-translate-y-1 hover:shadow-xl ${pkg.popular ? "border-blue-500 bg-[linear-gradient(155deg,#f7fbff_0%,#ffffff_72%)] shadow-[0_20px_55px_rgba(37,99,235,0.14)]" : "border-slate-200 bg-white shadow-sm"}`}>{pkg.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">Most popular</span>}<p className="text-2xl font-black tracking-tight text-slate-950">{pkg.name}</p><p className="mt-3 min-h-11 text-sm leading-5 text-slate-600">{pkg.description}</p><div className="mt-7 flex items-end gap-2"><span className="text-5xl font-black tracking-[-0.06em] text-slate-950">{pkg.price}</span><span className="mb-1 text-sm text-slate-500">one-time setup</span></div><ul className="mt-7 flex-1 space-y-3 border-t border-slate-100 pt-6">{pkg.features.map(feature => <li key={feature} className="flex items-start gap-2.5 text-sm leading-5 text-slate-700"><Check size={16} className="mt-0.5 shrink-0 text-blue-600" strokeWidth={3} />{feature}</li>)}</ul><Link href={leadCaptureHref({ intent: `Start the ${pkg.name} package`, packageId: pkg.id })} className={`mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition active:scale-[0.98] ${pkg.popular ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700" : "bg-slate-100 text-slate-900 hover:bg-slate-200"}`}>Get started <ArrowRight size={15} /></Link><p className="mt-3 min-h-8 text-center text-[11px] leading-4 text-slate-500">We confirm scope and any ongoing fees before secure checkout.</p></article>)}</div><p className="mx-auto mt-7 max-w-4xl text-center text-xs leading-5 text-slate-500">Prices shown are one-time setup fees. Domain registration, hosting, paid software, CRM, messaging, maintenance, and AI usage are separate unless the final scope says otherwise. Secure checkout is only presented after the selected package, scope, and ongoing costs are confirmed.</p></div></section>

      <section className="bg-[#f7faff] py-20 sm:py-28"><div className="container"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Real businesses. Real projects.</p><h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">Featured work built around a clear customer journey.</h2></div><Link href="/portfolio" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700">View more projects <ArrowRight size={15} /></Link></div><div className="mt-12 grid gap-5 md:grid-cols-3">{projects.map(project => <Link key={project.name} href={project.href} className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/10"><div className="aspect-[16/10] overflow-hidden bg-slate-100"><img src={project.image} alt={project.alt} className={`h-full w-full object-cover ${project.imageClassName} transition duration-700 group-hover:scale-105`} /></div><div className="p-6"><h3 className="text-xl font-black tracking-tight text-slate-950">{project.name}</h3><p className="mt-2 text-sm text-slate-500">{project.subtitle}</p><span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600">View project <ArrowRight size={14} /></span></div></Link>)}</div></div></section>

      <section className="bg-white py-20 sm:py-24"><div className="container grid gap-5 md:grid-cols-3"><article className="rounded-[1.5rem] border border-slate-200 p-7"><MousePointerClick className="h-6 w-6 text-blue-600" /><h3 className="mt-5 text-xl font-black tracking-tight">Purpose before polish</h3><p className="mt-3 text-sm leading-6 text-slate-600">Every visual decision supports the action your customer needs to take: inquire, book, call, or buy.</p></article><article className="rounded-[1.5rem] border border-slate-200 p-7"><ShieldCheck className="h-6 w-6 text-blue-600" /><h3 className="mt-5 text-xl font-black tracking-tight">Scope before surprise costs</h3><p className="mt-3 text-sm leading-6 text-slate-600">The selected package, delivery inputs, and any ongoing tools are reviewed in writing before payment is requested.</p></article><article className="rounded-[1.5rem] border border-slate-200 p-7"><ShoppingCart className="h-6 w-6 text-blue-600" /><h3 className="mt-5 text-xl font-black tracking-tight">One practical partner</h3><p className="mt-3 text-sm leading-6 text-slate-600">From the public website to production assets and customer workflow, you get an organized path forward.</p></article></div></section>

      <section className="relative isolate overflow-hidden bg-[#030b1c] py-20 text-white sm:py-28"><div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_10%,rgba(37,99,235,0.35),transparent_28%),radial-gradient(circle_at_95%_90%,rgba(14,165,233,0.2),transparent_25%)]" /><div className="container grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16"><div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">Get a free website review</p><h2 className="mt-4 text-4xl font-black leading-[0.94] tracking-[-0.05em] sm:text-5xl">See the next opportunity in your current website.</h2><p className="mt-5 text-base leading-7 text-slate-300">Share a few details about your business and website. We’ll review what you send and recommend a practical next step—no obligation.</p><div className="mt-8 space-y-4 text-sm text-slate-200"><p className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-blue-200"><Globe2 size={17} /></span><span><strong className="text-white">Focused feedback</strong><br />A clear look at your current customer journey.</span></p><p className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-blue-200"><MessageSquareText size={17} /></span><span><strong className="text-white">Actionable next step</strong><br />Advice based on the business goal you select.</span></p><p className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-blue-200"><Smartphone size={17} /></span><span><strong className="text-white">Mobile-minded review</strong><br />A quick look at how your site supports visitors on the go.</span></p></div></div><FreeWebsiteReview /></div></section>

      <section className="border-t border-slate-200 bg-white py-12"><div className="container"><p className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Delivery terms, in plain language</p><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[{ title: "48-hour delivery", copy: "Available for qualifying standard sites once payment, scope, and complete materials are received." }, { title: "Revisions", copy: "Revision rounds are limited to the agreed written scope; they are not unlimited." }, { title: "Hosting & domain", copy: "Separate ongoing costs unless specifically included in the final checkout." }, { title: "Third-party tools", copy: "CRM, booking, messaging, payment, and AI subscriptions are billed by their providers unless included." }].map(item => <div key={item.title} className="border-l-2 border-blue-500 pl-4"><h3 className="text-sm font-extrabold text-slate-950">{item.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{item.copy}</p></div>)}</div></div></section>
    </div>
  );
}
