/**
 * ColdCallScriptPanel — Shared Sales Script Reference
 * Used in both AdminDashboard (Scripts tab) and RepDashboard (Scripts tab)
 */

import { useState } from "react";
import { PhoneCall, ChevronRight } from "lucide-react";

export function ColdCallScriptPanel({ isDark }: { isDark: boolean }) {
  const [openSection, setOpenSection] = useState<string | null>("opening");

  const sections = [
    {
      id: "opening",
      emoji: "☎️",
      title: "Opening — Pattern Interrupt",
      color: "text-sky-300",
      border: "border-sky-500/25",
      bg: "bg-sky-500/8",
      content: (
        <div className="space-y-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/90 text-sm leading-relaxed font-medium italic">
              "Hey, is this [Name]—quick question, are you currently taking on new clients right now?"
            </p>
          </div>
          <p className="text-white/45 text-xs leading-relaxed">
            Pause. Let them answer. This hooks them into a business conversation, not a sales pitch.
          </p>
        </div>
      ),
    },
    {
      id: "hook",
      emoji: "🔥",
      title: "Problem Hook — The Money Line",
      color: "text-orange-300",
      border: "border-orange-500/25",
      bg: "bg-orange-500/8",
      content: (
        <div className="space-y-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/90 text-sm leading-relaxed font-medium italic">
              "Got it—so this is exactly why I called… most service businesses we talk to are getting leads, but they're losing 30–50% of them because their website doesn't follow up or capture properly."
            </p>
          </div>
          <p className="text-white/45 text-xs leading-relaxed">
            Let that sit. People will mentally check if it's true.
          </p>
        </div>
      ),
    },
    {
      id: "value",
      emoji: "💡",
      title: "Value Position — What You Actually Do",
      color: "text-yellow-300",
      border: "border-yellow-500/25",
      bg: "bg-yellow-500/8",
      content: (
        <div className="space-y-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/90 text-sm leading-relaxed font-medium italic">
              "We don't just build websites—we build what's basically a client enrollment system. It captures leads, automatically follows up by text/email, and feeds directly into your CRM so nothing slips through."
            </p>
          </div>
          <p className="text-white/45 text-xs leading-relaxed">
            Aligns directly with the offer: CRM integration + automated follow-ups.
          </p>
        </div>
      ),
    },
    {
      id: "diff",
      emoji: "⚔️",
      title: "Differentiation — Why You're Not Like Everyone Else",
      color: "text-red-300",
      border: "border-red-500/25",
      bg: "bg-red-500/8",
      content: (
        <div className="space-y-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/90 text-sm leading-relaxed font-medium italic">
              "Most agencies build something that looks nice… we build something that actually converts visitors into paying clients consistently."
            </p>
          </div>
          <p className="text-white/45 text-xs leading-relaxed">
            You're reframing them from design → revenue.
          </p>
        </div>
      ),
    },
    {
      id: "qualify",
      emoji: "🎯",
      title: "Qualifying Question — Expose the Gap",
      color: "text-emerald-300",
      border: "border-emerald-500/25",
      bg: "bg-emerald-500/8",
      content: (
        <div className="space-y-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/90 text-sm leading-relaxed font-medium italic">
              "Let me ask you—right now, when someone visits your website… do they get followed up with automatically, or does it depend on you or your team?"
            </p>
          </div>
          <p className="text-white/45 text-xs leading-relaxed">
            This exposes the gap instantly.
          </p>
        </div>
      ),
    },
    {
      id: "close",
      emoji: "💥",
      title: "Micro-Close — Book the Call",
      color: "text-purple-300",
      border: "border-purple-500/25",
      bg: "bg-purple-500/8",
      content: (
        <div className="space-y-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <p className="text-white/90 text-sm leading-relaxed font-medium italic">
              "That's exactly the gap we fix. I can show you in about 10 minutes how businesses like yours are turning their site into a 24/7 sales machine."
            </p>
            <p className="text-white/90 text-sm leading-relaxed font-medium italic">
              "Would it be easier later today or tomorrow for a quick walkthrough?"
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "objection_interest",
      emoji: "🧠",
      title: "Objection: \"Not Interested\"",
      color: "text-pink-300",
      border: "border-pink-500/25",
      bg: "bg-pink-500/8",
      content: (
        <div className="space-y-3">
          <p className="text-white/55 text-xs">Don't retreat—pivot.</p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/90 text-sm leading-relaxed font-medium italic">
              "Totally get it—quick question before I let you go… if your website could bring you even 5–10 extra clients a month automatically, would that be worth looking at?"
            </p>
          </div>
          <p className="text-white/45 text-xs leading-relaxed">
            Now they're thinking in results, not cost.
          </p>
        </div>
      ),
    },
    {
      id: "objection_website",
      emoji: "🧨",
      title: "Objection: \"We Already Have a Website\"",
      color: "text-amber-300",
      border: "border-amber-500/25",
      bg: "bg-amber-500/8",
      content: (
        <div className="space-y-3">
          <p className="text-white/55 text-xs">Perfect. That's actually your best lead.</p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <p className="text-white/90 text-sm leading-relaxed font-medium italic">
              "Yeah—that's actually who we help the most. Most of our clients already had a site… it just wasn't converting or following up."
            </p>
            <p className="text-white/90 text-sm leading-relaxed font-medium italic">
              "We usually find 2–3 quick fixes that increase leads almost immediately—want me to show you?"
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "power_close",
      emoji: "🧲",
      title: "Power Close — Stronger Version",
      color: "text-teal-300",
      border: "border-teal-500/25",
      bg: "bg-teal-500/8",
      content: (
        <div className="space-y-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/90 text-sm leading-relaxed font-medium italic">
              "Worst case—you get a free breakdown of where your website is leaking leads. Best case—you add a consistent flow of new clients without spending more on ads."
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-8">
      {/* Header */}
      <div className={`p-5 rounded-2xl border ${
        isDark ? "bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20" : "bg-amber-50 border-amber-200"
      }`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <PhoneCall size={18} className="text-amber-300" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`} style={{ fontFamily: "var(--font-display)" }}>
              Cold Call Script
            </h2>
            <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>High-Conversion Version · FlowSites Sales</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: "Websites → ❌", sub: "Boring commodity" },
            { label: "Enrollment System → ✅", sub: "Valuable & specific" },
            { label: "Design → ❌  Automation → ✅", sub: "Revenue machine" },
          ].map((tip) => (
            <div key={tip.label} className="bg-white/5 border border-white/8 rounded-xl p-3">
              <p className={`text-xs font-semibold ${isDark ? "text-white/80" : "text-gray-700"}`}>{tip.label}</p>
              <p className={`text-[10px] mt-0.5 ${isDark ? "text-white/35" : "text-gray-500"}`}>{tip.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tone Guide */}
      <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 ${
        isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200"
      }`}>
        <span className="text-lg">⚡</span>
        <div>
          <p className={`text-xs font-semibold ${isDark ? "text-white/70" : "text-gray-700"}`}>Tone Guide</p>
          <p className={`text-[11px] ${isDark ? "text-white/40" : "text-gray-500"}`}>
            Don't sound like a salesperson — sound like a{" "}
            <strong className={isDark ? "text-white/60" : "text-gray-700"}>consultant</strong>, a{" "}
            <strong className={isDark ? "text-white/60" : "text-gray-700"}>problem finder</strong>, someone who sees revenue leaks everywhere.
          </p>
        </div>
      </div>

      {/* Script Sections */}
      <div className="space-y-2">
        {sections.map((section, idx) => {
          const isOpen = openSection === section.id;
          return (
            <div
              key={section.id}
              className={`rounded-xl border overflow-hidden transition-all ${
                isOpen ? `${section.bg} ${section.border}` : isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200"
              }`}
            >
              <button
                onClick={() => setOpenSection(isOpen ? null : section.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-base flex-shrink-0">{section.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-semibold ${
                    isOpen ? section.color : isDark ? "text-white/70" : "text-gray-700"
                  }`}>
                    <span className={`text-[10px] font-bold mr-2 ${
                      isDark ? "text-white/25" : "text-gray-400"
                    }`}>{String(idx + 1).padStart(2, "0")}</span>
                    {section.title}
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  className={`flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? `rotate-90 ${section.color}` : isDark ? "text-white/20" : "text-gray-400"
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4">
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
