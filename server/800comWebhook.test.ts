/**
 * Tests for the 800.com inbound SMS webhook handler.
 * Verifies payload parsing, GET verification challenge, phone normalization,
 * and error resilience.
 */

import { describe, it, expect, vi } from "vitest";
import type { Request, Response } from "express";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a minimal Express Request mock */
function makeReq(
  body: Record<string, unknown> = {},
  method = "POST",
  query: Record<string, string> = {}
): Partial<Request> {
  return { body, method, query } as Partial<Request>;
}

/** Build a minimal Express Response mock that captures status + json/send calls */
function makeRes() {
  const captured: { status: number; body: unknown } = { status: 200, body: null };

  const res: Partial<Response> = {} as Partial<Response>;

  res.status = vi.fn().mockImplementation((code: number) => {
    captured.status = code;
    return res;
  }) as unknown as Response["status"];

  res.json = vi.fn().mockImplementation((data: unknown) => {
    captured.body = data;
    return res;
  }) as unknown as Response["json"];

  res.send = vi.fn().mockImplementation((data: unknown) => {
    captured.body = data;
    return res;
  }) as unknown as Response["send"];

  return { res, captured };
}

// ─── Webhook payload parsing ──────────────────────────────────────────────────

describe("eightHundredWebhookHandler — payload parsing", () => {
  it("accepts standard 800.com payload with 'message' field", async () => {
    const { eightHundredWebhookHandler } = await import("./800comWebhook");
    const req = makeReq({ from: "+19035551234", message: "Hello there!", id: "msg-001" });
    const { res, captured } = makeRes();

    await eightHundredWebhookHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect((captured.body as { received: boolean }).received).toBe(true);
  });

  it("accepts payload with 'body' field (alternate 800.com format)", async () => {
    const { eightHundredWebhookHandler } = await import("./800comWebhook");
    const req = makeReq({ from: "+19035551234", body: "Reply via body field" });
    const { res, captured } = makeRes();

    await eightHundredWebhookHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect((captured.body as { received: boolean }).received).toBe(true);
  });

  it("accepts payload with 'text' field (fallback format)", async () => {
    const { eightHundredWebhookHandler } = await import("./800comWebhook");
    const req = makeReq({ from: "+19035551234", text: "Reply via text field" });
    const { res, captured } = makeRes();

    await eightHundredWebhookHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect((captured.body as { received: boolean }).received).toBe(true);
  });

  it("returns 200 with stored=false for empty payload (no from/message)", async () => {
    const { eightHundredWebhookHandler } = await import("./800comWebhook");
    const req = makeReq({});
    const { res, captured } = makeRes();

    await eightHundredWebhookHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = captured.body as { received: boolean; stored: boolean };
    expect(body.received).toBe(true);
    expect(body.stored).toBe(false);
  });

  it("returns 200 with stored=false when only 'from' is present (no message)", async () => {
    const { eightHundredWebhookHandler } = await import("./800comWebhook");
    const req = makeReq({ from: "+19035551234" });
    const { res, captured } = makeRes();

    await eightHundredWebhookHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect((captured.body as { stored: boolean }).stored).toBe(false);
  });

  it("returns 200 with stored=false when only 'message' is present (no from)", async () => {
    const { eightHundredWebhookHandler } = await import("./800comWebhook");
    const req = makeReq({ message: "Hello" });
    const { res, captured } = makeRes();

    await eightHundredWebhookHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect((captured.body as { stored: boolean }).stored).toBe(false);
  });
});

// ─── GET verification challenge ──────────────────────────────────────────────

describe("eightHundredWebhookVerify — GET challenge", () => {
  it("echoes the challenge parameter back", async () => {
    const { eightHundredWebhookVerify } = await import("./800comWebhook");
    const req = makeReq({}, "GET", { challenge: "abc123xyz" });
    const { res } = makeRes();

    await eightHundredWebhookVerify(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("abc123xyz");
  });

  it("returns 'ok' when no challenge param is provided", async () => {
    const { eightHundredWebhookVerify } = await import("./800comWebhook");
    const req = makeReq({}, "GET", {});
    const { res } = makeRes();

    await eightHundredWebhookVerify(req as Request, res as Response);

    expect(res.send).toHaveBeenCalledWith("ok");
  });
});

// ─── Phone normalization ──────────────────────────────────────────────────────

describe("toE164 — phone number normalization", () => {
  it("normalizes 10-digit US number to E.164", async () => {
    const { toE164 } = await import("./800com");
    expect(toE164("9035551234")).toBe("+19035551234");
  });

  it("passes through already-formatted E.164 numbers", async () => {
    const { toE164 } = await import("./800com");
    expect(toE164("+19035551234")).toBe("+19035551234");
  });

  it("strips formatting characters from phone numbers", async () => {
    const { toE164 } = await import("./800com");
    expect(toE164("(903) 555-1234")).toBe("+19035551234");
    expect(toE164("903.555.1234")).toBe("+19035551234");
    expect(toE164("903-555-1234")).toBe("+19035551234");
  });

  it("handles 11-digit numbers starting with 1", async () => {
    const { toE164 } = await import("./800com");
    expect(toE164("19035551234")).toBe("+19035551234");
  });
});

// ─── Error resilience ─────────────────────────────────────────────────────────

describe("eightHundredWebhookHandler — error resilience", () => {
  it("always returns HTTP 200 even when DB is unavailable", async () => {
    const { eightHundredWebhookHandler } = await import("./800comWebhook");
    const req = makeReq({ from: "+19035551234", message: "Test" });
    const { res } = makeRes();

    // Should not throw regardless of DB state
    await expect(
      eightHundredWebhookHandler(req as Request, res as Response)
    ).resolves.not.toThrow();

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("handles completely empty body gracefully", async () => {
    const { eightHundredWebhookHandler } = await import("./800comWebhook");
    const req = makeReq({}, "POST");
    const { res } = makeRes();

    await expect(
      eightHundredWebhookHandler(req as Request, res as Response)
    ).resolves.not.toThrow();

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
