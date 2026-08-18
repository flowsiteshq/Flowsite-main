import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function RepLogin() {
  const handleGoogleSignIn = () => {
    const url = `/api/auth/google?origin=${encodeURIComponent(window.location.origin)}&returnTo=${encodeURIComponent("/rep-dashboard")}&inviteToken=`;
    window.location.href = url;
  };

  return (
    <div className="light-auth-shell min-h-screen flex items-center justify-center px-4">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[oklch(0.5_0.2_25_/_6%)] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[oklch(0.78_0.12_85_/_4%)] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back link */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm mb-6"
          >
            <ArrowLeft size={14} />
            Back to website
          </Link>

          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.5_0.2_25)] to-[oklch(0.4_0.18_25)] flex items-center justify-center shadow-lg shadow-[oklch(0.5_0.2_25_/_30%)]">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span
              className="text-white font-bold text-2xl"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              FlowSites
            </span>
          </div>
          <p className="text-white/40 text-sm">Team Member Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <h1 className="text-white text-xl font-semibold text-center mb-2">
            Sign in to your dashboard
          </h1>
          <p className="text-white/50 text-sm text-center mb-8">
            Use your Google account to access the FlowSites rep dashboard
          </p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg"
          >
            <svg width="20" height="20" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-center text-white/25 text-xs mt-6">
            Only invited team members can access this portal.
            <br />
            Contact your manager if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}
