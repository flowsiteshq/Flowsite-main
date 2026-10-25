import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Check,
  Clapperboard,
  FileImage,
  Film,
  Loader2,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  Upload,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useSEO } from "@/hooks/useSEO";

const VIDEO_PACKAGES = [
  {
    id: "social_spark" as const,
    name: "Social Spark",
    price: "$149",
    duration: "15 seconds",
    description: "A concise social-first concept for a single message, offer, or moment.",
    features: ["One focused creative concept", "Landscape or portrait delivery", "One review round"],
  },
  {
    id: "business_spotlight" as const,
    name: "Business Spotlight",
    price: "$299",
    duration: "30 seconds",
    description: "A polished brand story designed to introduce your business and invite action.",
    features: ["Narrative creative direction", "Landscape or portrait delivery", "One review round"],
    highlighted: true,
  },
  {
    id: "cinematic_pro" as const,
    name: "Cinematic Pro",
    price: "$599",
    duration: "Up to 60 seconds",
    description: "A fuller production for launches, services, campaigns, and brand storytelling.",
    features: ["Expanded story treatment", "Landscape or portrait delivery", "Two review rounds"],
  },
] as const;

const SHOWCASES = [
  {
    id: "automotive",
    label: "Automotive",
    title: "Precision in motion",
    description: "A cinematic concept for premium vehicle care and dealership campaigns.",
    video: "/video-studio/automotive-showcase.mp4",
    poster: "/video-studio/automotive-poster.jpg",
  },
  {
    id: "restaurant",
    label: "Restaurant",
    title: "Made for the moment",
    description: "A warm editorial concept for hospitality, menus, and memorable experiences.",
    video: "/video-studio/restaurant-showcase.mp4",
    poster: "/video-studio/restaurant-poster.jpg",
  },
  {
    id: "professional-services",
    label: "Professional services",
    title: "Confidence, made visible",
    description: "A clear, composed concept for experts, advisors, and modern firms.",
    video: "/video-studio/professional-services-showcase.mp4",
    poster: "/video-studio/professional-services-poster.jpg",
  },
] as const;

type PackageId = (typeof VIDEO_PACKAGES)[number]["id"];
type AspectRatio = "landscape" | "portrait";

type OrderForm = {
  clientName: string;
  businessName: string;
  email: string;
  phone: string;
  businessDescription: string;
  videoGoal: string;
  callToAction: string;
};

function useMotionPreference() {
  const [reduced, setReduced] = useState(false);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const update = () => {
      setReduced(motionQuery.matches);
      setDesktop(desktopQuery.matches);
    };
    update();
    motionQuery.addEventListener("change", update);
    desktopQuery.addEventListener("change", update);
    return () => {
      motionQuery.removeEventListener("change", update);
      desktopQuery.removeEventListener("change", update);
    };
  }, []);

  return { reduced, desktop };
}

function ShowcaseCard({ item, reducedMotion, allowAutoplay }: { item: (typeof SHOWCASES)[number]; reducedMotion: boolean; allowAutoplay: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const start = async () => {
    if (reducedMotion || !videoRef.current) return;
    try {
      await videoRef.current.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const stop = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setPlaying(false);
  };

  const toggle = async () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      try {
        await videoRef.current.play();
        setPlaying(true);
      } catch {
        toast.error("Video preview could not start. Please try again.");
      }
    }
  };

  return (
    <article
      className="group overflow-hidden rounded-[1.8rem] border border-blue-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-950/10"
      onMouseEnter={() => { if (allowAutoplay) void start(); }}
      onMouseLeave={stop}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <video
          ref={videoRef}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
          src={item.video}
          poster={item.poster}
          muted
          loop
          playsInline
          preload={allowAutoplay ? "metadata" : "none"}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/5 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-200">Original demonstration concept</p>
            <h3 className="mt-1 text-xl font-extrabold tracking-tight">{item.title}</h3>
          </div>
          <button
            type="button"
            onClick={() => void toggle()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur transition hover:bg-white hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-white/40"
            aria-label={`${playing ? "Pause" : "Play"} ${item.label} video concept`}
          >
            {playing ? <Pause size={17} fill="currentColor" /> : <Play size={18} fill="currentColor" className="translate-x-0.5" />}
          </button>
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm leading-6 text-slate-600">{item.description}</p>
        <p className="mt-3 text-xs font-medium text-slate-400">Created by FlowSites Video Studio. Not client work.</p>
      </div>
    </article>
  );
}

function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read this file."));
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",", 2)[1] : result);
    };
    reader.readAsDataURL(file);
  });
}

export default function AIVideoStudio() {
  useSEO({
    title: "AI Video Studio | FlowSites",
    description: "Premium promotional videos shaped with AI creativity and finished by the FlowSites production team.",
    canonical: "/ai-video-studio",
  });

  const { reduced, desktop } = useMotionPreference();
  const [selectedPackage, setSelectedPackage] = useState<PackageId>("business_spotlight");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("landscape");
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState<OrderForm>({
    clientName: "",
    businessName: "",
    email: "",
    phone: "",
    businessDescription: "",
    videoGoal: "",
    callToAction: "",
  });

  const createOrder = trpc.videoStudio.createOrder.useMutation();
  const uploadBrandAsset = trpc.videoStudio.uploadBrandAsset.useMutation();
  const createCheckout = trpc.videoStudio.createCheckout.useMutation();
  const orderState = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("order") : null;
  const selected = useMemo(() => VIDEO_PACKAGES.find(item => item.id === selectedPackage)!, [selectedPackage]);
  const isSubmitting = createOrder.isPending || uploadBrandAsset.isPending || createCheckout.isPending;

  const update = (field: keyof OrderForm, value: string) => setForm(current => ({ ...current, [field]: value }));

  const selectPackage = (packageId: PackageId) => {
    setSelectedPackage(packageId);
    document.getElementById("video-order")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  const addFiles = (fileList: FileList | null) => {
    const incoming = Array.from(fileList ?? []);
    const allowed = incoming.filter(file => ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "application/pdf"].includes(file.type));
    const smallEnough = allowed.filter(file => file.size <= 5 * 1024 * 1024);
    if (allowed.length !== incoming.length || smallEnough.length !== allowed.length) {
      toast.error("Brand assets must be PNG, JPG, WebP, SVG, or PDF files under 5 MB.");
    }
    setFiles(current => [...current, ...smallEnough].slice(0, 5));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const order = await createOrder.mutateAsync({
        clientName: form.clientName,
        businessName: form.businessName,
        email: form.email,
        phone: form.phone || undefined,
        packageId: selectedPackage,
        businessDescription: form.businessDescription,
        videoGoal: form.videoGoal || undefined,
        callToAction: form.callToAction || undefined,
        requestedAspectRatio: aspectRatio,
      });

      for (const file of files) {
        await uploadBrandAsset.mutateAsync({
          orderId: order.orderId,
          uploadToken: order.uploadToken,
          fileName: file.name,
          mimeType: file.type,
          base64Data: await toBase64(file),
        });
      }

      const checkout = await createCheckout.mutateAsync({
        orderId: order.orderId,
        uploadToken: order.uploadToken,
        origin: window.location.origin,
      });
      window.location.assign(checkout.checkoutUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not begin secure checkout. Please try again.");
    }
  };

  return (
    <div className="overflow-hidden bg-white text-slate-950">
      <section className="relative isolate overflow-hidden border-b border-blue-100 bg-[radial-gradient(circle_at_72%_18%,rgba(37,99,235,0.18),transparent_28%),linear-gradient(150deg,#071630_0%,#0d2d66_45%,#1f72da_130%)] py-28 sm:py-32">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.13)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="container relative grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-100 backdrop-blur"><Sparkles size={14} /> FlowSites AI Video Studio</div>
            <h1 className="mt-6 text-5xl font-black leading-[0.94] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">Your Brand. Your Story. <span className="text-blue-300">Brought to Life.</span></h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-blue-50/85 sm:text-xl">Professional promotional videos powered by AI creativity and finished by our production team.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#video-order" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-blue-800 shadow-xl shadow-blue-950/20 transition hover:bg-blue-50">Create Your Video Ad <ArrowRight size={16} /></a>
              <a href="#showcase" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15">View concepts <Play size={15} /></a>
            </div>
            <p className="mt-5 text-xs leading-5 text-blue-100/70">A production service—not a self-serve generator. Every order is reviewed, shaped, and delivered by the FlowSites team.</p>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-8 rounded-[3rem] bg-blue-300/15 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-2xl shadow-blue-950/30 backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/15 pb-4 text-sm text-blue-50"><span className="flex items-center gap-2 font-bold"><Clapperboard size={18} /> Production preview</span><span className="rounded-full bg-emerald-300/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">Human-finished</span></div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {SHOWCASES.map((showcase, index) => <div key={showcase.id} className={`rounded-2xl border border-white/15 p-3 ${index === 1 ? "bg-white/15" : "bg-white/5"}`}><Film className="h-5 w-5 text-blue-200" /><p className="mt-6 text-xs font-bold text-white">{showcase.label}</p><p className="mt-1 text-[10px] leading-4 text-blue-100/70">Original concept</p></div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="showcase" className="scroll-mt-24 bg-[#f7fbff] py-20 sm:py-24">
        <div className="container">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Studio showcase</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">Creative direction you can see</h2><p className="mt-4 text-base leading-7 text-slate-600">These are original FlowSites demonstration concepts. They show the type of visual storytelling our studio can develop—not customer testimonials or client campaign results.</p></div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {SHOWCASES.map(item => <ShowcaseCard key={item.id} item={item} reducedMotion={reduced} allowAutoplay={desktop && !reduced} />)}
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-white p-4 text-sm leading-6 text-slate-600"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" /> Video previews are muted, only start on intentional hover or play, and do not autoplay when reduced motion is enabled. Mobile playback is user initiated.</div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Simple production packages</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">A clear scope before production begins</h2><p className="mt-4 text-base leading-7 text-slate-600">Choose the format that matches your campaign. Your order details and brand assets are reviewed before the studio moves into production.</p></div>
          <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
            {VIDEO_PACKAGES.map(item => (
              <article key={item.id} className={`relative flex min-h-[29rem] flex-col rounded-[1.8rem] border bg-white p-7 shadow-sm ${item.id === "business_spotlight" ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-200"}`}>
                {item.id === "business_spotlight" && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">Most versatile</span>}
                <p className="text-xl font-extrabold tracking-tight text-slate-950">{item.name}</p><p className="mt-2 min-h-10 text-sm leading-5 text-slate-600">{item.description}</p>
                <div className="mt-6"><span className="text-4xl font-black tracking-[-0.05em] text-slate-950">{item.price}</span><span className="ml-2 text-sm text-slate-500">one-time</span></div><p className="mt-1 text-sm font-bold text-blue-600">{item.duration}</p>
                <ul className="mt-6 flex-1 space-y-3 border-t border-slate-100 pt-5">{item.features.map(feature => <li key={feature} className="flex items-start gap-2.5 text-sm leading-5 text-slate-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" strokeWidth={3} />{feature}</li>)}</ul>
                <button type="button" onClick={() => selectPackage(item.id)} className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700">Choose {item.name} <ArrowRight size={15} /></button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100 bg-[#f7fbff] py-16 sm:py-20">
        <div className="container grid gap-5 md:grid-cols-3">
          {[{ title: "1. Shape the brief", copy: "Tell us what your business needs to say, who it should reach, and the action you want viewers to take." }, { title: "2. Production & review", copy: "Our team uses the right creative tools for the brief, then prepares an approval-ready cut for your review." }, { title: "3. Delivery", copy: "Once approved, we provide the final video in the selected format and log its delivery in your order." }].map(step => <article key={step.title} className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm"><span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Production process</span><h3 className="mt-4 text-xl font-extrabold tracking-tight text-slate-950">{step.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{step.copy}</p></article>)}
        </div>
      </section>

      <section id="video-order" className="scroll-mt-24 bg-white py-20 sm:py-24">
        <div className="container grid items-start gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
          <div className="lg:sticky lg:top-28"><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Start your production</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Create Your Video Ad</h2><p className="mt-4 text-base leading-7 text-slate-600">Select a package, share the story, attach brand materials, then continue through secure Stripe checkout. We do not begin production until payment is confirmed.</p><div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-5"><p className="text-sm font-bold text-slate-950">Selected package</p><div className="mt-3 flex items-baseline justify-between gap-4"><div><p className="font-extrabold text-blue-700">{selected.name}</p><p className="mt-1 text-xs text-slate-500">{selected.duration}</p></div><p className="text-xl font-black text-slate-950">{selected.price}</p></div></div>{orderState === "success" && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">Thank you—your payment was received. Your Video Studio order is now queued for the FlowSites production team.</div>}{orderState === "cancelled" && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">Checkout was not completed. Your production has not started; you can update your brief and try again whenever you are ready.</div>}</div>

          <form onSubmit={submit} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 shadow-xl shadow-blue-950/5 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2"><label><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Your name</span><input required value={form.clientName} onChange={event => update("clientName", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Your name" /></label><label><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Business name</span><input required value={form.businessName} onChange={event => update("businessName", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Your business" /></label><label><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Email</span><input required type="email" value={form.email} onChange={event => update("email", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="you@business.com" /></label><label><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Phone <em className="normal-case font-normal">(optional)</em></span><input value={form.phone} onChange={event => update("phone", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="(555) 123-4567" /></label><label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Tell us about your business and the video</span><textarea required minLength={20} value={form.businessDescription} onChange={event => update("businessDescription", event.target.value)} className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="What do you offer, who is the video for, and what should it feel like?" /></label><label><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Primary goal <em className="normal-case font-normal">(optional)</em></span><input value={form.videoGoal} onChange={event => update("videoGoal", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Drive calls, bookings, awareness…" /></label><label><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Call to action <em className="normal-case font-normal">(optional)</em></span><input value={form.callToAction} onChange={event => update("callToAction", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Book now, visit us, learn more…" /></label></div>
            <fieldset className="mt-6"><legend className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Delivery orientation</legend><div className="mt-3 grid grid-cols-2 gap-3"><button type="button" onClick={() => setAspectRatio("landscape")} className={`rounded-xl border p-4 text-left transition ${aspectRatio === "landscape" ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200 bg-white hover:border-blue-200"}`}><Video className="h-5 w-5 text-blue-600" /><span className="mt-2 block text-sm font-bold text-slate-950">Landscape</span><span className="mt-1 block text-xs text-slate-500">Websites, YouTube, display</span></button><button type="button" onClick={() => setAspectRatio("portrait")} className={`rounded-xl border p-4 text-left transition ${aspectRatio === "portrait" ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200 bg-white hover:border-blue-200"}`}><Film className="h-5 w-5 text-blue-600" /><span className="mt-2 block text-sm font-bold text-slate-950">Portrait</span><span className="mt-1 block text-xs text-slate-500">Reels, Stories, Shorts</span></button></div></fieldset>
            <div className="mt-6"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Brand materials <span className="normal-case font-normal">(optional)</span></p><p className="mt-1 text-xs leading-5 text-slate-500">Upload up to five logo, photo, visual, or PDF references. PNG, JPG, WebP, SVG, or PDF; 5 MB each.</p></div><label className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"><Upload size={15} /> Add files<input type="file" className="sr-only" multiple accept="image/jpeg,image/png,image/webp,image/svg+xml,application/pdf" onChange={event => addFiles(event.target.files)} /></label></div>{files.length > 0 && <div className="mt-3 space-y-2">{files.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"><span className="flex min-w-0 items-center gap-2"><FileImage size={14} className="shrink-0 text-blue-600" /><span className="truncate">{file.name}</span></span><button type="button" className="text-slate-400 hover:text-red-600" onClick={() => setFiles(current => current.filter((_, fileIndex) => fileIndex !== index))} aria-label={`Remove ${file.name}`}><X size={15} /></button></div>)}</div>}</div>
            <button disabled={isSubmitting} type="submit" className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Preparing secure checkout</> : <>Continue to secure checkout — {selected.price}<ArrowRight size={16} /></>}</button><p className="mt-3 text-center text-xs leading-5 text-slate-500">You will review payment securely with Stripe. Production begins after payment is confirmed—not when this form is submitted.</p>
          </form>
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white"><div className="container flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-300">Need a complete brand experience?</p><h2 className="mt-2 text-2xl font-black tracking-tight">Pair your campaign with a FlowSites website.</h2></div><Link href="/#packages" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-slate-950 transition hover:bg-blue-50">Explore website packages <ArrowRight size={15} /></Link></div></section>
    </div>
  );
}
