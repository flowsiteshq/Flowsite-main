import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle2, Copy, ExternalLink, KeyRound, Loader2, PhoneCall, ShieldCheck, TriangleAlert, XCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

function formatDate(value: Date | string | null) {
  return value ? new Date(value).toLocaleString() : "Never";
}

export default function AdminCueTelephone() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const verifyQuery = trpc.admin.verify.useQuery(undefined, { retry: false });
  const readinessQuery = trpc.voiceIntegration.getReadiness.useQuery(undefined, {
    enabled: !!verifyQuery.data?.authenticated,
    retry: false,
  });
  const keysQuery = trpc.voiceIntegration.listKeys.useQuery(undefined, {
    enabled: !!verifyQuery.data?.authenticated,
    retry: false,
  });
  const utils = trpc.useUtils();
  const [label, setLabel] = useState("Cue phone-agent tool access");
  const [newKey, setNewKey] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || verifyQuery.isLoading) return;
    if (!verifyQuery.data?.authenticated) {
      if (user) navigate("/flowsites-admin-secret");
      else window.location.href = getLoginUrl("/flowsites-admin-cue-telephone");
    }
  }, [authLoading, navigate, user, verifyQuery.data?.authenticated, verifyQuery.isLoading]);

  const createKey = trpc.voiceIntegration.createKey.useMutation({
    onSuccess: async (data) => {
      setNewKey(data.key);
      await utils.voiceIntegration.listKeys.invalidate();
      toast.success("Voice tool key created. Copy it now; it will not be shown again.");
    },
    onError: (error) => toast.error(error.message),
  });
  const revokeKey = trpc.voiceIntegration.revokeKey.useMutation({
    onSuccess: async () => {
      await utils.voiceIntegration.listKeys.invalidate();
      toast.success("Voice tool key revoked.");
    },
    onError: (error) => toast.error(error.message),
  });
  const copy = async (value: string, labelName: string) => {
    await navigator.clipboard.writeText(value);
    toast.success(`${labelName} copied.`);
  };

  if (authLoading || verifyQuery.isLoading || !verifyQuery.data?.authenticated) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>;
  }

  const configured = readinessQuery.data?.configured;
  const fullyConfigured = Boolean(configured?.webhookSecret && configured?.apiKey);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Cue · Voice readiness</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Phone-agent foundation</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">A staff-only setup surface for a future Cue phone agent. This screen does not forward the FlowSites number, initiate calls, send messages, or activate an ElevenLabs agent.</p>
          </div>
          <Link href="/flowsites-admin-dashboard" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
            Back to CRM <ExternalLink size={15} />
          </Link>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/15 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-blue-500/15 p-3 text-blue-300"><PhoneCall size={26} /></div>
            <div>
              <h2 className="text-xl font-extrabold">Not live for calls</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">The website should continue showing the live business number. Do not advertise “Talk to Cue” or change 800.com routing until a separate test number has completed the signed-webhook, escalation, and human-handoff checks.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ReadinessRow label="ElevenLabs webhook secret" ready={Boolean(configured?.webhookSecret)} />
            <ReadinessRow label="ElevenLabs SDK credential" ready={Boolean(configured?.apiKey)} />
          </div>
          <p className={`mt-4 text-xs font-semibold ${fullyConfigured ? "text-emerald-300" : "text-amber-200"}`}>
            {fullyConfigured ? "Server configuration is present. A signed test-event verification is still required before any agent can be enabled." : "Server configuration is intentionally incomplete. No provider connection can receive or store call events yet."}
          </p>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3"><ShieldCheck className="text-blue-600" size={22} /><h2 className="text-lg font-extrabold">Bounded access model</h2></div>
            <p className="mt-2 text-sm leading-6 text-slate-600">Cue’s existing integration stays read-only. A future phone agent receives a separate, revocable <code className="rounded bg-slate-100 px-1.5 py-0.5">phone_leads:write</code> credential for only three actions: capture a qualified phone lead, update a limited lead field set, and attach a call summary.</p>
            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={16} />Deduplicated provider event ledger; retries cannot produce duplicate summaries.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={16} />Signed HMAC post-call webhook with the provider’s official SDK verifier.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={16} />No recordings or raw transcripts stored by this foundation.</li>
              <li className="flex gap-2"><XCircle className="mt-0.5 shrink-0 text-red-500" size={16} />No autonomous outbound calls, SMS, payments, forwarding, or account changes.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3"><KeyRound className="text-blue-600" size={22} /><h2 className="text-lg font-extrabold">Voice tool credential</h2></div>
            <p className="mt-2 text-sm leading-6 text-slate-600">Create this only after the ElevenLabs tool configuration is reviewed. The value appears once and must be stored as a secret in the provider, never in a prompt or browser script.</p>
            <label className="mt-5 block text-sm font-bold text-slate-800" htmlFor="voice-key-label">Key label</label>
            <input id="voice-key-label" value={label} onChange={(event) => setLabel(event.target.value)} maxLength={80} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
            <button onClick={() => createKey.mutate({ label })} disabled={createKey.isPending || label.trim().length < 2} className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              {createKey.isPending ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />} Create scoped voice key
            </button>
            {newKey && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex gap-2 text-amber-900"><TriangleAlert className="mt-0.5 shrink-0" size={17} /><div><p className="text-sm font-extrabold">Copy this key now</p><p className="mt-1 text-xs leading-5">It cannot be shown again after you leave this page.</p></div></div><code className="mt-3 block break-all rounded-xl border border-amber-200 bg-white p-3 text-xs text-slate-800">{newKey}</code><button onClick={() => copy(newKey, "Voice key")} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white"><Copy size={14} />Copy key</button></div>}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <h2 className="text-lg font-extrabold">Before routing approval</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Complete these operational checks in order. They are intentionally human-controlled and do not change the FlowSites 800.com number.</p>
          <ol className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <li className="rounded-2xl bg-slate-50 p-4"><b className="text-blue-700">1. Read-only 800.com audit.</b><br />Confirm forwarding, hours, voicemail, recordings, and whether compatible SIP trunking is actually available.</li>
            <li className="rounded-2xl bg-slate-50 p-4"><b className="text-blue-700">2. Separate test number.</b><br />Validate ElevenLabs inbound calls and a human-transfer destination without touching the live public route.</li>
            <li className="rounded-2xl bg-slate-50 p-4"><b className="text-blue-700">3. Signed webhook test.</b><br />Set server-only secrets, confirm signature rejection, and confirm duplicate post-call events are harmless.</li>
            <li className="rounded-2xl bg-slate-50 p-4"><b className="text-blue-700">4. Human approval.</b><br />Review greeting, disclosure, knowledge boundaries, escalation route, retention, and rollback before any number routing change.</li>
          </ol>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-extrabold">Voice credentials</h2><p className="mt-1 text-sm text-slate-600">Revoke a credential immediately if an agent or tool is disconnected.</p></div></div>
          {keysQuery.isLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div> : keysQuery.data?.length ? <div className="mt-5 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><tr><th className="pb-3 pr-4">Label</th><th className="pb-3 pr-4">Key</th><th className="pb-3 pr-4">Last used</th><th className="pb-3 pr-4">Status</th><th className="pb-3 text-right">Action</th></tr></thead><tbody>{keysQuery.data.map((key) => <tr key={key.id} className="border-b border-slate-100 last:border-0"><td className="py-4 pr-4 font-semibold text-slate-800">{key.label}</td><td className="py-4 pr-4 font-mono text-xs text-slate-500">{key.keyPrefix}…</td><td className="py-4 pr-4 text-slate-600">{formatDate(key.lastUsedAt)}</td><td className="py-4 pr-4">{key.revokedAt ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">Revoked</span> : <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Active</span>}</td><td className="py-4 text-right">{!key.revokedAt && <button onClick={() => { if (window.confirm(`Revoke ${key.label}? The agent will immediately lose phone-lead access.`)) revokeKey.mutate({ keyId: key.id }); }} disabled={revokeKey.isPending} className="text-xs font-bold text-red-600 hover:text-red-700">Revoke</button>}</td></tr>)}</tbody></table></div> : <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">No voice keys have been created. That is the expected state until provider and test-number verification are complete.</p>}
        </section>
      </div>
    </main>
  );
}

function ReadinessRow({ label, ready }: { label: string; ready: boolean }) {
  return <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-3 text-sm"><span className={`h-2.5 w-2.5 rounded-full ${ready ? "bg-emerald-400" : "bg-amber-300"}`} />{label}<span className="ml-auto text-xs font-bold uppercase tracking-wide text-slate-300">{ready ? "Present" : "Not set"}</span></div>;
}
