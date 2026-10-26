import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";
import { CUE_API_KEY_PREFIX, createCueApiKey, hashCueApiKey, toCueLead } from "./cueIntegration";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("Cue read-only lead integration", () => {
  it("creates a unique Cue-prefixed secret while persisting only its hash", () => {
    const first = createCueApiKey();
    const second = createCueApiKey();

    expect(first.rawKey).toMatch(new RegExp(`^${CUE_API_KEY_PREFIX}`));
    expect(first.rawKey).not.toEqual(second.rawKey);
    expect(first.tokenHash).toHaveLength(64);
    expect(first.tokenHash).toEqual(hashCueApiKey(first.rawKey));
    expect(first.tokenHash).not.toContain(first.rawKey);
    expect(first.keyPrefix).toEqual(first.rawKey.slice(0, CUE_API_KEY_PREFIX.length + 12));
  });

  it("returns only the approved lead shape and excludes internal or financial fields", () => {
    const lead = toCueLead({
      id: 19,
      businessName: "Example Studio",
      businessType: "fitness",
      businessTypeOther: "Private studio",
      website: "https://example.com",
      phone: "+15551234567",
      email: "owner@example.com",
      colorScheme: "dark",
      customColors: "#000000",
      designStyle: "minimal",
      referenceWebsites: "https://reference.example",
      primaryGoal: "More online leads",
      currentChallenges: "Slow follow-up",
      timeline: "this_month",
      budget: "$2,500",
      additionalNotes: "Internal discovery notes",
      status: "new",
      statusUpdatedAt: new Date("2026-10-26T00:00:00.000Z"),
      source: "website",
      adminNotes: "Do not disclose",
      followUpDate: "2026-10-30",
      assignedTechnicianId: 17,
      assignedPartnerId: 4,
      nicheTag: "fitness",
      createdAt: new Date("2026-10-25T00:00:00.000Z"),
    });

    expect(lead).toEqual({
      id: 19,
      businessName: "Example Studio",
      businessType: "fitness",
      website: "https://example.com",
      contact: { email: "owner@example.com", phone: "+15551234567" },
      inquiry: {
        primaryGoal: "More online leads",
        timeline: "this_month",
        source: "website",
        nicheTag: "fitness",
      },
      status: "new",
      followUpDate: "2026-10-30",
      createdAt: new Date("2026-10-25T00:00:00.000Z"),
      statusUpdatedAt: new Date("2026-10-26T00:00:00.000Z"),
    });
    expect(JSON.stringify(lead)).not.toContain("Do not disclose");
    expect(JSON.stringify(lead)).not.toContain("$2,500");
    expect(JSON.stringify(lead)).not.toContain("reference.example");
  });

  it("requires administrator authorization before any Cue key can be listed or created", async () => {
    const ctx = {
      user: null,
      req: { cookies: {}, headers: {} },
      res: {},
    } as unknown as TrpcContext;
    const caller = appRouter.createCaller(ctx);

    await expect(caller.cueIntegration.listKeys()).rejects.toThrow("Administrator access is required");
    await expect(caller.cueIntegration.createKey({ label: "Cue test key" })).rejects.toThrow("Administrator access is required");
  });

  it("exposes a single no-store REST read route and no write verbs", () => {
    const api = source("server/cueIntegrationApi.ts");
    const router = source("server/routers/cueIntegrationRouter.ts");

    expect(api).toContain('app.get("/api/integrations/cue/leads"');
    expect(api).toContain('"Cache-Control": "no-store"');
    expect(api).toContain("CUE_LEAD_SCOPE");
    expect(api).not.toContain("app.post(");
    expect(api).not.toContain("app.put(");
    expect(api).not.toContain("app.patch(");
    expect(api).not.toContain("app.delete(");
    expect(router).toContain("requireCueIntegrationAdmin");
    expect(router).toContain("revokedAt: new Date()");
  });
});
