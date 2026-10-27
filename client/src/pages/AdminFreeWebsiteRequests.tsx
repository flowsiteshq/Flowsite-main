import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, ClipboardCheck, ExternalLink, FileText, Loader2, RefreshCw, Save, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const STATUSES = [
  ["new", "New request"],
  ["under_review", "Under review"],
  ["qualified", "Qualified"],
  ["preview_requested", "Preview requested"],
  ["preview_ready", "Preview ready"],
  ["preview_delivered", "Preview delivered"],
  ["closed", "Closed"],
] as const;

const statusStyles: Record<string, string> = {
  new: "border-blue-200 bg-blue-50 text-blue-800",
  under_review: "border-amber-200 bg-amber-50 text-amber-800",
  qualified: "border-violet-200 bg-violet-50 text-violet-800",
  preview_requested: "border-sky-200 bg-sky-50 text-sky-800",
  preview_ready: "border-indigo-200 bg-indigo-50 text-indigo-800",
  preview_delivered: "border-emerald-200 bg-emerald-50 text-emerald-800",
  closed: "border-slate-200 bg-slate-100 text-slate-600",
};

function formatDate(value: Date | string | null) {
  if (!value) return "Not reviewed";
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function AdminFreeWebsiteRequests() {
  const utils = trpc.useUtils();
  const requestsQuery = trpc.freeWebsite.listPreviewRequests.useQuery(undefined, { retry: false });
  const updateRequest = trpc.freeWebsite.updatePreviewRequest.useMutation({
    onSuccess: async () => {
      await utils.freeWebsite.listPreviewRequests.invalidate();
      toast.success("Request review details saved. No customer message was sent.");
    },
    onError: error => toast.error(error.message || "Could not update this request."),
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [deliveryChecklistComplete, setDeliveryChecklistComplete] = useState(false);

  const requests = requestsQuery.data ?? [];
  const selected = useMemo(() => requests.find(request => request.id === selectedId) ?? null, [requests, selectedId]);

  const openRequest = (request: (typeof requests)[number]) => {
    setSelectedId(request.id);
    setNotes(request.internalNotes ?? "");
    setPreviewUrl(request.previewUrl ?? "");
    setDeliveryChecklistComplete(request.deliveryChecklistComplete === 1);
  };

  const saveDetails = () => {
    if (!selected) return;
    updateRequest.mutate({
      requestId: selected.id,
      internalNotes: notes || null,
      previewUrl: previewUrl || null,
      deliveryChecklistComplete,
    });
  };

  if (requestsQuery.isLoading) {
    return <div className="min-h-screen bg-[#f6f9ff]"><div className="flex min-h-screen items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div></div>;
  }

  if (requestsQuery.error) {
    return <div className="min-h-screen bg-[#f6f9ff] px-5 py-24 text-slate-900"><div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><ShieldCheck className="mx-auto h-10 w-10 text-blue-600" /><h1 className="mt-5 text-2xl font-black tracking-tight">Preview requests are protected</h1><p className="mt-3 text-sm leading-6 text-slate-600">Sign in with an active administrator account to review Free Website Program requests. This workspace does not send messages or make billing changes.</p><Link href="/flowsites-admin-dashboard" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white"><ArrowLeft size={16} /> Back to admin</Link></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#f6f9ff] text-slate-900">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-5 sm:px-8"><div className="flex items-center gap-3"><Link href="/flowsites-admin-dashboard" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:text-blue-700" aria-label="Back to admin dashboard"><ArrowLeft size={18} /></Link><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Internal review workspace</p><h1 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">Free Website Preview Requests</h1></div></div><button type="button" onClick={() => requestsQuery.refetch()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"><RefreshCw size={15} className={requestsQuery.isFetching ? "animate-spin" : ""} /> Refresh</button></div></header>
      <main className="mx-auto grid max-w-[1440px] gap-6 px-5 py-7 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-extrabold tracking-tight">Request queue</h2><p className="mt-1 text-xs text-slate-500">{requests.length} request{requests.length === 1 ? "" : "s"} awaiting staff workflow</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{requests.filter(request => !["closed", "preview_delivered"].includes(request.status)).length} active</span></div>{requests.length === 0 ? <div className="p-12 text-center"><ClipboardCheck className="mx-auto h-10 w-10 text-slate-200" /><p className="mt-4 text-sm text-slate-500">No Free Website Program requests yet.</p></div> : <div className="divide-y divide-slate-100">{requests.map(request => <button type="button" key={request.id} onClick={() => openRequest(request)} className={`w-full px-5 py-4 text-left transition hover:bg-blue-50/50 ${selectedId === request.id ? "bg-blue-50/70" : ""}`}><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="truncate font-bold text-slate-950">{request.businessName}</p><p className="mt-1 truncate text-xs text-slate-500">{request.contactName} · {request.industry}</p></div><span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${statusStyles[request.status]}`}>{request.status.replaceAll("_", " ")}</span></div><p className="mt-2 text-xs text-slate-400">Received {formatDate(request.createdAt)}</p></button>)}</div>}</section>
        <section className="min-h-[38rem] rounded-3xl border border-slate-200 bg-white shadow-sm">{selected ? <div><div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-7"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Free Website Program</p><h2 className="mt-2 text-2xl font-black tracking-tight">{selected.businessName}</h2><p className="mt-1 text-sm text-slate-500">{selected.contactName} · {selected.email} · {selected.phone}</p></div><button type="button" onClick={() => setSelectedId(null)} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close request"><X size={18} /></button></div><div className="space-y-6 p-5 sm:p-7"><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Industry</p><p className="mt-2 text-sm font-extrabold text-slate-950">{selected.industry}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Contact preference</p><p className="mt-2 text-sm font-extrabold capitalize text-slate-950">{selected.preferredContactMethod}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Optional SMS consent</p><p className="mt-2 text-sm font-extrabold text-slate-950">{selected.marketingSmsConsent === 1 ? "Recorded" : "Not granted"}</p></div></div><div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-700">Business brief</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{selected.businessDescription}</p>{selected.desiredWebsiteFeatures && <p className="mt-3 text-sm leading-6 text-slate-700"><strong className="text-slate-900">Requested features:</strong> {selected.desiredWebsiteFeatures}</p>}{selected.existingWebsiteUrl && <a href={selected.existingWebsiteUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-800"><ExternalLink size={15} /> Open current website</a>}</div><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Review status</p><div className="mt-3 flex flex-wrap gap-2">{STATUSES.map(([value, label]) => <button type="button" key={value} disabled={updateRequest.isPending} onClick={() => updateRequest.mutate({ requestId: selected.id, status: value, deliveryChecklistComplete })} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${selected.status === value ? statusStyles[value] : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-700"}`}>{label}</button>)}</div><p className="mt-3 text-xs text-slate-500">Last reviewed: {formatDate(selected.reviewedAt)}</p></div><div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Preview URL</span><input value={previewUrl} onChange={event => setPreviewUrl(event.target.value)} placeholder="https://preview.example.com" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label><label className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><span className="flex items-start gap-3"><input type="checkbox" checked={deliveryChecklistComplete} onChange={event => setDeliveryChecklistComplete(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /><span><span className="block text-sm font-extrabold text-slate-900">Human delivery checklist complete</span><span className="mt-1 block text-xs leading-5 text-slate-600">Confirm quality review, approval, and your chosen manual delivery before marking delivered. This checkbox never sends anything.</span></span></span></label></div><label><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Internal review notes</span><textarea value={notes} onChange={event => setNotes(event.target.value)} className="min-h-32 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Qualification decision, project direction, ownership, and next manual step…" /></label><div className="flex flex-wrap items-center gap-3"><button type="button" onClick={saveDetails} disabled={updateRequest.isPending} className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60">{updateRequest.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />} Save review details</button>{selected.previewUrl && <a href={selected.previewUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700"><ExternalLink size={15} /> Open preview</a>}<span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"><FileText size={14} /> Staff updates only — no communication sent</span></div></div></div> : <div className="flex min-h-[38rem] flex-col items-center justify-center p-8 text-center"><ClipboardCheck className="h-12 w-12 text-blue-200" /><h2 className="mt-5 text-xl font-black tracking-tight">Select a preview request</h2><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Open a request to review the business brief, preserve consent context, set internal workflow status, and record a human-reviewed preview link.</p></div>}</section>
      </main>
    </div>
  );
}
