import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import type { TrpcContext } from "./_core/context";

const TEST_SUFFIX = Date.now();
const UNLINKED_ACCOUNT_EMAIL = `email-link-account-${TEST_SUFFIX}@flowsites-test.invalid`;
const UNLINKED_PROJECT_EMAIL = `email-link-project-${TEST_SUFFIX}@flowsites-test.invalid`;
const CLAIMED_ACCOUNT_EMAIL = `claimed-account-${TEST_SUFFIX}@flowsites-test.invalid`;
const ACCOUNT_OPEN_ID = `account-open-id-${TEST_SUFFIX}`;
const PROJECT_OPEN_ID = `project-open-id-${TEST_SUFFIX}`;
const OTHER_OPEN_ID = `other-open-id-${TEST_SUFFIX}`;
const UNAUTHORIZED_OPEN_ID = `unauthorized-open-id-${TEST_SUFFIX}`;

function makeCtx(openId: string, email: string): TrpcContext {
  return {
    req: { headers: {}, cookies: {}, protocol: "http" } as TrpcContext["req"],
    res: { cookie: () => undefined, clearCookie: () => undefined } as TrpcContext["res"],
    user: {
      id: 1,
      openId,
      name: "Client Access Test",
      email,
      loginMethod: "google",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  };
}

beforeAll(async () => {
  const db = await getDb();
  if (!db) return;
  const { clientAccounts, clientProjects } = await import("../drizzle/schema");

  await db.insert(clientAccounts).values([
    {
      clientName: "Email Linked Billing Client",
      clientEmail: UNLINKED_ACCOUNT_EMAIL,
      businessName: "Email Linked Billing Business",
      monthlyPriceCents: 4900,
      status: "active",
    },
    {
      clientName: "Already Claimed Client",
      clientEmail: CLAIMED_ACCOUNT_EMAIL,
      businessName: "Already Claimed Business",
      monthlyPriceCents: 4900,
      clientOpenId: OTHER_OPEN_ID,
      status: "active",
    },
  ]);

  await db.insert(clientProjects).values({
    clientName: "Email Linked Project Client",
    clientEmail: UNLINKED_PROJECT_EMAIL,
    businessName: "Email Linked Project Business",
    status: "onboarding",
  });
});

afterAll(async () => {
  const db = await getDb();
  if (!db) return;
  const { clientAccounts, clientProjects } = await import("../drizzle/schema");
  const { eq, or } = await import("drizzle-orm");
  await db.delete(clientAccounts).where(or(
    eq(clientAccounts.clientEmail, UNLINKED_ACCOUNT_EMAIL),
    eq(clientAccounts.clientEmail, CLAIMED_ACCOUNT_EMAIL),
  ));
  await db.delete(clientProjects).where(eq(clientProjects.clientEmail, UNLINKED_PROJECT_EMAIL));
});

describe("client first-access association", () => {
  it("links an unclaimed billing account only when the signed-in email matches", async () => {
    const caller = appRouter.createCaller(makeCtx(ACCOUNT_OPEN_ID, UNLINKED_ACCOUNT_EMAIL));
    const account = await caller.clientBilling.getMyAccount();
    const accessStatus = await caller.clientBilling.getMyAccessStatus();

    expect(account?.clientEmail).toBe(UNLINKED_ACCOUNT_EMAIL);
    expect(account?.clientOpenId).toBe(ACCOUNT_OPEN_ID);
    expect(accessStatus).toMatchObject({ state: "billing", businessName: "Email Linked Billing Business" });

    const db = await getDb();
    if (!db) return;
    const { clientAccounts } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const [saved] = await db.select().from(clientAccounts).where(eq(clientAccounts.clientEmail, UNLINKED_ACCOUNT_EMAIL)).limit(1);
    expect(saved.clientOpenId).toBe(ACCOUNT_OPEN_ID);
    expect(saved.inviteAccepted).toBe(1);
  });

  it("links an unclaimed project by matching email for the project portal", async () => {
    const caller = appRouter.createCaller(makeCtx(PROJECT_OPEN_ID, UNLINKED_PROJECT_EMAIL));
    const project = await caller.clientPortal.getMyProject();
    const accessStatus = await caller.clientBilling.getMyAccessStatus();

    expect(project?.clientEmail).toBe(UNLINKED_PROJECT_EMAIL);
    expect(project?.clientOpenId).toBe(PROJECT_OPEN_ID);
    expect(accessStatus).toMatchObject({ state: "project_only", businessName: "Email Linked Project Business" });
  });

  it("does not replace an account that is already linked to another user", async () => {
    const caller = appRouter.createCaller(makeCtx(UNAUTHORIZED_OPEN_ID, CLAIMED_ACCOUNT_EMAIL));
    await expect(caller.clientBilling.getMyAccount()).resolves.toBeNull();
    await expect(caller.clientBilling.getMyAccessStatus()).resolves.toMatchObject({ state: "no_client_record", businessName: null });

    const db = await getDb();
    if (!db) return;
    const { clientAccounts } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const [saved] = await db.select().from(clientAccounts).where(eq(clientAccounts.clientEmail, CLAIMED_ACCOUNT_EMAIL)).limit(1);
    expect(saved.clientOpenId).toBe(OTHER_OPEN_ID);
  });
});
