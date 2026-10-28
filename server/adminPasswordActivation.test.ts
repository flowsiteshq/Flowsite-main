import { afterAll, beforeAll, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { appRouter } from "./routers";
import { getDb } from "./db";
import type { TrpcContext } from "./_core/context";

const stamp = Date.now();
const adminEmail = `admin-password-activation-${stamp}@flowsites-test.invalid`;
const conflictEmail = `conflict-password-activation-${stamp}@flowsites-test.invalid`;
const adminOpenId = `test-admin-${stamp}`;
const otherOpenId = `test-other-${stamp}`;
const collisionOpenId = `test-collision-${stamp}`;
let adminId: number;
let otherUserId: number;

function contextFor(user: { id: number; email: string; role: "admin" | "user" }): TrpcContext {
  return {
    req: { headers: {}, cookies: {}, protocol: "http" } as TrpcContext["req"],
    res: { cookie: () => {}, clearCookie: () => {} } as TrpcContext["res"],
    user: {
      id: user.id,
      openId: `google:${user.email}`,
      email: user.email,
      role: user.role,
    } as TrpcContext["user"],
  };
}

beforeAll(async () => {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const { users, emailAuth } = await import("../drizzle/schema");

  const [admin] = await db.insert(users).values({
    openId: adminOpenId,
    email: adminEmail,
    name: "Password Activation Admin",
    loginMethod: "google",
    role: "admin",
  });
  adminId = Number((admin as any).insertId);

  const [other] = await db.insert(users).values({
    openId: otherOpenId,
    email: conflictEmail,
    name: "Password Activation Conflict",
    loginMethod: "email",
    role: "user",
  });
  otherUserId = Number((other as any).insertId);

  await db.insert(emailAuth).values({
    userId: otherUserId,
    email: conflictEmail,
    passwordHash: await bcrypt.hash("ExistingPassword123!", 10),
    emailVerified: 1,
  });
});

afterAll(async () => {
  const db = await getDb();
  if (!db) return;
  const { users, emailAuth, emailAuthSessions } = await import("../drizzle/schema");
  const { inArray } = await import("drizzle-orm");
  if (adminId || otherUserId) {
    const ids = [adminId, otherUserId].filter(Boolean);
    await db.delete(emailAuthSessions).where(inArray(emailAuthSessions.userId, ids));
    await db.delete(emailAuth).where(inArray(emailAuth.userId, ids));
    await db.delete(users).where(inArray(users.id, ids));
  }
});

describe("emailAuth.adminSetOwnPassword", () => {
  it("creates password access only for the Google-authenticated administrator", async () => {
    const caller = appRouter.createCaller(contextFor({ id: adminId, email: adminEmail, role: "admin" }));
    await expect(caller.emailAuth.adminSetOwnPassword({ password: "SecureAdminPassword123!" })).resolves.toEqual({ success: true, created: true });

    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const { emailAuth } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const [record] = await db.select().from(emailAuth).where(eq(emailAuth.userId, adminId)).limit(1);

    expect(record.email).toBe(adminEmail);
    expect(record.passwordHash).not.toBe("SecureAdminPassword123!");
    await expect(bcrypt.compare("SecureAdminPassword123!", record.passwordHash)).resolves.toBe(true);
    expect(record.emailVerified).toBe(1);
  });

  it("updates only the signed-in admin's existing password credential", async () => {
    const caller = appRouter.createCaller(contextFor({ id: adminId, email: adminEmail, role: "admin" }));
    await expect(caller.emailAuth.adminSetOwnPassword({ password: "UpdatedAdminPassword456!" })).resolves.toEqual({ success: true, created: false });
  });

  it("rejects a non-admin user", async () => {
    const caller = appRouter.createCaller(contextFor({ id: otherUserId, email: conflictEmail, role: "user" }));
    await expect(caller.emailAuth.adminSetOwnPassword({ password: "ShouldNotWork123!" })).rejects.toThrow();
  });

  it("rejects a password-email collision tied to another user", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const { users } = await import("../drizzle/schema");
    const [collisionAdmin] = await db.insert(users).values({
      openId: collisionOpenId,
      email: conflictEmail,
      name: "Collision Admin",
      loginMethod: "google",
      role: "admin",
    });
    const collisionAdminId = Number((collisionAdmin as any).insertId);
    try {
      const caller = appRouter.createCaller(contextFor({ id: collisionAdminId, email: conflictEmail, role: "admin" }));
      await expect(caller.emailAuth.adminSetOwnPassword({ password: "CollisionPassword123!" })).rejects.toThrow("already connected");
    } finally {
      const { eq } = await import("drizzle-orm");
      await db.delete(users).where(eq(users.id, collisionAdminId));
    }
  });
});
