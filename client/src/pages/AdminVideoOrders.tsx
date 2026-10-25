import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Check, ExternalLink, Film, Loader2, PackageCheck, RefreshCw, Save, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const STATUSES = [
  ["pending_payment", "Pending payment"],
  ["paid", "Paid — ready to produce"],
  ["in_production", "In production"],
  ["review", "Ready for client review"],
  ["revision_requested", "Revision requested"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
] as const;

const statusStyles: Record<string, string> = {
  pending_payment: "border-amber-200 bg-amber-50 text-amber-800",
  paid: "border-blue-200 bg-blue-50 text-blue-800",
  in_production: "border-violet-200 bg-violet-50 text-violet-800",
  review: "border-sky-200 bg-sky-50 text-sky-800",
  revision_requested: "border-orange-200 bg-orange-50 text-orange-800",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cancelled: "border-slate-200 bg-slate-100 text-slate-600",
};

const packageNames: Record<string, string> = {
  social_spark: "Social Spark",
  business_spotlight: "Business Spotlight",
  cinematic_pro: "Cinematic Pro",
};

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function AdminVideoOrders() {
  const utils = trpc.useUtils();
  const ordersQuery = trpc.videoStudio.adminList.useQuery(undefined, { retry: false });
  const updateOrder = trpc.videoStudio.adminUpdate.useMutation({
    onSuccess: () => {
      toast.success("Video order updated.");
      utils.videoStudio.adminList.invalidate();
    },
    onError: error => toast.error(error.message || "Video order update failed."),
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [deliveryUrl, setDeliveryUrl] = useState("");

  const orders = ordersQuery.data ?? [];
  const selected = useMemo(() => orders.find(order => order.id === selectedId) ?? null, [orders, selectedId]);

  const openOrder = (order: (typeof orders)[number]) => {
    setSelectedId(order.id);
    setNotes(order.adminNotes ?? "");
    setRevisionNotes(order.revisionNotes ?? "");
    setPreviewUrl(order.previewUrl ?? "");
    setDeliveryUrl(order.deliveryUrl ?? "");
  };

  const updateStatus = (status: (typeof STATUSES)[number][0]) => {
    if (!selected) return;
    updateOrder.mutate({ orderId: selected.id, status });
  };

  const saveDetails = () => {
    if (!selected) return;
    updateOrder.mutate({
      orderId: selected.id,
      adminNotes: notes || null,
      revisionNotes: revisionNotes || null,
      previewUrl: previewUrl || null,
      deliveryUrl: deliveryUrl || null,
    });
  };

  if (ordersQuery.isLoading) {
    return <div className="min-h-screen bg-[#f6f9ff] text-slate-900"><div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div></div>;
  }

  if (ordersQuery.error) {
    return <div className="min-h-screen bg-[#f6f9ff] px-5 py-24 text-slate-900"><div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><Film className="mx-auto h-10 w-10 text-blue-600" /><h1 className="mt-5 text-2xl font-black tracking-tight">Video Studio queue is protected</h1><p className="mt-3 text-sm leading-6 text-slate-600">Sign in with an active administrator account to review production orders and deliveries.</p><Link href="/flowsites-admin-dashboard" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white"><ArrowLeft size={16} /> Back to admin</Link></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#f6f9ff] text-slate-900">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-5 sm:px-8"><div className="flex items-center gap-3"><Link href="/flowsites-admin-dashboard" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:text-blue-700" aria-label="Back to admin dashboard"><ArrowLeft size={18} /></Link><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Internal production workspace</p><h1 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">AI Video Studio Orders</h1></div></div><button type="button" onClick={() => ordersQuery.refetch()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"><RefreshCw size={15} className={ordersQuery.isFetching ? "animate-spin" : ""} /> Refresh</button></div></header>
      <main className="mx-auto grid max-w-[1440px] gap-6 px-5 py-7 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-extrabold tracking-tight">Order queue</h2><p className="mt-1 text-xs text-slate-500">{orders.length} production request{orders.length === 1 ? "" : "s"}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{orders.filter(order => ["paid", "in_production", "review", "revision_requested"].includes(order.status)).length} active</span></div>{orders.length === 0 ? <div className="p-12 text-center"><Film className="mx-auto h-10 w-10 text-slate-200" /><p className="mt-4 text-sm text-slate-500">No Video Studio orders yet.</p></div> : <div className="divide-y divide-slate-100">{orders.map(order => <button type="button" key={order.id} onClick={() => openOrder(order)} className={`w-full px-5 py-4 text-left transition hover:bg-blue-50/50 ${selectedId === order.id ? "bg-blue-50/70" : ""}`}><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="truncate font-bold text-slate-950">{order.businessName}</p><p className="mt-1 text-xs text-slate-500">{packageNames[order.packageId]} · ${(order.amountCents / 100).toFixed(0)} · {order.orderNumber}</p></div><span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${statusStyles[order.status]}`}>{order.status.replaceAll("_", " ")}</span></div><p className="mt-2 text-xs text-slate-400">{formatDate(order.createdAt)}</p></button>)}</div>}</section>
        <section className="min-h-[34rem] rounded-3xl border border-slate-200 bg-white shadow-sm">{selected ? <div><div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-7"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">{selected.orderNumber}</p><h2 className="mt-2 text-2xl font-black tracking-tight">{selected.businessName}</h2><p className="mt-1 text-sm text-slate-500">{selected.clientName} · {selected.email}{selected.phone ? ` · ${selected.phone}` : ""}</p></div><button type="button" onClick={() => setSelectedId(null)} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close order"><X size={18} /></button></div><div className="space-y-6 p-5 sm:p-7"><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Package</p><p className="mt-2 text-sm font-extrabold text-slate-950">{packageNames[selected.packageId]}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Payment</p><p className="mt-2 text-sm font-extrabold text-slate-950">${(selected.amountCents / 100).toFixed(0)} · {selected.status === "pending_payment" ? "Awaiting" : "Confirmed"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Format</p><p className="mt-2 text-sm font-extrabold capitalize text-slate-950">{selected.requestedAspectRatio}</p></div></div><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Creative brief</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{selected.businessDescription}</p>{selected.videoGoal && <p className="mt-3 text-sm text-slate-600"><strong className="text-slate-900">Goal:</strong> {selected.videoGoal}</p>}{selected.callToAction && <p className="mt-2 text-sm text-slate-600"><strong className="text-slate-900">CTA:</strong> {selected.callToAction}</p>}</div><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Production status</p><div className="mt-3 flex flex-wrap gap-2">{STATUSES.map(([value, label]) => <button type="button" key={value} disabled={updateOrder.isPending} onClick={() => updateStatus(value)} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${selected.status === value ? statusStyles[value] : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-700"}`}>{label}</button>)}</div></div><div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Review preview URL</span><input value={previewUrl} onChange={event => setPreviewUrl(event.target.value)} placeholder="https://…" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label><label><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Final delivery URL</span><input value={deliveryUrl} onChange={event => setDeliveryUrl(event.target.value)} placeholder="https://…" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label></div><div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Internal production notes</span><textarea value={notes} onChange={event => setNotes(event.target.value)} className="min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Production notes, approvals, and internal handoffs…" /></label><label><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Revision notes</span><textarea value={revisionNotes} onChange={event => setRevisionNotes(event.target.value)} className="min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Client feedback or revision direction…" /></label></div><div className="flex flex-wrap items-center gap-3"><button type="button" onClick={saveDetails} disabled={updateOrder.isPending} className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60">{updateOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />} Save production details</button>{selected.previewUrl && <a href={selected.previewUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700"><ExternalLink size={15} /> Preview</a>}{selected.deliveryUrl && <a href={selected.deliveryUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700"><PackageCheck size={15} /> Delivery</a>}</div>{selected.assets.length > 0 && <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Brand assets</p><div className="mt-3 flex flex-wrap gap-2">{selected.assets.map(asset => <a key={asset.id} href={asset.fileUrl} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700"><Film size={14} className="shrink-0" /><span className="truncate">{asset.fileName}</span><ExternalLink size={13} className="shrink-0" /></a>)}</div></div>}</div></div> : <div className="flex min-h-[34rem] flex-col items-center justify-center p-8 text-center"><Film className="h-12 w-12 text-blue-200" /><h2 className="mt-5 text-xl font-black tracking-tight">Select a production order</h2><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Open an order to manage the production stage, review link, revisions, brand assets, and final delivery.</p></div>}</section>
      </main>
    </div>
  );
}
