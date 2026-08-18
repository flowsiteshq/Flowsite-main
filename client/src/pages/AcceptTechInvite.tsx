/**
 * AcceptTechInvite — Team member invite acceptance page
 * URL: /accept-tech-invite?token=<inviteToken>
 * Flow: User arrives → clicks "Sign in with Google" → Google OAuth → auto-activates account → /rep-dashboard
 */
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const LOGO_URL = "/flowsites-logo.png";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function AcceptTechInvite() {
  const { user, loading: authLoading } = useAuth();
  const [urlError] = useState(
    () => new URLSearchParams(window.location.search).get("error") ?? ""
  );

  // Extract token from query string
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  // If already logged in and arrived here, they're already activated — redirect
  useEffect(() => {
    if (!authLoading && user) {
      const dest = (user as any).role === "admin" ? "/flowsites-admin-dashboard" : "/rep-dashboard";
      window.location.href = dest;
    }
  }, [authLoading, user]);

  function handleGoogleSignIn() {
    const origin = window.location.origin;
    const returnTo = "/rep-dashboard"; // server will override to /flowsites-admin-dashboard for admins
    const params = new URLSearchParams({
      origin,
      inviteToken: token,
      returnTo,
    });
    window.location.href = `/api/auth/google?${params.toString()}`;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[oklch(0.07_0.005_260)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[oklch(0.5_0.2_25)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.07_0.005_260)] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
        <img src={LOGO_URL} alt="FlowSites" className="h-8 mx-auto mb-8 opacity-90" />

        {!token ? (
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Invalid Invite Link</h2>
            <p className="text-white/60 text-sm">
              This invite link is missing a token. Please use the original link from your invitation email.
            </p>
          </div>
        ) : urlError ? (
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Sign-In Failed</h2>
            <p className="text-white/60 text-sm">
              {urlError === "access_denied"
                ? "You cancelled the Google sign-in. Please try again."
                : `Error: ${urlError}. Please try again or contact your administrator.`}
            </p>
            <button
              onClick={handleGoogleSignIn}
              className="mt-4 flex items-center gap-3 px-6 py-3 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-md mx-auto"
            >
              <GoogleIcon />
              Try Again with Google
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                You've been invited to FlowSites
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                Sign in with your Google account to activate your team account and access the rep dashboard.
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="flex items-center gap-3 px-6 py-3 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-md w-full justify-center"
            >
              <GoogleIcon />
              Sign in with Google
            </button>

            <p className="text-white/30 text-xs">
              Use the same Gmail address that received this invite.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
