import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const billingScripts = [
  "create_seriouspro_invoice.mjs",
  "send_stitched_invoice.mjs",
  "setup_stitched_recurring.mjs",
];

describe("billing script credential handling", () => {
  it.each(billingScripts)("uses STRIPE_SECRET_KEY without hardcoding a Stripe key in %s", scriptName => {
    const script = fs.readFileSync(path.resolve(process.cwd(), scriptName), "utf8");

    expect(script).toContain("process.env.STRIPE_SECRET_KEY");
    expect(script).not.toMatch(/sk_(?:live|test)_[A-Za-z0-9]+/);
  });
});
