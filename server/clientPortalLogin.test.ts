import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = (relative: string) => fs.readFileSync(path.resolve(process.cwd(), relative), "utf8");

describe("client portal sign-in experience", () => {
  it("keeps the premium responsive FlowSites portal layout", () => {
    const portal = source("client/src/pages/ClientBilling.tsx");

    expect(portal).toContain("function ClientPortalSignIn()");
    expect(portal).toContain('min-h-screen bg-[#eef6ff] text-slate-950 lg:grid');
    expect(portal).toContain("Your business.");
    expect(portal).toContain("All in one place.");
    expect(portal).toContain("function PortalPreview()");
    expect(portal).not.toContain('bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700');
  });

  it("offers password sign-in, secure password setup, password reset, and Google OAuth", () => {
    const portal = source("client/src/pages/ClientBilling.tsx");
    const auth = source("server/routers/clientPortalAuthRouter.ts");
    const login = source("client/src/const.ts");

    expect(portal).toContain("clientPortalAuth.login.useMutation");
    expect(portal).toContain("clientPortalAuth.requestPasswordSetup.useMutation");
    expect(portal).toContain("clientPortalAuth.forgotPassword.useMutation");
    expect(portal).toContain("Sign in to portal");
    expect(portal).toContain("Create your password access");
    expect(portal).toContain("Continue with Google");
    expect(portal).toContain('getLoginUrl("/client-portal")');
    expect(portal).toContain('window.location.assign("/client-portal")');
    expect(auth).toContain("requestPasswordSetup: publicProcedure");
    expect(auth).toContain("Always acknowledge the request, including for unknown email addresses.");
    expect(login).toContain('return `/api/auth/google?${params.toString()}`');
    expect(portal).not.toContain("Continue with Microsoft");
  });

  it("keeps account access controls accessible and avoids password-account enumeration in the UI", () => {
    const portal = source("client/src/pages/ClientBilling.tsx");

    expect(portal).toContain('showPassword ? "text" : "password"');
    expect(portal).toContain('autoComplete="current-password"');
    expect(portal).toContain("Show password");
    expect(portal).toContain("Forgot password?");
    expect(portal).toContain("If the address is associated with a FlowSites client project");
    expect(portal).toContain("For security, access is created only for an email already assigned to a FlowSites client project.");
    expect(portal).toContain('lg:grid-cols-[1.1fr_0.9fr]');
    expect(portal).toContain("Back to website");
    expect(portal).toContain("Contact the FlowSites team");
  });
});
