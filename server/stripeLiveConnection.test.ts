import Stripe from "stripe";
import { describe, expect, it } from "vitest";

describe("Flowsites Corp. Stripe connection", () => {
  it("authenticates with the configured live custom secret and can read the payment-link catalog", async () => {
    const secret = process.env.FLOWSITES_STRIPE_SECRET_KEY;
    expect(secret).toMatch(/^sk_live_/);

    const stripe = new Stripe(secret!, { apiVersion: "2026-02-25.clover" as any });
    const links = await stripe.paymentLinks.list({ limit: 1 });

    expect(links.data.length).toBeGreaterThan(0);
    expect(links.data[0]?.livemode).toBe(true);
  }, 20_000);
});
