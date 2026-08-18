import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { leadCaptureHref } from "@/lib/leadCapture";
import {
  ArrowRight,
  Sparkles,
  Scissors,
  Dumbbell,
  Shield,
  Stethoscope,
  Brain,
  Home as HomeIcon,
  DollarSign,
  MoreHorizontal,
  ShoppingCart,
  Users,
  MessageSquare,
  CalendarCheck,
  Heart,
  TrendingUp,
  ChevronRight,
  Search,
  Send,
  Bell,
  BarChart3,
  Settings,
  Zap,
} from "lucide-react";

// ─── Avatar stack component ───────────────────────────────────────────────────
const AVATAR_PHOTOS = [
  "/avatars/avatar1.jpg",
  "/avatars/avatar2.jpg",
  "/avatars/avatar3.jpg",
  "/avatars/avatar4.jpg",
  "/avatars/avatar5.jpg",
];
function AvatarStack() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {AVATAR_PHOTOS.map((src, i) => (
          <img
            key={i}
            src={src}
            alt="Business owner"
            className="w-9 h-9 rounded-full border-2 border-white object-cover object-top"
            style={{ zIndex: 5 - i }}
          />
        ))}
      </div>
      <span className="text-sm text-gray-500">
        Trusted by <span className="text-gray-900 font-semibold">5,000+</span> businesses
      </span>
    </div>
  );
}

// ─── Prompt quick actions ─────────────────────────────────────────────────────
const quickActions = [
  { icon: Users, label: "Get more leads" },
  { icon: CalendarCheck, label: "Book more appointments" },
  { icon: DollarSign, label: "Collect payments" },
  { icon: Zap, label: "Run a promotion" },
  { icon: BarChart3, label: "Analyze my business" },
];

// ─── Industries ───────────────────────────────────────────────────────────────
const industries = [
  { icon: Scissors, label: "Hair Salons" },
  { icon: Scissors, label: "Stitched /\nEmbroidery" },
  { icon: Dumbbell, label: "Gyms &\nFitness" },
  { icon: Shield, label: "Martial Arts" },
  { icon: Stethoscope, label: "Dental\nOffices" },
  { icon: Brain, label: "Counseling &\nWellness" },
  { icon: HomeIcon, label: "Home\nServices" },
  { icon: DollarSign, label: "Financial\nServices" },
  { icon: ShoppingCart, label: "E-Commerce" },
  { icon: MoreHorizontal, label: "More\nIndustries" },
];

// ─── How it works steps ───────────────────────────────────────────────────────
const steps = [
  {
    number: "1",
    title: "Capture",
    description: "Get more leads from your website, ads, forms, and every channel.",
    color: "#818cf8",
  },
  {
    number: "2",
    title: "Engage",
    description: "AI responds instantly, qualifies leads, and keeps them interested.",
    color: "#60a5fa",
  },
  {
    number: "3",
    title: "Convert",
    description: "Book appointments, collect payments, and close more sales.",
    color: "#4ade80",
  },
  {
    number: "4",
    title: "Delight",
    description: "Deliver amazing service and build customers for life.",
    color: "#fbbf24",
  },
  {
    number: "5",
    title: "Grow",
    description: "Automate marketing, get reviews, referrals, and repeat business.",
    color: "#818cf8",
  },
];

// ─── Dashboard mockup data ────────────────────────────────────────────────────
const dashboardStats = [
  { label: "New Leads", value: "32", change: "+28%", positive: true },
  { label: "Appointments", value: "18", change: "+22%", positive: true },
  { label: "Revenue", value: "$7,842", change: "+36%", positive: true },
  { label: "Customers", value: "412", change: "+19%", positive: true },
];

const upcomingAppointments = [
  { time: "9:00 AM", name: "Haircut — Sarah J." },
  { time: "10:30 AM", name: "Personal Training — Mike" },
  { time: "12:00 PM", name: "Embroidery Pickup — Anna" },
  { time: "2:00 PM", name: "Dental Cleaning — John D." },
  { time: "4:00 PM", name: "Kickboxing Class — Kids" },
];

const sidebarItems = [
  { icon: BarChart3, label: "Dashboard", active: true },
  { icon: Users, label: "Leads" },
  { icon: MessageSquare, label: "Conversations" },
  { icon: CalendarCheck, label: "Appointments" },
  { icon: Heart, label: "Customers" },
  { icon: DollarSign, label: "Payments" },
  { icon: TrendingUp, label: "Marketing" },
  { icon: BarChart3, label: "Reports" },
  { icon: Sparkles, label: "AI Assistant" },
  { icon: Settings, label: "Settings" },
];

// ─── Mini sparkline chart ─────────────────────────────────────────────────────
function Sparkline() {
  const points = [1200, 2100, 1800, 3200, 2800, 4100, 5200, 4800, 6100, 7842];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 260, h = 80;
  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h * 0.85 - 5;
    return `${x},${y}`;
  });
  const pathD = `M ${coords.join(" L ")}`;
  const areaD = `M 0,${h} L ${coords.join(" L ")} L ${w},${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#sparkGrad)" />
      <path d={pathD} fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((v, i) => {
        const [x, y] = coords[i].split(",").map(Number);
        return i === points.length - 1 ? (
          <circle key={i} cx={x} cy={y} r="4" fill="#818cf8" />
        ) : null;
      })}
    </svg>
  );
}

// ─── Animated prompt bar ──────────────────────────────────────────────────────
const prompts = [
  "What would you like to accomplish today?",
  "How can I help grow your business?",
  "Want to capture more leads automatically?",
  "Ready to automate your follow-ups?",
];

function AnimatedPromptBar() {
  const [, navigate] = useLocation();
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focused) return;
    const target = prompts[idx];
    let i = 0;
    setDisplayed("");
    setTyping(true);
    const interval = setInterval(() => {
      i++;
      setDisplayed(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(interval);
        setTyping(false);
        setTimeout(() => {
          setIdx(prev => (prev + 1) % prompts.length);
        }, 2500);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [idx, focused]);

  const handleSubmit = () => {
    const q = userInput.trim() || displayed;
    navigate(leadCaptureHref({ prompt: q }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      className="relative w-full max-w-2xl mx-auto"
      style={{
        background: "#fff",
        border: focused ? "1px solid #3b82f6" : "1px solid #e2e8f0",
        borderRadius: "9999px",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        transition: "border-color 0.2s",
        cursor: "text",
        boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.12)" : "0 2px 12px rgba(0,0,0,0.06)",
      }}
      onClick={() => { setFocused(true); inputRef.current?.focus(); }}
    >
      <Sparkles size={18} style={{ color: "#3b82f6", flexShrink: 0 }} />
      {focused || userInput ? (
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => { if (!userInput) setFocused(false); }}
          placeholder="What would you like to accomplish today?"
          autoFocus
          className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
        />
      ) : (
        <span className="flex-1 text-sm text-gray-400 text-left cursor-text">
          {displayed}
          {typing && <span className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 animate-pulse align-middle" />}
        </span>
      )}
      <button
        onClick={e => { e.stopPropagation(); handleSubmit(); }}
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
        style={{ background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)" }}
      >
        <Send size={14} className="text-white" style={{ transform: "translateX(1px)" }} />
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Home() {
  const [, navigate] = useLocation();
  const [activeIndustry, setActiveIndustry] = useState(0);

  return (
    <div style={{ background: "#f8faff", color: "#111", fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>

      {/* ══════════════════════ HERO SECTION ══════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center pt-24 pb-16 px-4"
        style={{ overflow: "hidden" }}
      >
        {/* Glowing orb background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(59,130,246,0.12) 0%, rgba(6,182,212,0.06) 50%, transparent 80%)",
          }}
        />
        {/* Outer ring glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            border: "1px solid rgba(59,130,246,0.12)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -35%)",
            boxShadow: "0 0 120px 40px rgba(59,130,246,0.06)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            border: "1px solid rgba(6,182,212,0.10)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -35%)",
          }}
        />

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-semibold tracking-widest uppercase"
          style={{
            background: "rgba(59,130,246,0.10)",
            border: "1px solid rgba(59,130,246,0.22)",
            color: "#3b82f6",
          }}
        >
          AI Operating System
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6 max-w-4xl"
          style={{ letterSpacing: "-0.03em", color: "#0f172a" }}
        >
          Run your business.<br />
          <span style={{ background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI runs the rest.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg max-w-xl mb-10 leading-relaxed" style={{ color: "#64748b" }}>
          From lead to loyal customer. Automate follow-ups, collect payments,
          book appointments, and grow on autopilot.
        </p>

        {/* Prompt bar */}
        <div className="w-full max-w-2xl mb-6">
          <AnimatedPromptBar />
        </div>

        {/* Quick action pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {quickActions.map((a, i) => (
            <button
              key={i}
              onClick={() => navigate(leadCaptureHref({ intent: a.label }))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                color: "#475569",
              }}
            >
              <a.icon size={12} style={{ color: "#3b82f6" }} />
              {a.label}
            </button>
          ))}
        </div>

        {/* Trust bar */}
        <AvatarStack />
      </section>

      {/* ══════════════════════ INDUSTRIES SECTION ══════════════════════ */}
      <section style={{ background: "#fff", padding: "64px 0", borderTop: "1px solid #f1f5f9" }}>
        <div className="container">
          <h2
            className="text-center text-2xl sm:text-3xl font-bold mb-12"
            style={{ color: "#0f0f0f", letterSpacing: "-0.02em" }}
          >
            One platform for every service business
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            {industries.map((ind, i) => (
              <button
                key={i}
                onClick={() => setActiveIndustry(i)}
                className="flex flex-col items-center gap-2 group"
                style={{ minWidth: "72px" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
                  style={{
                    background: activeIndustry === i ? "rgba(59,130,246,0.10)" : "#f8faff",
                    border: activeIndustry === i ? "1px solid rgba(59,130,246,0.3)" : "1px solid #e2e8f0",
                  }}
                >
                  <ind.icon
                    size={22}
                    style={{ color: activeIndustry === i ? "#3b82f6" : "#64748b" }}
                  />
                </div>
                <span
                  className="text-xs font-medium text-center leading-tight whitespace-pre-line"
                  style={{ color: activeIndustry === i ? "#3b82f6" : "#64748b" }}
                >
                  {ind.label}
                </span>
                {activeIndustry === i && (
                  <div className="w-6 h-0.5 rounded-full" style={{ background: "#3b82f6" }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
      <section style={{ background: "#f8faff", padding: "80px 0 96px" }}>
        <div className="container">
          <h2
            className="text-center text-2xl sm:text-3xl font-bold mb-16"
            style={{ color: "#0f0f0f", letterSpacing: "-0.02em" }}
          >
            How Flow Sites works for you
          </h2>
          <div className="flex flex-col md:flex-row items-stretch gap-0">
            {steps.map((step, i) => (
              <div key={i} className="flex md:flex-col items-start md:items-center flex-1">
                <div
                  className="flex flex-col md:items-center text-center p-6 rounded-2xl flex-1 w-full"
                  style={{
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                  }}
                >
                  {/* Icon circle */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto"
                    style={{ background: `${step.color}18`, border: `1px solid ${step.color}30` }}
                  >
                    {i === 0 && <Users size={22} style={{ color: step.color }} />}
                    {i === 1 && <MessageSquare size={22} style={{ color: step.color }} />}
                    {i === 2 && <CalendarCheck size={22} style={{ color: step.color }} />}
                    {i === 3 && <Heart size={22} style={{ color: step.color }} />}
                    {i === 4 && <TrendingUp size={22} style={{ color: step.color }} />}
                  </div>
                  <div className="text-sm font-semibold text-gray-400 mb-1">{step.number}. {step.title}</div>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                  <div className="mt-4 h-0.5 w-8 rounded-full mx-auto" style={{ background: step.color }} />
                </div>
                {/* Arrow connector */}
                {i < steps.length - 1 && (
                  <div className="hidden md:flex items-center justify-center w-8 shrink-0">
                    <ChevronRight size={18} style={{ color: "#ccc" }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ DASHBOARD MOCKUP ══════════════════════ */}
      <section className="homepage-light-preview" style={{ padding: "96px 0" }}>
        <div className="container">
          <div
            className="rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 40px 90px rgba(37,99,235,0.12)" }}
          >
            {/* Dashboard top bar */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "#818cf8" }}
                >
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Good morning, Alex 👋</div>
                  <div className="text-xs text-white/40">Here's what's happening with your business today.</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="px-3 py-1.5 rounded-lg text-xs text-white/60 flex items-center gap-1"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  Today, May 15 ▾
                </div>
                <div className="relative">
                  <Bell size={16} className="text-white/50" />
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white font-bold">3</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white">A</div>
              </div>
            </div>

            <div className="flex">
              {/* Sidebar */}
              <div
                className="hidden lg:flex flex-col py-4 px-3 gap-1"
                style={{ width: "180px", borderRight: "1px solid rgba(255,255,255,0.06)", minHeight: "520px" }}
              >
                {sidebarItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer"
                    style={{
                      background: i === 0 ? "rgba(129,140,248,0.15)" : "transparent",
                      color: i === 0 ? "#818cf8" : "rgba(255,255,255,0.45)",
                    }}
                  >
                    <item.icon size={14} />
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {dashboardStats.map((stat, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-4"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="text-xs text-white/40 mb-1 uppercase tracking-wide">{stat.label}</div>
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-xs" style={{ color: "#4ade80" }}>{stat.change} vs yesterday</div>
                    </div>
                  ))}
                </div>

                {/* Bottom panels */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Revenue chart */}
                  <div
                    className="lg:col-span-1 rounded-xl p-4"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-semibold text-white/60">Revenue Overview</div>
                      <div className="text-xs text-white/30">Last 7 Days ▾</div>
                    </div>
                    <div className="text-xl font-bold text-white mb-0.5">$7,842</div>
                    <div className="text-xs mb-3" style={{ color: "#4ade80" }}>+36% vs last 7 days</div>
                    <Sparkline />
                    <div className="flex justify-between mt-2">
                      {["May 9","May 10","May 11","May 12","May 13","May 14","May 15"].map(d => (
                        <span key={d} className="text-[9px] text-white/25">{d.replace("May ","")}</span>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming */}
                  <div
                    className="rounded-xl p-4"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-semibold text-white/60">Upcoming Today</div>
                      <span className="text-xs" style={{ color: "#818cf8" }}>View all</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {upcomingAppointments.map((a, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#3b82f6" }} />
                          <span className="text-xs text-white/40 w-16 shrink-0">{a.time}</span>
                          <span className="text-xs text-white/70 truncate">{a.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Assistant */}
                  <div
                    className="rounded-xl p-4"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="text-xs font-semibold text-white/60 mb-1">AI Assistant (Kai)</div>
                    <div className="text-xs text-white/40 mb-3">Kai is ready to help you grow.</div>
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-3"
                      style={{ background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.2)" }}
                    >
                      <span className="text-xs text-white/50 flex-1">Ask Kai anything...</span>
                      <ArrowRight size={12} style={{ color: "#818cf8" }} />
                    </div>
                    {["Find leads that didn't book", "Create a summer promotion", "Show me at-risk customers"].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 py-1.5">
                        <Sparkles size={10} style={{ color: "#818cf8" }} />
                        <span className="text-xs text-white/40">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ BOTTOM CTA ══════════════════════ */}
      <section className="homepage-light-cta" style={{ padding: "80px 0" }}>
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.25)" }}
              >
                <Sparkles size={28} style={{ color: "#818cf8" }} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1" style={{ letterSpacing: "-0.02em" }}>
                  Your business. Supercharged.
                </h3>
                <p className="text-sm text-white/50">
                  Join thousands of business owners saving time,<br className="hidden md:block" />
                  making more money, and growing faster with Flow Sites.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                href={leadCaptureHref({ intent: "Start a free trial" })}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "#fff", color: "#1e3a8a", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}
              >
                Start Free Trial <ArrowRight size={16} />
              </Link>
              <Link
                href={leadCaptureHref({ intent: "Book a demo" })}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.30)" }}
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
