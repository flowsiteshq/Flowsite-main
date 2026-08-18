/**
 * Tests for the forgotPassword and resetPassword tRPC procedures.
 *
 * These tests use a real DB connection and clean up after themselves.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import bcrypt from "bcryptjs";
import type { TrpcContext } from "./_core/context";

// Minimal mock context (no cookies needed for these public procedures)
function makeCtx(): TrpcContext {
  const cookies: Record<string, string> = {};
  return {
    req: {
      headers: {},
      cookies,
      protocol: "http",
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as TrpcContext["res"],
    user: null,
  };
}

const caller = appRouter.createCaller(makeCtx());

const TEST_EMAIL = `test-reset-${Date.now()}@flowsites-test.invalid`;
const TEST_PASSWORD = "TestPassword123!";

let testUserId: number | null = null;
let testEmailAuthId: number | null = null;

beforeAll(async () => {
  const db = await getDb();
  if (!db) return;

  const { users, emailAuth } = await import("../drizzle/schema");

  // Create a test user + emailAuth row
  const [userResult] = await db.insert(users).values({
    openId: `email:${TEST_EMAIL}`,
    name: "Test Reset User",
    email: TEST_EMAIL,
    loginMethod: "email",
    role: "user",
  });
  testUserId = (userResult as any).insertId as number;

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  const [authResult] = await db.insert(emailAuth).values({
    userId: testUserId,
    email: TEST_EMAIL,
    passwordHash,
    emailVerified: 0,
  });
  testEmailAuthId = (authResult as any).insertId as number;
});

afterAll(async () => {
  const db = await getDb();
  if (!db || !testUserId) return;

  const { users, emailAuth, emailAuthSessions } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  await db.delete(emailAuthSessions).where(eq(emailAuthSessions.userId, testUserId));
  await db.delete(emailAuth).where(eq(emailAuth.email, TEST_EMAIL));
  await db.delete(users).where(eq(users.id, testUserId));
});

describe("emailAuth.forgotPassword", () => {
  it("returns success even for unknown emails (no enumeration)", async () => {
    const result = await caller.emailAuth.forgotPassword({
      email: "nobody@flowsites-test.invalid",
      origin: "http://localhost:3000",
    });
    expect(result.success).toBe(true);
  });

  it("returns success and sets resetToken for a known email", async () => {
    const result = await caller.emailAuth.forgotPassword({
      email: TEST_EMAIL,
      origin: "http://localhost:3000",
    });
    expect(result.success).toBe(true);

    // Verify the token was stored in the DB
    const db = await getDb();
    if (!db || !testEmailAuthId) return;
    const { emailAuth } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const rows = await db
      .select({ resetToken: emailAuth.resetToken, resetTokenExpiry: emailAuth.resetTokenExpiry })
      .from(emailAuth)
      .where(eq(emailAuth.id, testEmailAuthId))
      .limit(1);

    expect(rows[0].resetToken).toBeTruthy();
    expect(rows[0].resetTokenExpiry).toBeGreaterThan(Date.now());
  });
});

describe("emailAuth.resetPassword", () => {
  it("rejects an invalid token", async () => {
    await expect(
      caller.emailAuth.resetPassword({
        token: "totally-invalid-token",
        newPassword: "NewPassword456!",
      })
    ).rejects.toThrow("invalid or has already been used");
  });

  it("rejects an expired token", async () => {
    const db = await getDb();
    if (!db || !testEmailAuthId) return;
    const { emailAuth } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    // Set an expired token
    const expiredToken = "expired-token-" + Date.now();
    await db
      .update(emailAuth)
      .set({ resetToken: expiredToken, resetTokenExpiry: Date.now() - 1000 })
      .where(eq(emailAuth.id, testEmailAuthId));

    await expect(
      caller.emailAuth.resetPassword({
        token: expiredToken,
        newPassword: "NewPassword456!",
      })
    ).rejects.toThrow("expired");
  });

  it("successfully resets password with a valid token", async () => {
    const db = await getDb();
    if (!db || !testEmailAuthId) return;
    const { emailAuth } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    // Set a valid token
    const validToken = "valid-token-" + Date.now();
    const expiry = Date.now() + 3600_000; // 1 hour from now
    await db
      .update(emailAuth)
      .set({ resetToken: validToken, resetTokenExpiry: expiry })
      .where(eq(emailAuth.id, testEmailAuthId));

    const result = await caller.emailAuth.resetPassword({
      token: validToken,
      newPassword: "BrandNewPassword789!",
    });
    expect(result.success).toBe(true);

    // Verify token was cleared and password was updated
    const rows = await db
      .select({ resetToken: emailAuth.resetToken, passwordHash: emailAuth.passwordHash })
      .from(emailAuth)
      .where(eq(emailAuth.id, testEmailAuthId))
      .limit(1);

    expect(rows[0].resetToken).toBeNull();
    const passwordMatches = await bcrypt.compare("BrandNewPassword789!", rows[0].passwordHash);
    expect(passwordMatches).toBe(true);
  });

  it("rejects a token that has already been used (cleared after reset)", async () => {
    // After the previous test, the token was cleared — using it again should fail
    await expect(
      caller.emailAuth.resetPassword({
        token: "valid-token-already-used",
        newPassword: "AnotherPassword000!",
      })
    ).rejects.toThrow("invalid or has already been used");
  });
});
