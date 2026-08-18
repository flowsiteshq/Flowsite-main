/**
 * Tests for opportunity pool payout procedures:
 *   - opportunity.repGetMyPoolClients
 *   - opportunity.adminConfirmPayout
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";

// ─── Shared mocks ────────────────────────────────────────────────────────────

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  then: undefined as any,
};

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
  getAdminSession: vi.fn().mockResolvedValue({ id: 1, token: "admin-token" }),
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col: any, val: any) => ({ col, val })),
}));

vi.mock("../drizzle/schema", () => ({
  opportunityPool: { id: "id", claimedByTechnicianId: "claimedByTechnicianId" },
  technicians: { id: "id", openId: "openId", status: "status" },
}));

// ─── Helper to create a caller ───────────────────────────────────────────────

function makeCaller(overrides: Record<string, any> = {}) {
  return appRouter.createCaller({
    req: {
      cookies: { admin_session: "admin-token" },
      headers: {},
      ...overrides.req,
    },
    res: {} as any,
    user: overrides.user ?? null,
  } as any);
}

// ─── repGetMyPoolClients ──────────────────────────────────────────────────────

describe("opportunity.repGetMyPoolClients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws UNAUTHORIZED when not logged in", async () => {
    const caller = makeCaller({ user: null });
    await expect(caller.opportunity.repGetMyPoolClients()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("throws FORBIDDEN when user is not an active technician", async () => {
    const { getDb } = await import("./db");
    (getDb as any).mockResolvedValue({
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]), // no technician row
    });

    const caller = makeCaller({ user: { openId: "user-open-id" } });
    await expect(caller.opportunity.repGetMyPoolClients()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("returns claimed opportunities for the authenticated rep", async () => {
    const fakeTech = { id: 42, openId: "rep-open-id", status: "active", name: "Alice" };
    const fakeOpps = [
      { id: 1, businessName: "Acme Dojo", claimedByTechnicianId: 42, status: "claimed", estimatedMonthlyCents: 4900, confirmedPayoutCents: null },
    ];

    const { getDb } = await import("./db");
    let callCount = 0;
    (getDb as any).mockResolvedValue({
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockImplementation(() => {
        callCount++;
        // First call: technician lookup; second call: pool query
        if (callCount === 1) return { limit: vi.fn().mockResolvedValue([fakeTech]) };
        return Promise.resolve(fakeOpps);
      }),
      limit: vi.fn().mockResolvedValue([fakeTech]),
    });

    const caller = makeCaller({ user: { openId: "rep-open-id" } });
    const result = await caller.opportunity.repGetMyPoolClients();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── adminConfirmPayout ───────────────────────────────────────────────────────

describe("opportunity.adminConfirmPayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws UNAUTHORIZED without admin session", async () => {
    const { getAdminSession } = await import("./db");
    (getAdminSession as any).mockResolvedValue(null);

    const caller = makeCaller({ req: { cookies: {}, headers: {} } });
    await expect(
      caller.opportunity.adminConfirmPayout({ opportunityId: 1, confirmedPayoutCents: 735 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("confirms payout and marks opportunity as converted", async () => {
    const mockUpdate = vi.fn().mockReturnThis();
    const mockSet = vi.fn().mockReturnThis();
    const mockWhere = vi.fn().mockResolvedValue([]);

    const { getDb, getAdminSession } = await import("./db");
    // Ensure admin session is valid for this test
    (getAdminSession as any).mockResolvedValue({ id: 1, token: "admin-token" });
    (getDb as any).mockResolvedValue({
      update: mockUpdate,
      set: mockSet,
      where: mockWhere,
    });

    const caller = makeCaller();
    const result = await caller.opportunity.adminConfirmPayout({
      opportunityId: 5,
      confirmedPayoutCents: 735,
    });

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        confirmedPayoutCents: 735,
        status: "converted",
      })
    );
  });

  it("rejects negative payout amounts", async () => {
    const caller = makeCaller();
    await expect(
      caller.opportunity.adminConfirmPayout({ opportunityId: 1, confirmedPayoutCents: -1 })
    ).rejects.toThrow();
  });
});
