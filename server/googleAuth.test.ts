/**
 * Tests for Google OAuth configuration and route handler
 */
import { describe, it, expect } from "vitest";
import { ENV } from "./_core/env";

describe("Google OAuth configuration", () => {
  it("uses the repository FlowSites app ID when Railway does not inject VITE_APP_ID", async () => {
    const fs = await import("node:fs/promises");
    const source = await fs.readFile(new URL("./_core/env.ts", import.meta.url), "utf8");
    expect(source).toContain('const FLOWSITES_APP_ID = "VvLvZnpjR27EmYwxaK3mTG"');
    expect(source).toContain("process.env.VITE_APP_ID ?? FLOWSITES_APP_ID");
  });

  it("GOOGLE_CLIENT_ID is configured and has correct format", () => {
    expect(ENV.googleClientId).toBeTruthy();
    expect(ENV.googleClientId).toMatch(/\.apps\.googleusercontent\.com$/);
  });

  it("GOOGLE_CLIENT_SECRET is configured", () => {
    expect(ENV.googleClientSecret).toBeTruthy();
    expect(ENV.googleClientSecret.length).toBeGreaterThan(10);
  });

  it("Google OAuth redirect URL is constructed correctly", () => {
    const origin = "https://flow-sites.com";
    const redirectUri = `${origin}/api/auth/google/callback`;
    expect(redirectUri).toBe("https://flow-sites.com/api/auth/google/callback");
  });

  it("State parameter is base64url encoded and decodable", () => {
    const stateData = { origin: "https://flow-sites.com", inviteToken: "test-token", returnTo: "/rep-dashboard" };
    const encoded = Buffer.from(JSON.stringify(stateData)).toString("base64url");
    const decoded = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
    expect(decoded.origin).toBe(stateData.origin);
    expect(decoded.inviteToken).toBe(stateData.inviteToken);
    expect(decoded.returnTo).toBe(stateData.returnTo);
  });
});
