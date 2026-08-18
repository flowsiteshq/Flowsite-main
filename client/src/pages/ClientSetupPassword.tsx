import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Contains a number", ok: /\d/.test(password) },
    { label: "Contains a letter", ok: /[a-zA-Z]/.test(password) },
  ];
  return (
    <div className="space-y-1 mt-2">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-2 text-xs">
          {c.ok ? (
            <CheckCircle2 size={12} className="text-green-400 shrink-0" />
          ) : (
            <XCircle size={12} className="text-white/30 shrink-0" />
          )}
          <span className={c.ok ? "text-green-400" : "text-white/40"}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ClientSetupPassword() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  const setupMutation = trpc.clientPortalAuth.setupPassword.useMutation({
    onSuccess: () => {
      setDone(true);
      setTimeout(() => navigate("/client-portal"), 2000);
    },
    onError: (err) => {
      toast.error(err.message || "Setup failed");
    },
  });

  const isValid = password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password);
  const matches = password === confirm && confirm.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !matches) return;
    setupMutation.mutate({ token, password });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[oklch(0.065_0.005_260)] flex items-center justify-center p-4">
        <Card className="bg-white/5 border border-white/10 backdrop-blur-xl max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <XCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-white text-lg font-semibold mb-2">Invalid Setup Link</h2>
            <p className="text-white/50 text-sm">This setup link is missing or invalid. Please contact your account manager for a new invite.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.065_0.005_260)] flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[oklch(0.5_0.2_25_/_6%)] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[oklch(0.78_0.12_85_/_4%)] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.5_0.2_25)] to-[oklch(0.4_0.18_25)] flex items-center justify-center shadow-lg shadow-[oklch(0.5_0.2_25_/_30%)]">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-white font-bold text-2xl" style={{ fontFamily: "Outfit, sans-serif" }}>
              FlowSites
            </span>
          </div>
          <p className="text-white/40 text-sm">Client Portal Setup</p>
        </div>

        <Card className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl text-center">
              {done ? "Password Set!" : "Set Your Password"}
            </CardTitle>
            <CardDescription className="text-white/50 text-center">
              {done
                ? "Your portal access is ready. Redirecting you now..."
                : "Create a secure password to access your FlowSites client portal."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-green-400" />
                </div>
                <p className="text-white/60 text-sm">Redirecting to your portal...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-white/80 text-sm">New password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[oklch(0.5_0.2_25)] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {password.length > 0 && <PasswordStrength password={password} />}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-white/80 text-sm">Confirm password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                    className={`bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[oklch(0.5_0.2_25)] ${
                      confirm.length > 0 && !matches ? "border-red-500/50" : ""
                    }`}
                  />
                  {confirm.length > 0 && !matches && (
                    <p className="text-red-400 text-xs">Passwords do not match.</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={setupMutation.isPending || !isValid || !matches}
                  className="w-full bg-gradient-to-r from-[oklch(0.5_0.2_25)] to-[oklch(0.4_0.18_25)] hover:from-[oklch(0.55_0.22_25)] hover:to-[oklch(0.45_0.2_25)] text-white font-semibold shadow-lg shadow-[oklch(0.5_0.2_25_/_25%)] border-0"
                >
                  {setupMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    "Set Password & Enter Portal"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
