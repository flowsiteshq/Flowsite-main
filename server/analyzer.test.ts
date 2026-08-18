import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as pagespeed from "./pagespeed";

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("analyzer.analyze", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should validate URL format", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.analyzer.analyze({ url: "not-a-valid-url" })
    ).rejects.toThrow();
  });

  it("should return analysis results with valid structure", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Mock the analyzeWebsite function to avoid hitting rate limits
    const mockResult = {
      url: "https://example.com",
      performance: 85,
      seo: 92,
      accessibility: 88,
      bestPractices: 90,
      issues: [
        {
          title: "Test Issue",
          description: "This is a test issue",
          severity: "warning" as const,
        },
      ],
      recommendations: [
        "Test recommendation 1",
        "Test recommendation 2",
      ],
      loadTime: 2.5,
      mobileScore: 89,
    };

    vi.spyOn(pagespeed, "analyzeWebsite").mockResolvedValue(mockResult);

    const result = await caller.analyzer.analyze({ 
      url: "https://example.com" 
    });

    expect(result).toBeDefined();
    expect(result.url).toBe("https://example.com");
    expect(result.performance).toBeGreaterThanOrEqual(0);
    expect(result.performance).toBeLessThanOrEqual(100);
    expect(result.seo).toBeGreaterThanOrEqual(0);
    expect(result.seo).toBeLessThanOrEqual(100);
    expect(result.accessibility).toBeGreaterThanOrEqual(0);
    expect(result.accessibility).toBeLessThanOrEqual(100);
    expect(result.bestPractices).toBeGreaterThanOrEqual(0);
    expect(result.bestPractices).toBeLessThanOrEqual(100);
    expect(Array.isArray(result.issues)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(typeof result.loadTime).toBe("number");
    expect(typeof result.mobileScore).toBe("number");
  });

  it("should handle errors gracefully", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Mock an error scenario
    vi.spyOn(pagespeed, "analyzeWebsite").mockRejectedValue(
      new Error("API error")
    );

    await expect(
      caller.analyzer.analyze({ url: "https://example.com" })
    ).rejects.toThrow("API error");
  });
});
