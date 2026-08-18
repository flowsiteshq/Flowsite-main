import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

const LOGO_URL = "/flowsites-logo.png";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

function getGoogleLoginUrl(returnTo = "/client-portal") {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `/api/auth/google?origin=${encodeURIComponent(origin)}&returnTo=${encodeURIComponent(returnTo)}`;
}

export default function Login() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const loginMutation = trpc.emailAuth.login.useMutation({
    onSuccess: () => {
      navigate("/portal");
    },
    onError: (err) => setError(err.message),
  });

  const registerMutation = trpc.emailAuth.register.useMutation({
    onSuccess: () => {
      navigate("/portal");
    },
    onError: (err) => setError(err.message),
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ ...loginForm, rememberMe, isAdmin: false });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    registerMutation.mutate({
      name: registerForm.name,
      email: registerForm.email,
      password: registerForm.password,
      rememberMe,
    });
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="light-auth-shell min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-white border-r border-slate-200 flex-col justify-between p-12">
        <div>
          <img src={LOGO_URL} alt="FlowSites" className="h-10 w-auto rounded-lg ring-1 ring-slate-200" />
        </div>
        <div>
          <p className="text-slate-900 text-3xl leading-tight font-semibold mb-4">Your business workspace, all in one place.</p>
          <p className="max-w-md text-slate-500 leading-relaxed">Access your website project, billing, messages, and next steps from a simple, organized FlowSites workspace.</p>
        </div>
        <p className="text-slate-400 text-sm">© {new Date().getFullYear()} FlowSites. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <img src={LOGO_URL} alt="FlowSites" className="h-7 w-auto" />
          </div>

          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
              <ArrowLeft size={14} />
              Back to site
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-gray-500 text-sm">
              {mode === "login"
                ? "Sign in to access your client portal."
                : "Get access to your project dashboard and billing."}
            </p>
          </div>

          {/* Tab switcher */}
          {/* Google Sign In — Primary */}
          <a
            href={getGoogleLoginUrl()}
            className="flex items-center justify-center gap-3 w-full h-11 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-all mb-4 shadow-sm"
          >
            <GoogleIcon />
            Continue with Google
          </a>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or continue with email</span></div>
          </div>

          <div className="flex rounded-lg border border-gray-200 p-1 mb-6 bg-gray-50">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === "register" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
              {error}
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1.5 block">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(f => ({ ...f, email: e.target.value }))}
                  required
                  className="h-11 border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    required
                    className="h-11 border-gray-200 focus:border-gray-900 focus:ring-gray-900 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(v) => setRememberMe(!!v)}
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">Remember me</Label>
                </div>
                <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="reg-name" className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</Label>
                <Input
                  id="reg-name"
                  type="text"
                  placeholder="Your name"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="h-11 border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>
              <div>
                <Label htmlFor="reg-email" className="text-sm font-medium text-gray-700 mb-1.5 block">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm(f => ({ ...f, email: e.target.value }))}
                  required
                  className="h-11 border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>
              <div>
                <Label htmlFor="reg-password" className="text-sm font-medium text-gray-700 mb-1.5 block">Password</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(f => ({ ...f, password: e.target.value }))}
                    required
                    minLength={8}
                    className="h-11 border-gray-200 focus:border-gray-900 focus:ring-gray-900 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="reg-confirm" className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm Password</Label>
                <Input
                  id="reg-confirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  required
                  className="h-11 border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember-reg"
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(!!v)}
                />
                <Label htmlFor="remember-reg" className="text-sm text-gray-600 cursor-pointer">Keep me signed in</Label>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                Create Account
              </Button>
              <p className="text-xs text-gray-400 text-center">
                By registering, you agree to our{" "}
                <Link href="/terms-of-service" className="underline hover:text-gray-600">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy-policy" className="underline hover:text-gray-600">Privacy Policy</Link>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
