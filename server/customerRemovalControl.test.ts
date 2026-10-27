import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import type { TrpcContext } from "./_core/context";
import { isBlockingSubscriptionStatus, isValidCustomerDeletionCode } from "./customerRemoval";

const TEST_SUFFIX = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const TEST_EMAIL = `removal-test-${TEST_SUFFIX}@flowsites-test.invalid`;
const TEST_BUSINESS = `Removal Test Business ${TEST_SUFFIX}`;
const TEST_CODE = `remove-${TEST_SUFFIX}`;
let accountId: number | null = null;
let projectId: number | null = null;

function makeContext(role: "admin" | "user" = "admin"): TrpcContext {
  return {
    req: { headers: {}, cookies: {}, protocol: "https" } as TrpcContext["req"],
    res: { cookie: () => undefined, clearCookie: () => undefined } as TrpcContext["res"],
    user: {
      id: role === "admin" ? 777_001 : 777_002,
      openId: `${role}-removal-${TEST_SUFFIX}`,
      name: role === "admin" ? "Removal Test Administrator" : "Removal Test User",
      email: `${role}-removal-${TEST_SUFFIX}@flowsites-test.invalid`,
      loginMethod: "google",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  };
}

beforeAll(async () => {
  process.env.CUSTOMER_DELETION_CODE = TEST_CODE;
  const db = await getDb();
  if (!db) return;
  const { clientAccounts, clientPortalPasswords, clientPortalSessions, clientProjects } = await import("../drizzle/schema");

  const [projectResult] = await db.insert(clientProjects).values({
    clientName: "Removal Test Client",
    clientEmail: TEST_EMAIL,
    businessName: TEST_BUSINESS,
    accessToken: `access-${TEST_SUFFIX}`,
    status: "onboarding",
    currentStage: 0,
    stageProgress: 0,
  });
  projectId = Number((projectResult as { insertId: number }).insertId);

  const [accountResult] = await db.insert(clientAccounts).values({
    projectId,
    clientOpenId: `client-removal-${TEST_SUFFIX}`,
    clientName: "Removal Test Client",
    clientEmail: TEST_EMAIL,
    businessName: TEST_BUSINESS,
    monthlyPriceCents: 4900,
    status: "active",
    inviteAccepted: 1,
  });
  accountId = Number((accountResult as { insertId: number }).insertId);

  await db.insert(clientPortalPasswords).values({
    clientEmail: TEST_EMAIL,
    passwordHash: "not-a-live-password-hash",
  });
  await db.insert(clientPortalSessions).values({
    clientEmail: TEST_EMAIL,
    sessionToken: `session-${TEST_SUFFIX}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
});

afterAll(async () => {
  const db = await getDb();
  if (db) {
    const { clientAccounts, clientPortalPasswords, clientPortalSessions, clientProjects, customerRemovalAuditLogs } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    await db.delete(clientPortalSessions).where(eq(clientPortalSessions.clientEmail, TEST_EMAIL));
    await db.delete(clientPortalPasswords).where(eq(clientPortalPasswords.clientEmail, TEST_EMAIL));
    if (accountId) await db.delete(customerRemovalAuditLogs).where(eq(customerRemovalAuditLogs.clientAccountId, accountId));
    if (accountId) await db.delete(clientAccounts).where(eq(clientAccounts.id, accountId));
    if (projectId) await db.delete(clientProjects).where(eq(clientProjects.id, projectId));
  }
  delete process.env.CUSTOMER_DELETION_CODE;
});

describe("customer removal control", () => {
  it("uses a timing-safe configured deletion code and blocks live Stripe states", () => {
    expect(isValidCustomerDeletionCode(TEST_CODE)).toBe(true);
    expect(isValidCustomerDeletionCode("incorrect-code")).toBe(false);
    expect(isBlockingSubscriptionStatus("active")).toBe(true);
    expect(isBlockingSubscriptionStatus("trialing")).toBe(true);
    expect(isBlockingSubscriptionStatus("cancelled")).toBe(false);
    expect(isBlockingSubscriptionStatus(undefined)).toBe(false);
  });

  it("rejects a non-administrator before a customer can be removed", async () => {
    if (!accountId) return;
    const caller = appRouter.createCaller(makeContext("user"));
    await expect(caller.clientBilling.adminRemoveCustomer({
      source: "billing",
      accountId,
      businessNameConfirmation: TEST_BUSINESS,
      deletionCode: TEST_CODE,
      reason: "Customer asked to close the account.",
    })).rejects.toThrow();
  });

  it("rejects an incorrect deletion code and keeps the account active", async () => {
    if (!accountId) return;
    const caller = appRouter.createCaller(makeContext("admin"));
    await expect(caller.clientBilling.adminRemoveCustomer({
      source: "billing",
      accountId,
      businessNameConfirmation: TEST_BUSINESS,
      deletionCode: "incorrect-code",
      reason: "Customer asked to close the account.",
    })).rejects.toThrow("deletion code is incorrect");

    const db = await getDb();
    if (!db) return;
    const { clientAccounts } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const [account] = await db.select().from(clientAccounts).where(eq(clientAccounts.id, accountId)).limit(1);
    expect(account.removedAt).toBeNull();
    expect(account.status).toBe("active");
  });

  it("requires the exact business name, revokes portal access, and writes an audit record", async () => {
    if (!accountId || !projectId) return;
    const caller = appRouter.createCaller(makeContext("admin"));
    await expect(caller.clientBilling.adminRemoveCustomer({
      source: "billing",
      accountId,
      businessNameConfirmation: "Wrong business",
      deletionCode: TEST_CODE,
      reason: "Customer asked to close the account.",
    })).rejects.toThrow("Enter the business name exactly");

    await expect(caller.clientBilling.adminRemoveCustomer({
      source: "billing",
      accountId,
      businessNameConfirmation: TEST_BUSINESS,
      deletionCode: TEST_CODE,
      reason: "Customer asked to close the account.",
    })).resolves.toMatchObject({ success: true, businessName: TEST_BUSINESS, removedType: "billing_account" });

    const db = await getDb();
    if (!db) return;
    const { clientAccounts, clientPortalPasswords, clientPortalSessions, clientProjects, customerRemovalAuditLogs } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const [account] = await db.select().from(clientAccounts).where(eq(clientAccounts.id, accountId)).limit(1);
    const [project] = await db.select().from(clientProjects).where(eq(clientProjects.id, projectId)).limit(1);
    const sessions = await db.select().from(clientPortalSessions).where(eq(clientPortalSessions.clientEmail, TEST_EMAIL));
    const passwords = await db.select().from(clientPortalPasswords).where(eq(clientPortalPasswords.clientEmail, TEST_EMAIL));
    const audits = await db.select().from(customerRemovalAuditLogs).where(eq(customerRemovalAuditLogs.clientAccountId, accountId));

    expect(account.status).toBe("cancelled");
    expect(account.removedAt).toBeInstanceOf(Date);
    expect(account.clientOpenId).toBeNull();
    expect(project.portalAccessRevokedAt).toBeInstanceOf(Date);
    expect(project.accessToken).toBeNull();
    expect(sessions).toHaveLength(0);
    expect(passwords).toHaveLength(0);
    expect(audits).toHaveLength(1);
    expect(audits[0]).toMatchObject({
      businessName: TEST_BUSINESS,
      clientEmail: TEST_EMAIL,
      removalMethod: "billing_account_deactivated",
      removalReason: "Customer asked to close the account.",
    });

    const activeAccounts = await caller.clientBilling.adminListAccounts();
    expect(activeAccounts.some((active) => active.id === accountId)).toBe(false);
  });
});
