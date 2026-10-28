import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";

function getGooglePasswordSetupUrl() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `/api/auth/google?origin=${encodeURIComponent(origin)}&returnTo=${encodeURIComponent("/flowsites-admin-password-setup")}`;
}

export default function AdminPasswordSetup() {
  const [, navigate] = useLocation();
  const { user, loading, logout } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [completed, setCompleted] = useState(false);

  const passwordSetup = trpc.emailAuth.adminSetOwnPassword.useMutation({
    onSuccess: () => setCompleted(true),
  });

  const isAdmin = user?.role === "admin";
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isValid = password.length >= 8 && passwordsMatch;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) return;
    passwordSetup.mutate({ password });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" aria-label="Loading" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#dbeafe,_transparent_42%),linear-gradient(135deg,_#f8fbff,_#eef5ff)] flex items-center justify-center p-6">
        <section className="w-full max-w-md rounded-[2rem] border border-blue-100 bg-white p-8 shadow-[0_24px_80px_rgba(37,99,235,0.13)] text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <ShieldCheck size={26} />
          </div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-blue-600">FlowSites staff access</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Set your admin password</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Sign in with the Google account already approved for FlowSites administration. You can then create your own email-and-password login.
          </p>
          <a
            href={getGooglePasswordSetupUrl()}
            className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[13px] font-bold text-blue-600 ring-1 ring-slate-200">G</span>
            Continue with Google
          </a>
          <button onClick={() => navigate("/admin-login")} className="mt-5 text-sm font-semibold text-slate-500 underline underline-offset-4 hover:text-slate-800">
            Back to admin sign in
          </button>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <section className="w-full max-w-md rounded-[2rem] border border-amber-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <ShieldCheck size={26} />
          </div>
          <h1 className="text-2xl font-bold text-slate-950">Administrator access required</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">This page is available only to approved FlowSites administrators.</p>
          <button
            onClick={async () => {
              await logout();
              window.location.href = "/admin-login";
            }}
            className="mt-6 text-sm font-semibold text-blue-700 underline underline-offset-4"
          >
            Use another account
          </button>
        </section>
      </main>
    );
  }

  if (completed) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#dbeafe,_transparent_42%),linear-gradient(135deg,_#f8fbff,_#eef5ff)] flex items-center justify-center p-6">
        <section className="w-full max-w-md rounded-[2rem] border border-emerald-100 bg-white p-8 text-center shadow-[0_24px_80px_rgba(37,99,235,0.13)]">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-950">Password created</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Your FlowSites email-and-password admin login is ready. Keep this password private.
          </p>
          <button onClick={() => navigate("/flowsites-admin-dashboard")} className="mt-7 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700">
            Open admin dashboard
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#dbeafe,_transparent_42%),linear-gradient(135deg,_#f8fbff,_#eef5ff)] flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-[2rem] border border-blue-100 bg-white p-8 shadow-[0_24px_80px_rgba(37,99,235,0.13)]">
        <div className="mb-7 flex items-start justify-between gap-6">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-blue-600">FlowSites staff access</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">Create your password</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">You are signed in as <span className="font-semibold text-slate-800">{user.email}</span>.</p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <KeyRound size={21} />
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">New password</span>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                placeholder="At least 8 characters"
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              placeholder="Repeat your password"
            />
            {confirmPassword && !passwordsMatch ? <span className="mt-2 block text-xs font-medium text-red-600">Passwords do not match.</span> : null}
          </label>

          {passwordSetup.error ? <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{passwordSetup.error.message}</p> : null}

          <button
            type="submit"
            disabled={!isValid || passwordSetup.isPending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {passwordSetup.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound size={16} />}
            Create secure password
          </button>
        </form>

        <p className="mt-5 text-center text-xs leading-5 text-slate-500">This creates access only for the Google-authenticated administrator currently signed in.</p>
      </section>
    </main>
  );
}
