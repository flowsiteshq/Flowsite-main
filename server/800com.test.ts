/**
 * Tests for 800.com API helper
 * Tests the toE164 phone normalizer and the graceful fallback behavior
 * when the API key is not configured.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toE164, sendSms, getConversations, getConversationMessages, verifyApiKey } from "./800com";

// ─── toE164 phone normalizer ─────────────────────────────────────────────────

describe("toE164", () => {
  it("converts a 10-digit US number to E.164", () => {
    expect(toE164("9035551234")).toBe("+19035551234");
  });

  it("converts a formatted US number (dashes)", () => {
    expect(toE164("903-555-1234")).toBe("+19035551234");
  });

  it("converts a formatted US number (dots)", () => {
    expect(toE164("903.555.1234")).toBe("+19035551234");
  });

  it("converts a formatted US number (parens + spaces)", () => {
    expect(toE164("(903) 555-1234")).toBe("+19035551234");
  });

  it("handles 11-digit number starting with 1", () => {
    expect(toE164("19035551234")).toBe("+19035551234");
  });

  it("handles already-E164 number", () => {
    expect(toE164("+19035551234")).toBe("+19035551234");
  });

  it("handles international number", () => {
    expect(toE164("+447911123456")).toBe("+447911123456");
  });

  it("strips all non-digit characters", () => {
    expect(toE164("(800) 555-0199")).toBe("+18005550199");
  });
});

// ─── API functions with no API key configured ─────────────────────────────────

describe("sendSms (no API key)", () => {
  beforeEach(() => {
    // Ensure ENV has no API key for these tests
    vi.resetModules();
  });

  it("returns failure when sender number is not configured", async () => {
    // Mock the ENV module to have no sender number
    vi.doMock("./_core/env", () => ({
      ENV: {
        eightHundredApiKey: "test-key",
        eightHundredSenderNumber: "", // no sender
      },
    }));
    const { sendSms: sendSmsMocked } = await import("./800com");
    const result = await sendSmsMocked({ recipient: "9035551234", message: "Hello" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("sender number not configured");
  });

  it("returns failure when API key is not configured", async () => {
    vi.doMock("./_core/env", () => ({
      ENV: {
        eightHundredApiKey: "", // no key
        eightHundredSenderNumber: "+18005550100",
      },
    }));
    const { sendSms: sendSmsMocked } = await import("./800com");
    const result = await sendSmsMocked({ recipient: "9035551234", message: "Hello" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("API key not configured");
  });
});

describe("getConversations (no API key)", () => {
  it("returns empty array when API key is not configured", async () => {
    vi.doMock("./_core/env", () => ({
      ENV: { eightHundredApiKey: "", eightHundredSenderNumber: "" },
    }));
    const { getConversations: getConvMocked } = await import("./800com");
    const result = await getConvMocked();
    expect(result).toEqual([]);
  });
});

describe("getConversationMessages (no API key)", () => {
  it("returns empty array when API key is not configured", async () => {
    vi.doMock("./_core/env", () => ({
      ENV: { eightHundredApiKey: "", eightHundredSenderNumber: "" },
    }));
    const { getConversationMessages: getMsgsMocked } = await import("./800com");
    const result = await getMsgsMocked("conv-123");
    expect(result).toEqual([]);
  });
});

describe("verifyApiKey (no API key)", () => {
  it("returns invalid when API key is not configured", async () => {
    vi.doMock("./_core/env", () => ({
      ENV: { eightHundredApiKey: "", eightHundredSenderNumber: "" },
    }));
    const { verifyApiKey: verifyMocked } = await import("./800com");
    const result = await verifyMocked();
    expect(result.valid).toBe(false);
    expect(result.error).toBe("API key not set");
  });
});

// ─── sendSms with mocked fetch ────────────────────────────────────────────────

describe("sendSms (with mocked fetch)", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("returns success when 800.com API returns 200", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ id: "msg-123" }),
    } as Response);

    // sendSms uses ENV directly from the already-imported module;
    // patch ENV inline for this test
    const envModule = await import("./_core/env");
    const originalKey = envModule.ENV.eightHundredApiKey;
    const originalSender = envModule.ENV.eightHundredSenderNumber;
    (envModule.ENV as Record<string, string>).eightHundredApiKey = "test-key-abc";
    (envModule.ENV as Record<string, string>).eightHundredSenderNumber = "+18005550100";

    const result = await sendSms({
      recipient: "9035551234",
      message: "Test message from FlowSites",
    });

    // Restore ENV
    (envModule.ENV as Record<string, string>).eightHundredApiKey = originalKey;
    (envModule.ENV as Record<string, string>).eightHundredSenderNumber = originalSender;

    expect(result.success).toBe(true);
    expect(fetchSpy).toHaveBeenCalledOnce();

    // Verify the request body contains the correct recipient and message
    const callArgs = fetchSpy.mock.calls[0];
    const body = JSON.parse((callArgs[1] as RequestInit).body as string);
    expect(body.recipient).toBe("+19035551234");
    expect(body.message).toBe("Test message from FlowSites");
    // sender is the configured 800.com number (from ENV)
    expect(typeof body.sender).toBe("string");
  });

  it("returns failure when 800.com API returns 401", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    } as Response);

    const envModule = await import("./_core/env");
    const originalKey = envModule.ENV.eightHundredApiKey;
    const originalSender = envModule.ENV.eightHundredSenderNumber;
    (envModule.ENV as Record<string, string>).eightHundredApiKey = "bad-key";
    (envModule.ENV as Record<string, string>).eightHundredSenderNumber = "+18005550100";

    const result = await sendSms({
      recipient: "9035551234",
      message: "Test",
    });

    (envModule.ENV as Record<string, string>).eightHundredApiKey = originalKey;
    (envModule.ENV as Record<string, string>).eightHundredSenderNumber = originalSender;

    expect(result.success).toBe(false);
    expect(result.error).toContain("401");
  });

  it("includes mediaUrl in request body when provided", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ id: "msg-456" }),
    } as Response);

    const envModule = await import("./_core/env");
    const originalKey = envModule.ENV.eightHundredApiKey;
    const originalSender = envModule.ENV.eightHundredSenderNumber;
    (envModule.ENV as Record<string, string>).eightHundredApiKey = "test-key";
    (envModule.ENV as Record<string, string>).eightHundredSenderNumber = "+18005550100";

    await sendSms({
      recipient: "9035551234",
      message: "Check this out",
      mediaUrl: "https://example.com/image.jpg",
    });

    (envModule.ENV as Record<string, string>).eightHundredApiKey = originalKey;
    (envModule.ENV as Record<string, string>).eightHundredSenderNumber = originalSender;

    const callArgs = fetchSpy.mock.calls[0];
    const body = JSON.parse((callArgs[1] as RequestInit).body as string);
    expect(body.url).toBe("https://example.com/image.jpg");
  });
});
