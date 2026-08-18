/**
 * Admin Login Page — FlowSites Premium Branded Design
 * Hidden URL: /flowsites-admin-secret
 * Supports email+password login
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  BarChart3,
  Users,
  Zap,
  TrendingUp,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ── Stat cards shown on the left panel ────────────────────────────────────────
const STATS = [
  { icon: Users, label: "Active Clients", value: "47" },
  { icon: TrendingUp, label: "Leads This Month", value: "312" },
  { icon: BarChart3, label: "Avg. Conversion", value: "18%" },
  { icon: Zap, label: "Sites Live", value: "52" },
];

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const verifyQuery = trpc.admin.verify.useQuery(undefined, { retry: false });

  useEffect(() => {
    if (verifyQuery.data?.authenticated) {
      navigate("/flowsites-admin-dashboard");
    }
  }, [verifyQuery.data, navigate]);

  const emailLoginMutation = trpc.emailAuth.login.useMutation({
    onSuccess: () => navigate("/flowsites-admin-dashboard"),
    onError: (err) => setError(err.message || "Invalid credentials."),
  });

  const legacyLoginMutation = trpc.admin.login.useMutation({
    onSuccess: (data) => {
      if (data.token) localStorage.setItem("admin_session_token", data.token);
      navigate("/flowsites-admin-dashboard");
    },
    onError: () => setError("Invalid credentials. Please try again."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    emailLoginMutation.mutate({ email, password, rememberMe: true, isAdmin: true });
  };

  const isLoading = emailLoginMutation.isPending || legacyLoginMutation.isPending;

  if (verifyQuery.isLoading) {
    return (
      <div className="light-auth-shell min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="light-auth-shell min-h-screen flex">
      {/* ── LEFT PANEL — Bright branded ───────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] bg-white border-r border-slate-200 flex-col relative overflow-hidden">
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Red glow orb — top left */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
        {/* Subtle red glow — bottom right */}
        <div className="absolute -bottom-40 right-0 w-[400px] h-[400px] rounded-full bg-red-700/8 blur-[100px] pointer-events-none" />

        {/* Top — Logo */}
        <div className="relative z-10 p-10">
          <img
            src="/flowsites-logo.png"
            alt="FlowSites"
            className="h-9 w-auto object-contain"
          />
        </div>

        {/* Middle — Hero copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10 pb-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-7 w-fit">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/60 text-xs font-medium tracking-wide">Admin Portal</span>
          </div>

          <h2
            className="text-4xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-display, inherit)" }}
          >
            Your agency,<br />
            <span className="text-red-500">fully in control.</span>
          </h2>
          <p className="text-white/45 text-sm leading-relaxed max-w-xs mb-10">
            Manage leads, clients, projects, billing, and your team — all from one powerful dashboard.
          </p>

          {/* Stat grid */}
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {STATS.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-white/8 bg-white/4 backdrop-blur-sm p-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
                    <Icon size={13} className="text-red-400" />
                  </div>
                  <span className="text-white/40 text-[11px] font-medium leading-tight">{label}</span>
                </div>
                <span className="text-white text-2xl font-bold tracking-tight">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 px-10 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={12} className="text-white/25" />
            <span className="text-white/25 text-xs">256-bit encrypted · SOC 2 compliant</span>
          </div>
          <p className="text-white/15 text-xs">© {new Date().getFullYear()} FlowSites. All rights reserved.</p>
        </div>
      </div>

      {/* ── RIGHT PANEL — Login form ───────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <img
              src="/flowsites-logo.png"
              alt="FlowSites"
              className="h-8 w-auto object-contain"
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mb-5 shadow-lg shadow-red-500/25">
              <Lock size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Admin Sign In</h1>
            <p className="text-gray-500 text-sm">
              Access the{" "}
              <span className="font-semibold text-red-600">FlowSites</span>{" "}
              agency dashboard.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-red-500">⚠</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="admin-email"
                className="text-sm font-semibold text-gray-700 mb-1.5 block"
              >
                Email
              </Label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@flow-sites.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 pl-10 border-gray-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/10 rounded-xl transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="admin-password"
                className="text-sm font-semibold text-gray-700 mb-1.5 block"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 border-gray-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/10 rounded-xl pr-10 transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl transition-all shadow-md shadow-red-500/20 hover:shadow-red-500/35 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Access Dashboard
                  <ArrowRight size={15} />
                </>
              )}
            </Button>
          </form>

          {/* Footer links */}
          <div className="mt-5 text-center space-y-2">
            <a
              href="/forgot-password"
              className="text-xs text-gray-500 hover:text-red-600 transition-colors underline underline-offset-2 block"
            >
              Forgot password?
            </a>
            <p className="text-[11px] text-gray-400">
              Restricted area. Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
