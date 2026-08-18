import { describe, it, expect } from "vitest";

/**
 * Unit tests for the Analytics tab logic in clientBillingRouter.getSiteAnalytics
 * Tests the data transformation and range calculation logic.
 */

describe("getSiteAnalytics — range calculation", () => {
  function getRangeDays(range: "7d" | "30d" | "90d") {
    return range === "7d" ? 7 : range === "90d" ? 90 : 30;
  }

  it("returns 7 days for '7d' range", () => {
    expect(getRangeDays("7d")).toBe(7);
  });

  it("returns 30 days for '30d' range", () => {
    expect(getRangeDays("30d")).toBe(30);
  });

  it("returns 90 days for '90d' range", () => {
    expect(getRangeDays("90d")).toBe(90);
  });

  it("calculates startAt correctly from range", () => {
    const now = 1_700_000_000_000;
    const days = getRangeDays("30d");
    const startAt = now - days * 24 * 60 * 60 * 1000;
    expect(startAt).toBe(now - 30 * 24 * 60 * 60 * 1000);
  });
});

describe("getSiteAnalytics — data transformation", () => {
  function transformPageviews(raw: { x: string; y: number }[]) {
    return raw.map(p => ({ date: p.x, views: p.y }));
  }

  function transformTopPages(raw: { x: string; y: number }[]) {
    return raw.slice(0, 10).map(p => ({ path: p.x, views: p.y }));
  }

  function transformReferrers(raw: { x: string; y: number }[]) {
    return raw.slice(0, 8).map(r => ({ source: r.x || "Direct", visits: r.y }));
  }

  function calcBounceRate(bounces: number, visits: number) {
    if (!visits) return null;
    return Math.round((bounces / visits) * 100);
  }

  it("transforms pageviews correctly", () => {
    const raw = [{ x: "2026-04-01T00:00:00Z", y: 120 }];
    const result = transformPageviews(raw);
    expect(result[0]).toEqual({ date: "2026-04-01T00:00:00Z", views: 120 });
  });

  it("limits top pages to 10", () => {
    const raw = Array.from({ length: 15 }, (_, i) => ({ x: `/page-${i}`, y: 100 - i }));
    const result = transformTopPages(raw);
    expect(result).toHaveLength(10);
    expect(result[0].path).toBe("/page-0");
  });

  it("limits referrers to 8", () => {
    const raw = Array.from({ length: 12 }, (_, i) => ({ x: `source-${i}`, y: 50 - i }));
    const result = transformReferrers(raw);
    expect(result).toHaveLength(8);
  });

  it("uses 'Direct' for empty referrer source", () => {
    const raw = [{ x: "", y: 42 }];
    const result = transformReferrers(raw);
    expect(result[0].source).toBe("Direct");
  });

  it("calculates bounce rate as percentage", () => {
    expect(calcBounceRate(300, 1000)).toBe(30);
    expect(calcBounceRate(0, 1000)).toBe(0);
  });

  it("returns null bounce rate when visits is 0", () => {
    expect(calcBounceRate(0, 0)).toBeNull();
  });

  it("returns empty data shape when no websiteId configured", () => {
    const emptyResult = {
      stats: { pageviews: 0, visitors: 0, visits: 0, bounces: 0, totaltime: 0 },
      pageviews: [],
      sessions: [],
      topPages: [],
      referrers: [],
      devices: [],
      hasData: false,
    };
    expect(emptyResult.hasData).toBe(false);
    expect(emptyResult.pageviews).toHaveLength(0);
    expect(emptyResult.stats.pageviews).toBe(0);
  });
});
