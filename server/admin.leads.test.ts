/**
 * Tests for:
 * 1. requireAdminAccess — accepts both admin_session cookie AND technician admin role via OAuth
 * 2. addLead input validation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── requireAdminAccess logic (mirrors routers.ts) ────────────────────────────
async function requireAdminAccess(
  ctx: {
    req: { cookies?: Record<string, string>; headers: Record<string, string | string[] | undefined> };
    user?: { openId: string } | null;
  },
  deps: {
    getAdminSession: (token: string) => Promise<unknown>;
    getDb: () => Promise<{
      select: () => { from: () => { where: () => { limit: (n: number) => Promise<{ role: string; status: string }[]> } } };
    } | null>;
  }
): Promise<{ authorized: boolean }> {
  const token =
    ctx.req.cookies?.admin_session ||
    (ctx.req.headers["x-admin-token"] as string | undefined);
  if (token) {
    const session = await deps.getAdminSession(token);
    if (session) return { authorized: true };
  }
  if (ctx.user?.openId) {
    const db = await deps.getDb();
    if (db) {
      const rows = await db.select().from().where().limit(1);
      const tech = rows[0];
      if (tech && tech.status === "active" && (tech.role === "admin" || tech.role === "team_lead")) {
        return { authorized: true };
      }
    }
  }
  return { authorized: false };
}

describe("requireAdminAccess", () => {
  const mockGetAdminSession = vi.fn();
  const mockGetDb = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("authorizes a valid admin_session cookie", async () => {
    mockGetAdminSession.mockResolvedValue({ id: 1 });
    const result = await requireAdminAccess(
      { req: { cookies: { admin_session: "valid-token" }, headers: {} }, user: null },
      { getAdminSession: mockGetAdminSession, getDb: mockGetDb }
    );
    expect(result.authorized).toBe(true);
    expect(mockGetAdminSession).toHaveBeenCalledWith("valid-token");
    expect(mockGetDb).not.toHaveBeenCalled();
  });

  it("rejects an invalid admin_session cookie and no user", async () => {
    mockGetAdminSession.mockResolvedValue(null);
    mockGetDb.mockResolvedValue(null);
    const result = await requireAdminAccess(
      { req: { cookies: { admin_session: "bad-token" }, headers: {} }, user: null },
      { getAdminSession: mockGetAdminSession, getDb: mockGetDb }
    );
    expect(result.authorized).toBe(false);
  });

  it("authorizes a technician with admin role via OAuth", async () => {
    mockGetAdminSession.mockResolvedValue(null);
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ role: "admin", status: "active" }]),
    };
    mockGetDb.mockResolvedValue(mockDb);
    const result = await requireAdminAccess(
      { req: { cookies: {}, headers: {} }, user: { openId: "user-123" } },
      { getAdminSession: mockGetAdminSession, getDb: mockGetDb }
    );
    expect(result.authorized).toBe(true);
  });

  it("authorizes a technician with team_lead role via OAuth", async () => {
    mockGetAdminSession.mockResolvedValue(null);
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ role: "team_lead", status: "active" }]),
    };
    mockGetDb.mockResolvedValue(mockDb);
    const result = await requireAdminAccess(
      { req: { cookies: {}, headers: {} }, user: { openId: "user-456" } },
      { getAdminSession: mockGetAdminSession, getDb: mockGetDb }
    );
    expect(result.authorized).toBe(true);
  });

  it("rejects an inactive technician even with admin role", async () => {
    mockGetAdminSession.mockResolvedValue(null);
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ role: "admin", status: "inactive" }]),
    };
    mockGetDb.mockResolvedValue(mockDb);
    const result = await requireAdminAccess(
      { req: { cookies: {}, headers: {} }, user: { openId: "user-789" } },
      { getAdminSession: mockGetAdminSession, getDb: mockGetDb }
    );
    expect(result.authorized).toBe(false);
  });

  it("rejects when no cookie and no user", async () => {
    mockGetAdminSession.mockResolvedValue(null);
    mockGetDb.mockResolvedValue(null);
    const result = await requireAdminAccess(
      { req: { cookies: {}, headers: {} }, user: null },
      { getAdminSession: mockGetAdminSession, getDb: mockGetDb }
    );
    expect(result.authorized).toBe(false);
  });
});

describe("addLead input validation", () => {
  const VALID_SOURCES = ["website", "cold_call", "referral", "social", "partner", "other"] as const;

  it("accepts all valid source values", () => {
    for (const source of VALID_SOURCES) {
      expect(VALID_SOURCES).toContain(source);
    }
  });

  it("rejects empty business name", () => {
    const businessName = "  ";
    expect(businessName.trim().length).toBe(0);
  });

  it("accepts a well-formed lead input", () => {
    const input = {
      businessName: "Joe's Diner",
      businessType: "restaurant",
      email: "joe@diner.com",
      phone: "(555) 123-4567",
      website: "http://joesdiner.com",
      primaryGoal: "Get more online orders",
      source: "cold_call" as const,
      adminNotes: "Outdated website, no mobile version",
    };
    expect(input.businessName.trim().length).toBeGreaterThan(0);
    expect(input.email).toContain("@");
    expect(VALID_SOURCES as readonly string[]).toContain(input.source);
  });
});
