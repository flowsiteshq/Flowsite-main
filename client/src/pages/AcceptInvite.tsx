/**
 * AcceptInvite — Client portal invite acceptance page
 * URL: /accept-invite?token=<inviteToken>
 * Flow: User arrives → if not logged in, redirects to login → returns here → accepts invite → redirects to /client-billing
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function AcceptInvite() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<"idle" | "accepting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [businessName, setBusinessName] = useState("");

  // Extract token from query string
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const acceptInviteMutation = trpc.clientBilling.acceptInvite.useMutation({
    onSuccess: (data) => {
      setBusinessName(data.businessName ?? "");
      setStatus("success");
      // Redirect to client billing portal after 2 seconds
      setTimeout(() => navigate("/client-billing"), 2000);
    },
    onError: (err) => {
      setErrorMsg(err.message);
      setStatus("error");
    },
  });

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      setErrorMsg("No invite token found in the URL. Please use the full link from your email.");
      setStatus("error");
      return;
    }

    if (!user) {
      // Not logged in — redirect to login with returnPath so OAuth callback brings them back here
      window.location.href = getLoginUrl(`/accept-invite?token=${token}`);
      return;
    }

    // Logged in and have token — accept the invite
    if (status === "idle") {
      setStatus("accepting");
      acceptInviteMutation.mutate({ inviteToken: token });
    }
  }, [authLoading, user, token, status]);

  return (
    <div className="min-h-screen bg-[oklch(0.07_0.005_260)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[oklch(0.5_0.2_25)] to-[oklch(0.35_0.18_25)] flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <p className="text-white/40 text-sm">FlowSites Client Portal</p>
        </div>

        {/* Loading / Accepting */}
        {(authLoading || status === "accepting") && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <Loader2 className="w-10 h-10 text-white/40 animate-spin mx-auto mb-4" />
            <h2 className="text-white text-lg font-semibold mb-2">
              {authLoading ? "Checking your login…" : "Activating your account…"}
            </h2>
            <p className="text-white/40 text-sm">Just a moment, please wait.</p>
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-white text-xl font-bold mb-2">Welcome aboard!</h2>
            {businessName && (
              <p className="text-white/60 text-sm mb-4">
                Your account for <span className="text-white font-semibold">{businessName}</span> is now active.
              </p>
            )}
            <p className="text-white/40 text-sm">Redirecting you to your client portal…</p>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-white text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-white/60 text-sm mb-6">{errorMsg || "Unable to activate your account. Please try again or contact support."}</p>
            <a
              href="/client-billing"
              className="inline-block px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-all"
            >
              Go to Client Portal
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
