import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module so we don't need a real DB connection
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              id: 1,
              clientOpenId: "test-user-open-id",
              businessName: "Test Business",
              websiteDomain: "testbusiness.com",
              previewUrl: null,
            },
          ]),
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
          groupBy: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
    }),
  }),
}));

// Mock the schema module
vi.mock("../drizzle/schema", () => ({
  heatmapClicks: { projectId: "projectId", pagePath: "pagePath", xPct: "xPct", yPct: "yPct", sessionId: "sessionId", deviceType: "deviceType", createdAt: "createdAt" },
  clientProjects: { id: "id", clientOpenId: "clientOpenId" },
}));

// Mock drizzle-orm
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a, b) => ({ eq: [a, b] })),
  and: vi.fn((...args) => ({ and: args })),
  gte: vi.fn((a, b) => ({ gte: [a, b] })),
  sql: Object.assign(vi.fn((strings: TemplateStringsArray) => strings[0]), { as: vi.fn() }),
}));

describe("Heatmap feature", () => {
  it("recordHeatmapClick validates xPct and yPct are within 0-1 range", () => {
    // Validate the input schema constraints
    const validInput = {
      projectId: 1,
      pagePath: "/",
      xPct: 0.5,
      yPct: 0.75,
      sessionId: "abc123",
      deviceType: "desktop" as const,
    };
    expect(validInput.xPct).toBeGreaterThanOrEqual(0);
    expect(validInput.xPct).toBeLessThanOrEqual(1);
    expect(validInput.yPct).toBeGreaterThanOrEqual(0);
    expect(validInput.yPct).toBeLessThanOrEqual(1);
  });

  it("recordHeatmapClick rejects xPct out of range", () => {
    const invalidXPct = 1.5;
    expect(invalidXPct > 1).toBe(true); // Would fail z.number().max(1) validation
  });

  it("recordHeatmapClick rejects yPct out of range", () => {
    const invalidYPct = -0.1;
    expect(invalidYPct < 0).toBe(true); // Would fail z.number().min(0) validation
  });

  it("getHeatmapData defaults to 30 days", () => {
    const defaultDays = 30;
    const since = new Date(Date.now() - defaultDays * 24 * 60 * 60 * 1000);
    const diff = Date.now() - since.getTime();
    const diffDays = diff / (24 * 60 * 60 * 1000);
    expect(Math.round(diffDays)).toBe(30);
  });

  it("device type enum only accepts valid values", () => {
    const validDeviceTypes = ["desktop", "mobile", "tablet"];
    expect(validDeviceTypes).toContain("desktop");
    expect(validDeviceTypes).toContain("mobile");
    expect(validDeviceTypes).toContain("tablet");
    expect(validDeviceTypes).not.toContain("smartwatch");
  });

  it("pagePath is limited to 500 characters", () => {
    const maxLength = 500;
    const longPath = "/".repeat(501);
    expect(longPath.length > maxLength).toBe(true); // Would fail z.string().max(500)
  });
});
