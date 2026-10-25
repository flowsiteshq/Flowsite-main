import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import type { TrpcContext } from "./_core/context";

const TEST_EMAIL = `client-password-${Date.now()}@flowsites-test.invalid`;
const TEST_PASSWORD = "PortalPassword123!";

function makeCtx(): TrpcContext {
  const cookies: Record<string, string> = {};
  return {
    req: { headers: {}, cookies, protocol: "http" } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string) => { cookies[name] = value; },
      clearCookie: (name: string) => { delete cookies[name]; },
    } as TrpcContext["res"],
    user: null,
  };
}

beforeAll(async () => {
  const db = await getDb();
  if (!db) return;
  const { clientProjects } = await import("../drizzle/schema");
  await db.insert(clientProjects).values({
    clientName: "Password Access Test",
    clientEmail: TEST_EMAIL,
    businessName: "Password Access Test Business",
    status: "onboarding",
  });
});

afterAll(async () => {
  const db = await getDb();
  if (!db) return;
  const { clientProjects, clientPortalPasswords, clientPortalSessions } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.delete(clientPortalSessions).where(eq(clientPortalSessions.clientEmail, TEST_EMAIL));
  await db.delete(clientPortalPasswords).where(eq(clientPortalPasswords.clientEmail, TEST_EMAIL));
  await db.delete(clientProjects).where(eq(clientProjects.clientEmail, TEST_EMAIL));
});

describe("client portal password access", () => {
  it("does not reveal whether a password setup address is a client", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.clientPortalAuth.requestPasswordSetup({
      email: "unknown-client@flowsites-test.invalid",
      origin: "http://localhost:3000",
    });
    expect(result).toEqual({ success: true });
  });

  it("creates password setup for an existing client project and signs in after setup", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.clientPortalAuth.requestPasswordSetup({ email: TEST_EMAIL, origin: "http://localhost:3000" });
    expect(result).toEqual({ success: true });

    const db = await getDb();
    if (!db) return;
    const { clientPortalPasswords } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const [passwordRecord] = await db.select().from(clientPortalPasswords).where(eq(clientPortalPasswords.clientEmail, TEST_EMAIL)).limit(1);
    expect(passwordRecord.setupToken).toBeTruthy();
    expect(passwordRecord.setupTokenExpiry).toBeGreaterThan(Date.now());

    const setup = await caller.clientPortalAuth.setupPassword({ token: passwordRecord.setupToken!, password: TEST_PASSWORD });
    expect(setup).toEqual({ success: true, clientEmail: TEST_EMAIL });
    expect((ctx.req as any).cookies.client_portal_session).toBeTruthy();

    const me = await caller.clientPortalAuth.me();
    expect(me?.clientEmail).toBe(TEST_EMAIL);
    expect(me?.businessName).toBe("Password Access Test Business");
  });

  it("accepts the created password and rejects an invalid password with a generic response", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.clientPortalAuth.login({ email: TEST_EMAIL, password: "not-the-password" })).rejects.toThrow("Invalid email or password.");

    const login = await caller.clientPortalAuth.login({ email: TEST_EMAIL, password: TEST_PASSWORD });
    expect(login.success).toBe(true);
    expect((ctx.req as any).cookies.client_portal_session).toBeTruthy();
  });
});
