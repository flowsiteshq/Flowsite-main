import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = (relative: string) => fs.readFileSync(path.resolve(process.cwd(), relative), "utf8");

describe("FlowSites public contact number", () => {
  it("uses the new number in public display and click-to-call surfaces", () => {
    const displaySources = [
      source("client/src/components/Navbar.tsx"),
      source("client/src/components/Footer.tsx"),
      source("client/src/pages/Contact.tsx"),
      source("client/src/pages/FreeWebsite.tsx"),
    ];

    for (const content of displaySources) {
      expect(content).toContain("(888) 933-3010");
      expect(content).toContain("+18889333010");
      expect(content).not.toContain("281-503-8903");
      expect(content).not.toContain("+12815038903");
    }

    const interested = source("client/src/pages/Interested.tsx");
    expect(interested).toContain("+18889333010");
    expect(interested).not.toContain("+12815038903");
  });

  it("keeps future outreach templates aligned without sending a message", () => {
    for (const relative of [
      "send-email-retry.mjs",
      "send-email-blast.mjs",
      "send_stylist_reminder.mjs",
      "send_stylist_login.mjs",
      "send_stitched_invoice.mjs",
      "send_invoice_email.mjs",
    ]) {
      const content = source(relative);
      expect(content).toMatch(/(?:\(888\) 933-3010|888-933-3010)/);
      expect(content).not.toContain("281-503-8903");
    }
  });
});
