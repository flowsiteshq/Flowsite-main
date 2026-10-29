import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = (relative: string) => fs.readFileSync(path.resolve(process.cwd(), relative), "utf8");

describe("Free Website Program staff review queue", () => {
  it("keeps human review controls strict-admin-only and records no delivery side effect", () => {
    const router = source("server/routers/freeWebsiteRouter.ts");

    expect(router).toContain("async function requirePreviewRequestAdmin");
    expect(router).toContain("listPreviewRequests: publicProcedure.query");
    expect(router).toContain("await requirePreviewRequestAdmin(ctx)");
    expect(router).toContain("updatePreviewRequest: publicProcedure");
    expect(router).toContain("deliveryChecklistComplete");
    expect(router).toContain('Complete the human delivery checklist before marking a preview as delivered.');
    expect(router).not.toContain("sendSms");
    expect(router).not.toContain("stripe");
    expect(router).not.toContain("notifyOwner");
  });

  it("keeps review state and preview links internal to the request ledger", () => {
    const schema = source("drizzle/schema.ts");
    const migration = source("database/feature-migrations/2026-10-27-free-website-preview-requests.sql");
    const ledger = source("database/feature-migrations/README.md");

    for (const field of ["internalNotes", "previewUrl", "deliveryChecklistComplete", "reviewedAt"]) {
      expect(schema).toContain(field);
      expect(migration).toContain(field);
    }
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS `free_website_preview_requests`");
    expect(ledger).toContain("Never rewrite, reorder, or replay legacy");
    expect(ledger).toContain("production pending explicit release approval");
  });

  it("renders a protected staff queue without customer communication controls", () => {
    const page = source("client/src/pages/AdminFreeWebsiteRequests.tsx");
    const app = source("client/src/App.tsx");
    const dashboard = source("client/src/pages/AdminDashboard.tsx");

    expect(page).toContain("trpc.freeWebsite.listPreviewRequests.useQuery");
    expect(page).toContain("trpc.freeWebsite.updatePreviewRequest.useMutation");
    expect(page).toContain("Human delivery checklist complete");
    expect(page).toContain("No customer message was sent.");
    expect(page).not.toContain("mailto:");
    expect(page).not.toContain("sendSms");
    expect(app).toContain('path="/flowsites-admin-free-website" component={AdminFreeWebsiteRequests}');
    expect(dashboard).toContain('href="/flowsites-admin-free-website"');
  });
});
