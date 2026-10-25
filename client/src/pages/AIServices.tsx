import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Bot, CalendarCheck2, MessageSquareText, Send, Sparkles, UserRoundCheck } from "lucide-react";
import { leadCaptureHref } from "@/lib/leadCapture";
import { useSEO } from "@/hooks/useSEO";

const services = [
  {
    icon: MessageSquareText,
    title: "Customer follow-up",
    copy: "Plan a practical way to acknowledge inquiries and keep the conversation moving after someone reaches out.",
  },
  {
    icon: CalendarCheck2,
    title: "Appointment support",
    copy: "Pair your website with the right booking flow so customers have a clear next step when they are ready.",
  },
  {
    icon: UserRoundCheck,
    title: "Lead handoff",
    copy: "Connect the information you collect to the people and systems responsible for timely follow-up.",
  },
] as const;

export default function AIServices() {
  const [, navigate] = useLocation();
  const [prompt, setPrompt] = useState("");

  useSEO({
    title: "AI Services & Customer Follow-Up",
    description: "Explore practical AI-powered customer follow-up, booking support, and lead handoff services from FlowSites.",
    canonical: "/ai-services",
  });

  const beginIntake = () => {
    navigate(leadCaptureHref({ prompt: prompt.trim() || "I want to explore AI follow-up and automation for my business." }));
  };

  return (
    <div className="min-h-screen bg-white pt-28 text-slate-950 sm:pt-32">
      <section className="relative overflow-hidden border-b border-blue-50 bg-[linear-gradient(140deg,#eff8ff_0%,#ffffff_56%,#edf5ff_100%)]">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-sky-200/55 blur-3xl" />
        <div className="container relative grid gap-10 py-16 lg:grid-cols-[1fr_0.82fr] lg:py-24">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-blue-700"><Sparkles size={14} /> FlowSites AI services</p>
            <h1 className="mt-6 text-4xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-6xl">Customer follow-up that feels organized, not automated.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">Use this page to describe the customer journey you want to improve. We’ll start by learning about your business, current website, and the next step that matters most.</p>
            <Link href={leadCaptureHref({ intent: "Discuss AI services" })} className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.98]">Discuss AI services <ArrowRight size={16} /></Link>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-blue-950/10 sm:p-7">
            <div className="flex items-center gap-2 text-blue-700"><Bot size={19} /><span className="text-sm font-extrabold">Tell us what you want to improve</span></div>
            <p className="mt-2 text-sm leading-6 text-slate-600">We’ll carry your answer into a short business-needs intake so the right questions come next.</p>
            <textarea value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="For example: I want to follow up with new website inquiries faster…" className="mt-5 min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
            <button onClick={beginIntake} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-[0.98]">Continue with my business details <Send size={15} /></button>
          </div>
        </div>
      </section>

      <section className="container py-20 sm:py-24">
        <div className="mx-auto max-w-xl text-center"><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">What we can help you plan</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Useful automation, grounded in your customer journey</h2></div>
        <div className="mt-11 grid gap-5 md:grid-cols-3">
          {services.map(service => (
            <article key={service.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-7"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600"><service.icon size={23} /></div><h3 className="mt-5 text-lg font-extrabold tracking-tight text-slate-950">{service.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{service.copy}</p></article>
          ))}
        </div>
      </section>
    </div>
  );
}
