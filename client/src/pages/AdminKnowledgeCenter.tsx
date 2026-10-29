import { useMemo, useState } from "react";
import { BookOpen, Check, Edit3, Filter, Loader2, Plus, Search, ShieldAlert, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { AdminCommandShell } from "@/components/AdminCommandShell";

type Category = "company_information" | "services_pricing" | "cue_ai_training" | "sales_playbooks" | "customer_support" | "internal_procedures";
type Access = "public" | "internal";
type Status = "draft" | "published" | "archived";

const categories: Array<{ value: Category; label: string }> = [
  { value: "company_information", label: "Company Information" },
  { value: "services_pricing", label: "Services & Pricing" },
  { value: "cue_ai_training", label: "Cue AI Training" },
  { value: "sales_playbooks", label: "Sales Playbooks" },
  { value: "customer_support", label: "Customer Support" },
  { value: "internal_procedures", label: "Internal Procedures" },
];
const humanize = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, char => char.toUpperCase());

function SyncBadge({ value }: { value: string }) {
  const label = value === "pending_manual_sync" ? "Manual sync needed" : value === "not_synced" ? "Not synced" : humanize(value);
  const styles = value === "synced" ? "bg-emerald-50 text-emerald-700" : value === "error" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700";
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${styles}`}>{label}</span>;
}

function ArticleEditor({ article, onClose, onSaved }: { article?: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: article?.title ?? "",
    category: (article?.category ?? "company_information") as Category,
    access: (article?.access ?? "internal") as Access,
    status: (article?.status ?? "draft") as Status,
    content: article?.content ?? "",
  });
  const create = trpc.adminKnowledge.createArticle.useMutation({ onSuccess: onSaved });
  const update = trpc.adminKnowledge.updateArticle.useMutation({ onSuccess: onSaved });
  const pending = create.isPending || update.isPending;
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (article) update.mutate({ id: article.id, ...form });
    else create.mutate(form);
  };
  const field = "mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50";
  return <div role="dialog" aria-modal="true" className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/35 p-4" onMouseDown={event => { if (event.target === event.currentTarget && !pending) onClose(); }}>
    <form onSubmit={submit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">Knowledge Center</p><h2 className="mt-1 text-xl font-bold text-[#14213f]">{article ? "Edit article" : "New article"}</h2></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close"><X size={18}/></button></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-bold text-slate-600 sm:col-span-2">Title<input className={field} required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })}/></label>
        <label className="text-xs font-bold text-slate-600">Category<select className={field} value={form.category} onChange={event => setForm({ ...form, category: event.target.value as Category })}>{categories.map(category => <option key={category.value} value={category.value}>{category.label}</option>)}</select></label>
        <label className="text-xs font-bold text-slate-600">Access<select className={field} value={form.access} onChange={event => setForm({ ...form, access: event.target.value as Access })}><option value="internal">Internal only</option><option value="public">Cue public</option></select></label>
        <label className="text-xs font-bold text-slate-600">Status<select className={field} value={form.status} onChange={event => setForm({ ...form, status: event.target.value as Status })}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
        <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">Public + published articles become <b>pending manual sync</b>. The system does not claim ElevenLabs synchronization until an administrator confirms it.</div>
        <label className="text-xs font-bold text-slate-600 sm:col-span-2">Article content<textarea className="mt-1 min-h-56 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" required value={form.content} onChange={event => setForm({ ...form, content: event.target.value })}/></label>
      </div>
      {(create.error || update.error) && <p className="mt-4 text-sm font-semibold text-rose-600">{(create.error || update.error)?.message}</p>}
      <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">Cancel</button><button disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-[#1269e8] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{pending && <Loader2 size={15} className="animate-spin"/>}{article ? "Save article" : "Create article"}</button></div>
    </form>
  </div>;
}

export default function AdminKnowledgeCenter() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [status, setStatus] = useState<Status | "all">("all");
  const [editing, setEditing] = useState<any | undefined>();
  const [creating, setCreating] = useState(false);
  const articles = trpc.adminKnowledge.listArticles.useQuery({ query: query || undefined, category: category === "all" ? undefined : category, status: status === "all" ? undefined : status });
  const utils = trpc.useUtils();
  const archive = trpc.adminKnowledge.archiveArticle.useMutation({ onSuccess: () => utils.adminKnowledge.listArticles.invalidate() });
  const sync = trpc.adminKnowledge.markCueSync.useMutation({ onSuccess: () => utils.adminKnowledge.listArticles.invalidate() });
  const notifications = trpc.adminKnowledge.listNotifications.useQuery();
  const unread = useMemo(() => (notifications.data ?? []).filter(item => item.isRead === 0), [notifications.data]);
  return <AdminCommandShell activeHref="/flowsites-admin-knowledge" title="Knowledge Center" subtitle="Approved operational knowledge for staff and Cue AI.">
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between"><div><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-700"><BookOpen size={21}/></span><div><h2 className="text-xl font-bold tracking-[-0.03em] text-[#14213f]">Knowledge Center</h2><p className="mt-1 text-sm text-slate-500">Preserve institutional knowledge, pricing guidance, and Cue boundaries in one place.</p></div></div></div><button type="button" onClick={() => setCreating(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1269e8] px-4 text-sm font-bold text-white hover:bg-[#0c58c8]"><Plus size={16}/> New article</button></div>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row"><label className="relative flex-1"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input aria-label="Search knowledge articles" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search articles" className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"/></label><label className="relative"><Filter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><select value={category} onChange={event => setCategory(event.target.value as Category | "all")} className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm font-medium text-slate-700 outline-none sm:w-52"><option value="all">All categories</option>{categories.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><select value={status} onChange={event => setStatus(event.target.value as Status | "all")} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none sm:w-36"><option value="all">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div></section>
      {unread.length > 0 && <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><div className="flex items-center gap-3"><ShieldAlert size={19} className="text-amber-700"/><div><p className="font-bold text-amber-950">{unread.length} unread operational notification{unread.length === 1 ? "" : "s"}</p><p className="text-sm text-amber-800">Review actionable payment, approval, and escalation items from the notification bell.</p></div></div></section>}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-5 py-4"><p className="text-sm font-bold text-[#14213f]">Articles</p><p className="mt-1 text-xs text-slate-500">{articles.data?.length ?? 0} records · existing lessons remain available in the legacy Knowledge Center.</p></div>{articles.isLoading ? <div className="p-8 text-sm text-slate-500">Loading articles…</div> : articles.isError ? <div className="p-8 text-sm font-semibold text-rose-600">{articles.error.message}</div> : <div className="divide-y divide-slate-100">{articles.data?.length ? articles.data.map(article => <div key={article.id} className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-[#17223b]">{article.title}</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{humanize(article.category)}</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${article.status === "published" ? "bg-emerald-50 text-emerald-700" : article.status === "archived" ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-700"}`}>{humanize(article.status)}</span><span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">{article.access === "public" ? "Cue public" : "Internal"}</span></div><p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">{article.content}</p><p className="mt-2 text-xs text-slate-400">Updated {new Date(article.updatedAt).toLocaleDateString()} · {article.authorName || "FlowSites Admin"} · <SyncBadge value={article.cueSyncStatus}/></p></div><div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => setEditing(article)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><Edit3 size={14}/> Edit</button>{article.status !== "archived" && <button type="button" onClick={() => archive.mutate({ id: article.id })} className="rounded-lg border border-rose-100 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50">Archive</button>}{article.status === "published" && article.access === "public" && article.cueSyncStatus !== "synced" && <button type="button" onClick={() => sync.mutate({ id: article.id, status: "synced" })} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"><Check size={14}/> Confirm Cue sync</button>}</div></div>) : <div className="p-10 text-center"><p className="font-bold text-slate-700">No articles match this view.</p><p className="mt-1 text-sm text-slate-500">Create an article or adjust the filters.</p></div>}</div>}</section>
    </div>
    {(creating || editing) && <ArticleEditor article={editing} onClose={() => { setCreating(false); setEditing(undefined); }} onSaved={() => { setCreating(false); setEditing(undefined); utils.adminKnowledge.listArticles.invalidate(); }}/>} 
  </AdminCommandShell>;
}
