import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Copy, ExternalLink, KeyRound, Loader2, RefreshCw, ShieldCheck, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

function formatDate(value: Date | string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

export default function AdminCueIntegration() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const verifyQuery = trpc.admin.verify.useQuery(undefined, { retry: false });
  const keysQuery = trpc.cueIntegration.listKeys.useQuery(undefined, {
    enabled: !!verifyQuery.data?.authenticated,
    retry: false,
  });
  const utils = trpc.useUtils();
  const [label, setLabel] = useState("Cue read-only lead access");
  const [newKey, setNewKey] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || verifyQuery.isLoading) return;
    if (!verifyQuery.data?.authenticated) {
      if (user) navigate("/flowsites-admin-secret");
      else window.location.href = getLoginUrl("/flowsites-admin-integrations");
    }
  }, [authLoading, navigate, user, verifyQuery.data?.authenticated, verifyQuery.isLoading]);

  const createKey = trpc.cueIntegration.createKey.useMutation({
    onSuccess: async (data) => {
      setNewKey(data.key);
      await utils.cueIntegration.listKeys.invalidate();
      toast.success("Cue read-only key created. Copy it now; it will not be shown again.");
    },
    onError: (error) => toast.error(error.message),
  });
  const revokeKey = trpc.cueIntegration.revokeKey.useMutation({
    onSuccess: async () => {
      await utils.cueIntegration.listKeys.invalidate();
      toast.success("Cue key revoked. It can no longer read leads.");
    },
    onError: (error) => toast.error(error.message),
  });

  const endpoint = useMemo(() => `${window.location.origin}/api/integrations/cue/leads`, []);
  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`);
  };

  if (authLoading || verifyQuery.isLoading || !verifyQuery.data?.authenticated) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Integrations</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Cue lead access</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">A scoped, read-only connection for your Cue AI assistant. It can retrieve leads, but cannot change leads, access billing, manage staff, or open customer accounts.</p>
          </div>
          <Link href="/flowsites-admin-dashboard" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
            Back to CRM <ExternalLink size={15} />
          </Link>
        </div>

        <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white/15 p-3"><ShieldCheck size={26} /></div>
            <div>
              <h2 className="text-xl font-extrabold">Least-privilege access</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-50">Cue receives only the <code className="rounded bg-white/15 px-1.5 py-0.5">leads:read</code> scope. Results include lead contact details, business information, inquiry goal, status, and timestamps. Internal notes, billing, payments, project files, and all write actions are excluded.</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3"><KeyRound className="text-blue-600" size={22} /><h2 className="text-lg font-extrabold">Create a Cue key</h2></div>
            <p className="mt-2 text-sm leading-6 text-slate-600">Create one key for Cue. The secret appears only once and is stored by FlowSites as a one-way hash.</p>
            <label className="mt-5 block text-sm font-bold text-slate-800" htmlFor="cue-key-label">Key label</label>
            <input id="cue-key-label" value={label} onChange={(event) => setLabel(event.target.value)} maxLength={80} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
            <button onClick={() => createKey.mutate({ label })} disabled={createKey.isPending || label.trim().length < 2} className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              {createKey.isPending ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />} Create read-only key
            </button>

            {newKey && (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-2 text-amber-900"><TriangleAlert className="mt-0.5 shrink-0" size={17} /><div><p className="text-sm font-extrabold">Copy this key now</p><p className="mt-1 text-xs leading-5">For security, the full key cannot be shown again after you leave this screen.</p></div></div>
                <code className="mt-3 block break-all rounded-xl border border-amber-200 bg-white p-3 text-xs text-slate-800">{newKey}</code>
                <button onClick={() => copy(newKey, "Cue key")} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white"><Copy size={14} />Copy key</button>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-lg font-extrabold">Cue Custom API setup</h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li><span className="mr-2 font-bold text-blue-600">1.</span>Add a Custom API connection in Cue.</li>
              <li><span className="mr-2 font-bold text-blue-600">2.</span>Set the base request URL to the endpoint below.</li>
              <li><span className="mr-2 font-bold text-blue-600">3.</span>Add an <code>Authorization</code> header: <code>Bearer YOUR_CUE_KEY</code>.</li>
              <li><span className="mr-2 font-bold text-blue-600">4.</span>Use only <code>GET</code>. Cue can paginate with <code>?limit=50&amp;cursor=ID</code>.</li>
            </ol>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <code className="min-w-0 flex-1 break-all text-xs text-slate-700">{endpoint}</code>
              <button onClick={() => copy(endpoint, "Endpoint")} aria-label="Copy Cue endpoint" className="shrink-0 rounded-lg p-2 text-slate-600 transition hover:bg-white hover:text-blue-700"><Copy size={16} /></button>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-extrabold">Cue keys</h2><p className="mt-1 text-sm text-slate-600">Revoke a key immediately if Cue is disconnected or you no longer want it to see leads.</p></div><button onClick={() => keysQuery.refetch()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"><RefreshCw size={15} />Refresh</button></div>
          {keysQuery.isLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div> : keysQuery.data?.length ? <div className="mt-5 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><tr><th className="pb-3 pr-4">Label</th><th className="pb-3 pr-4">Key</th><th className="pb-3 pr-4">Last used</th><th className="pb-3 pr-4">Status</th><th className="pb-3 text-right">Action</th></tr></thead><tbody>{keysQuery.data.map((key) => <tr key={key.id} className="border-b border-slate-100 last:border-0"><td className="py-4 pr-4 font-semibold text-slate-800">{key.label}</td><td className="py-4 pr-4 font-mono text-xs text-slate-500">{key.keyPrefix}…</td><td className="py-4 pr-4 text-slate-600">{formatDate(key.lastUsedAt)}</td><td className="py-4 pr-4">{key.revokedAt ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">Revoked</span> : <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Active</span>}</td><td className="py-4 text-right">{!key.revokedAt && <button onClick={() => { if (window.confirm(`Revoke ${key.label}? Cue will immediately lose lead access.`)) revokeKey.mutate({ keyId: key.id }); }} disabled={revokeKey.isPending} className="text-xs font-bold text-red-600 hover:text-red-700">Revoke</button>}</td></tr>)}</tbody></table></div> : <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">No Cue keys have been created yet.</p>}
        </section>
      </div>
    </main>
  );
}
