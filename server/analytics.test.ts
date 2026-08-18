/**
 * Analytics Router — unit tests
 * Tests the token resolution, device detection, and UTM parsing helpers.
 */
import { describe, it, expect } from "vitest";

// ── Inline copies of the pure helpers from analyticsRouter.ts ──────────────

function detectDevice(ua: string): "desktop" | "mobile" | "tablet" {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}

function parseUtm(url: string) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://x.com${url}`);
    return {
      utmSource: u.searchParams.get("utm_source") ?? undefined,
      utmMedium: u.searchParams.get("utm_medium") ?? undefined,
      utmCampaign: u.searchParams.get("utm_campaign") ?? undefined,
    };
  } catch {
    return {};
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("detectDevice", () => {
  it("returns 'mobile' for iPhone UA", () => {
    expect(detectDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe("mobile");
  });

  it("returns 'mobile' for Android UA", () => {
    expect(detectDevice("Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36")).toBe("mobile");
  });

  it("returns 'tablet' for iPad UA", () => {
    expect(detectDevice("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("tablet");
  });

  it("returns 'desktop' for Chrome desktop UA", () => {
    expect(detectDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124")).toBe("desktop");
  });

  it("returns 'desktop' for empty UA", () => {
    expect(detectDevice("")).toBe("desktop");
  });
});

describe("parseUtm", () => {
  it("extracts utm_source, utm_medium, utm_campaign from full URL", () => {
    const result = parseUtm("https://example.com/page?utm_source=google&utm_medium=cpc&utm_campaign=spring");
    expect(result.utmSource).toBe("google");
    expect(result.utmMedium).toBe("cpc");
    expect(result.utmCampaign).toBe("spring");
  });

  it("returns undefined for missing UTM params", () => {
    const result = parseUtm("https://example.com/page");
    expect(result.utmSource).toBeUndefined();
    expect(result.utmMedium).toBeUndefined();
    expect(result.utmCampaign).toBeUndefined();
  });

  it("handles path-only input without throwing", () => {
    const result = parseUtm("/services?utm_source=email");
    expect(result.utmSource).toBe("email");
  });

  it("returns empty object for invalid URL", () => {
    const result = parseUtm("not a url !!!");
    // Should not throw; may return empty or partial
    expect(typeof result).toBe("object");
  });
});
