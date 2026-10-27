import { FormEvent, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Check, ChevronDown, CircleCheck, MessageCircle, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useSEO } from "@/hooks/useSEO";
import { leadCaptureHref } from "@/lib/leadCapture";

const CONSENT_DISCLOSURE = "By checking this box, you agree that FlowSites may contact you by text about your Free Website Program request. Consent is optional and is not a condition of purchase. Message and data rates may apply. Reply STOP to opt out.";

const planCards = [
  { name: "Website Starter", price: "$99", detail: "per month", items: ["Free initial design", "Up to five pages", "Hosting and SSL", "Basic SEO setup", "Routine maintenance"] },
  { name: "Business Growth", price: "$149", detail: "per month", items: ["Everything in Starter", "Website chat", "Lead capture", "CRM integration", "Lead notifications"] },
  { name: "AI Receptionist", price: "$249", detail: "per month", items: ["Everything in Growth", "AI call answering", "Lead qualification", "Authorized SMS follow-up", "Appointment booking"], featured: true },
  { name: "AI Business Pro", price: "$399", detail: "per month", items: ["Everything in Receptionist", "Advanced automation", "Follow-up sequences", "Advanced reporting", "Priority support"] },
];

const faqs = [
  ["What does “free website” mean?", "It means there is no upfront design or development fee when you enroll in an eligible FlowSites monthly service plan. The monthly service plan is not free."],
  ["Is there a contract?", "The Website Starter program is presented with a 12-month service commitment. The exact services, ownership, cancellation terms, and any third-party costs are reviewed before you enroll."],
  ["Will I be enrolled when I request a preview?", "No. A preview request simply gives the FlowSites team information to review your business. It does not create a subscription, payment, or obligation."],
  ["Can I use my existing domain?", "Yes. Share your current site or domain in the request form and the team can review your starting point."],
];

export default function FreeWebsite() {
  useSEO({
    title: "Free Website Program | FlowSites",
    description: "Request a professional website preview from FlowSites. Eligible monthly service plans start at $99/month with a 12-month commitment.",
    canonical: "/free-website",
  });

  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [form, setForm] = useState({
    businessName: "",
    contactName: "",
    industry: "",
    businessLocation: "",
    phone: "",
    email: "",
    existingWebsiteUrl: "",
    desiredWebsiteFeatures: "",
    businessDescription: "",
    preferredContactMethod: "either" as "phone" | "email" | "either",
    marketingSmsConsent: false,
  });

  const submitRequest = trpc.freeWebsite.submitPreviewRequest.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: error => toast.error(error.message || "We could not save your request. Please try again."),
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm(current => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    submitRequest.mutate(form);
  };

  return (
    <main className="overflow-hidden bg-white text-slate-950">
      <section className="relative isolate overflow-hidden bg-[#020a1c] px-5 pb-20 pt-32 text-white sm:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(36,127,255,.30),transparent_31%),radial-gradient(circle_at_8%_70%,rgba(0,190,255,.18),transparent_34%)]" />
        <div className="absolute right-[-10%] top-24 h-72 w-72 rounded-full border border-blue-300/20 bg-blue-500/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-blue-100"><Sparkles size={14} /> Free Website Program</p>
            <h1 className="max-w-3xl text-5xl font-black tracking-[-.055em] sm:text-6xl lg:text-7xl">Your business deserves an amazing website.</h1>
            <p className="mt-5 text-3xl font-semibold text-blue-300 sm:text-4xl">We’ll build it for free.</p>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">Get a professional, mobile-friendly business website with no upfront design or development fee when you enroll in an eligible FlowSites monthly service plan.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#preview-request" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 font-bold text-white shadow-[0_14px_38px_rgba(37,99,235,.36)] transition hover:bg-blue-400">Get my free website preview <ArrowRight size={17} /></a>
              <Link href={leadCaptureHref({ intent: "Talk to Cue AI about the Free Website Program" })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 font-bold text-white transition hover:bg-white/10"><MessageCircle size={17} /> Talk to Cue AI</Link>
            </div>
            <p className="mt-5 text-sm text-slate-400">Plans start at <strong className="text-white">$99/month</strong> with a 12-month service commitment. “Free” refers to the initial website design and development fee, not the monthly subscription.</p>
            <p className="mt-3 text-sm text-slate-400">Cue AI chat is being introduced. The Cue option starts a guided FlowSites intake request today; it does not represent an active automated sales chat.</p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[.07] p-5 shadow-2xl backdrop-blur-sm sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-300">What your preview request includes</p>
            <div className="mt-6 space-y-5">
              {["A business-specific site direction", "A clear monthly-plan eligibility review", "A private discussion before any enrollment", "No subscription or payment created by this form"].map(item => <div key={item} className="flex items-start gap-3 text-slate-100"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-400/20 text-blue-200"><Check size={15} /></span><span>{item}</span></div>)}
            </div>
            <div className="mt-8 rounded-2xl border border-blue-300/20 bg-[#061631] p-5">
              <p className="font-semibold">Need to talk now?</p>
              <a className="mt-2 inline-flex items-center gap-2 text-blue-300 hover:text-blue-200" href="tel:+12815038903"><Phone size={16} />(281) 503-8903</a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-16 sm:grid-cols-3">
        {[{ number: "01", title: "Tell us about your business", text: "Share what you do, where you serve, and what you want a website to accomplish." }, { number: "02", title: "We review the opportunity", text: "A FlowSites specialist reviews your request and discusses program eligibility." }, { number: "03", title: "Review your next step", text: "You decide whether a monthly service plan is right for your business—before any enrollment." }].map(step => <article key={step.number} className="rounded-2xl border border-slate-200 bg-slate-50 p-7"><span className="text-sm font-black tracking-widest text-blue-600">{step.number}</span><h2 className="mt-6 text-2xl font-bold tracking-tight">{step.title}</h2><p className="mt-3 leading-relaxed text-slate-600">{step.text}</p></article>)}
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[.18em] text-blue-600">Monthly service options</p><h2 className="mt-3 text-4xl font-black tracking-[-.045em]">Clear plans for the next step.</h2><p className="mt-4 leading-relaxed text-slate-600">These proposed options are reviewed with you before enrollment. AI use, phone/SMS allowances, third-party costs, cancellation, and ownership terms must be confirmed in writing before checkout is enabled.</p></div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{planCards.map(plan => <article key={plan.name} className={`relative flex min-h-[390px] flex-col rounded-2xl border p-6 ${plan.featured ? "border-blue-500 bg-[#061631] text-white shadow-xl shadow-blue-900/20" : "border-slate-200 bg-white"}`}>
            {plan.featured && <span className="absolute -top-3 left-6 rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white">Most complete</span>}
            <h3 className="text-xl font-bold">{plan.name}</h3><div className="mt-5 flex items-end gap-1"><span className="text-4xl font-black">{plan.price}</span><span className={plan.featured ? "pb-1 text-sm text-slate-300" : "pb-1 text-sm text-slate-500"}>{plan.detail}</span></div>
            <ul className={`mt-7 space-y-3 text-sm ${plan.featured ? "text-slate-200" : "text-slate-600"}`}>{plan.items.map(item => <li className="flex gap-2" key={item}><Check size={16} className="mt-0.5 shrink-0 text-blue-500" />{item}</li>)}</ul>
            <a href="#preview-request" className={`mt-auto inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-bold transition ${plan.featured ? "bg-blue-500 text-white hover:bg-blue-400" : "bg-slate-950 text-white hover:bg-slate-800"}`}>Request a preview</a>
          </article>)}</div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
        <div><p className="text-sm font-bold uppercase tracking-[.18em] text-blue-600">Built for a practical decision</p><h2 className="mt-3 text-4xl font-black tracking-[-.045em]">A modern website should make it easier to be found, trusted, and contacted.</h2><p className="mt-5 leading-relaxed text-slate-600">FlowSites builds conversion-focused websites and practical business automation for service companies. Every Free Website Program request is reviewed by a person before any commitment is discussed.</p><div className="mt-8 space-y-4">{["Mobile-friendly website direction", "A clear review of your business goals", "No fabricated results or “automatic” enrollment", "Human review before any next step"].map(item => <div className="flex gap-3" key={item}><CircleCheck className="shrink-0 text-blue-600" size={21} /><span className="font-medium text-slate-700">{item}</span></div>)}</div></div>
        <div id="preview-request" className="scroll-mt-28 rounded-[2rem] bg-[#061631] p-6 text-white shadow-2xl sm:p-9">
          {submitted ? <div className="py-12 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-400/15 text-blue-200"><Check size={32} /></div><h2 className="mt-6 text-3xl font-black">Your request is in.</h2><p className="mx-auto mt-3 max-w-md leading-relaxed text-slate-300">A FlowSites team member will review your information. This request did not create a subscription or payment.</p><Link href="/" className="mt-8 inline-flex rounded-xl bg-blue-500 px-5 py-3 font-bold hover:bg-blue-400">Back to FlowSites</Link></div> : <form onSubmit={submit} className="space-y-5"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-blue-300">Free Website Preview</p><h2 className="mt-2 text-3xl font-black">Tell us what your business needs.</h2><p className="mt-2 text-sm leading-relaxed text-slate-300">No payment details are collected here.</p></div>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Business name" required><input required value={form.businessName} onChange={e => update("businessName", e.target.value)} placeholder="Your business" /></Field><Field label="Your name" required><input required value={form.contactName} onChange={e => update("contactName", e.target.value)} placeholder="Your name" /></Field><Field label="Industry" required><input required value={form.industry} onChange={e => update("industry", e.target.value)} placeholder="e.g. Landscaping" /></Field><Field label="Business location"><input value={form.businessLocation} onChange={e => update("businessLocation", e.target.value)} placeholder="Houston, TX" /></Field><Field label="Email address" required><input required type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="you@business.com" /></Field><Field label="Phone number" required><input required type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="(555) 555-5555" /></Field></div>
            <Field label="Existing website URL"><input type="url" value={form.existingWebsiteUrl} onChange={e => update("existingWebsiteUrl", e.target.value)} placeholder="https://yourbusiness.com" /></Field>
            <Field label="What should your website help with?"><textarea value={form.desiredWebsiteFeatures} onChange={e => update("desiredWebsiteFeatures", e.target.value)} placeholder="Booking requests, service pages, galleries, online payments…" rows={3} /></Field>
            <Field label="Tell us about your business" required><textarea required minLength={10} value={form.businessDescription} onChange={e => update("businessDescription", e.target.value)} placeholder="Describe your business, customers, and goals." rows={4} /></Field>
            <div><p className="mb-2 text-sm font-semibold">Preferred contact method</p><div className="grid grid-cols-3 gap-2">{(["phone", "email", "either"] as const).map(method => <label key={method} className={`cursor-pointer rounded-xl border px-3 py-2 text-center text-sm font-semibold capitalize ${form.preferredContactMethod === method ? "border-blue-400 bg-blue-400/15 text-white" : "border-white/15 text-slate-300"}`}><input className="sr-only" checked={form.preferredContactMethod === method} onChange={() => update("preferredContactMethod", method)} type="radio" name="contact" />{method}</label>)}</div></div>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-slate-300"><input type="checkbox" checked={form.marketingSmsConsent} onChange={e => update("marketingSmsConsent", e.target.checked)} className="mt-0.5 h-4 w-4 accent-blue-500" /><span>{CONSENT_DISCLOSURE}</span></label>
            <button disabled={submitRequest.isPending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 font-bold text-white transition hover:bg-blue-400 disabled:opacity-60">{submitRequest.isPending ? "Saving your request…" : <>Get my free website preview <ArrowRight size={17} /></>}</button>
            <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-400"><ShieldCheck size={14} /> Submitting this form does not enroll you in a plan.</p>
          </form>}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-5 py-20"><div className="mx-auto max-w-4xl"><p className="text-center text-sm font-bold uppercase tracking-[.18em] text-blue-600">Questions answered</p><h2 className="mt-3 text-center text-4xl font-black tracking-[-.045em]">Free Website Program FAQ</h2><div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">{faqs.map(([question, answer], index) => <div key={question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left font-bold"><span>{question}</span><ChevronDown size={20} className={`shrink-0 transition ${openFaq === index ? "rotate-180" : ""}`} /></button>{openFaq === index && <p className="px-6 pb-6 leading-relaxed text-slate-600">{answer}</p>}</div>)}</div></div></section>
    </main>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-slate-100">{label}{required && <span className="text-blue-300"> *</span>}<span className="mt-2 block">{children}</span></label>;
}
