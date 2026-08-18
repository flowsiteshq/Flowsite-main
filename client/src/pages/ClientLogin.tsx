import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ClientLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const loginMutation = trpc.clientPortalAuth.login.useMutation({
    onSuccess: () => {
      toast.success("Welcome back! You are now logged in to your client portal.");
      navigate("/client-portal");
    },
    onError: (err) => {
      toast.error(err.message || "Login failed");
    },
  });

  const forgotMutation = trpc.clientPortalAuth.forgotPassword.useMutation({
    onSuccess: () => {
      setForgotSent(true);
    },
    onError: (err) => {
      toast.error(err.message || "An error occurred");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    loginMutation.mutate({ email: email.trim().toLowerCase(), password });
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    forgotMutation.mutate({
      email: forgotEmail.trim().toLowerCase(),
      origin: window.location.origin,
    });
  };

  return (
    <div className="light-auth-shell min-h-screen flex items-center justify-center p-4">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[oklch(0.5_0.2_25_/_6%)] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[oklch(0.78_0.12_85_/_4%)] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors text-sm mb-6">
            <ArrowLeft size={14} />
            Back to website
          </Link>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.5_0.2_25)] to-[oklch(0.4_0.18_25)] flex items-center justify-center shadow-lg shadow-[oklch(0.5_0.2_25_/_30%)]">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-white font-bold text-2xl" style={{ fontFamily: "Outfit, sans-serif" }}>
              FlowSites
            </span>
          </div>
          <p className="text-white/40 text-sm">Client Portal</p>
        </div>

        {mode === "login" ? (
          <Card className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-xl text-center">Sign in to your portal</CardTitle>
              <CardDescription className="text-white/50 text-center">
                Enter your email and password to access your project dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80 text-sm">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[oklch(0.5_0.2_25)] focus:ring-[oklch(0.5_0.2_25_/_20%)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/80 text-sm">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[oklch(0.5_0.2_25)] focus:ring-[oklch(0.5_0.2_25_/_20%)] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-sm text-[oklch(0.7_0.15_25)] hover:text-[oklch(0.8_0.15_25)] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loginMutation.isPending || !email || !password}
                  className="w-full bg-gradient-to-r from-[oklch(0.5_0.2_25)] to-[oklch(0.4_0.18_25)] hover:from-[oklch(0.55_0.22_25)] hover:to-[oklch(0.45_0.2_25)] text-white font-semibold shadow-lg shadow-[oklch(0.5_0.2_25_/_25%)] border-0"
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-transparent px-2 text-white/30">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const url = `/api/auth/google?origin=${encodeURIComponent(window.location.origin)}&returnTo=${encodeURIComponent('/client-portal')}&inviteToken=`;
                  window.location.href = url;
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-md border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-sm font-medium transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>

              <p className="text-center text-white/30 text-xs mt-4">
                Don't have access yet? Contact your account manager to receive a portal invite.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-xl text-center">
                {forgotSent ? "Check your email" : "Reset your password"}
              </CardTitle>
              <CardDescription className="text-white/50 text-center">
                {forgotSent
                  ? "If an account exists for that email, we've sent a password reset link."
                  : "Enter your email and we'll send you a reset link."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!forgotSent ? (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email" className="text-white/80 text-sm">Email address</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[oklch(0.5_0.2_25)] focus:ring-[oklch(0.5_0.2_25_/_20%)]"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={forgotMutation.isPending || !forgotEmail}
                    className="w-full bg-gradient-to-r from-[oklch(0.5_0.2_25)] to-[oklch(0.4_0.18_25)] hover:from-[oklch(0.55_0.22_25)] hover:to-[oklch(0.45_0.2_25)] text-white font-semibold shadow-lg shadow-[oklch(0.5_0.2_25_/_25%)] border-0"
                  >
                    {forgotMutation.isPending ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white/60 text-sm">Check your inbox and follow the link to reset your password.</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => { setMode("login"); setForgotSent(false); setForgotEmail(""); }}
                className="w-full mt-4 text-sm text-white/40 hover:text-white/70 transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft size={14} />
                Back to sign in
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
