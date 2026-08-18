import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("normalizePhone", () => {
  it("prepends +1 for a 10-digit US number", async () => {
    const { normalizePhone } = await import("./sms");
    expect(normalizePhone("2818189288")).toBe("+12818189288");
  });

  it("strips formatting characters and normalizes", async () => {
    const { normalizePhone } = await import("./sms");
    expect(normalizePhone("(281) 818-9288")).toBe("+12818189288");
    expect(normalizePhone("281.818.9288")).toBe("+12818189288");
  });

  it("leaves an already-E.164 number unchanged", async () => {
    const { normalizePhone } = await import("./sms");
    expect(normalizePhone("+12818189288")).toBe("+12818189288");
  });
});

describe("sendSms", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_FROM_NUMBER;
  });

  it("returns false and skips fetch when Twilio credentials are missing", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { sendSms } = await import("./sms");
    const result = await sendSms({ to: "2818189288", body: "Hello!" });
    expect(result).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("returns false and skips fetch when phone number is empty", async () => {
    process.env.TWILIO_ACCOUNT_SID = "ACtest";
    process.env.TWILIO_AUTH_TOKEN = "authtest";
    process.env.TWILIO_FROM_NUMBER = "+12818189288";
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { sendSms } = await import("./sms");
    const result = await sendSms({ to: "", body: "Hello!" });
    expect(result).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("calls Twilio API and returns true on success", async () => {
    process.env.TWILIO_ACCOUNT_SID = "ACtest";
    process.env.TWILIO_AUTH_TOKEN = "authtest";
    process.env.TWILIO_FROM_NUMBER = "+12818189288";
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ sid: "SM123" }), { status: 201 })
    );
    const { sendSms } = await import("./sms");
    const result = await sendSms({ to: "2818189288", body: "Test message" });
    expect(result).toBe(true);
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("ACtest");
    expect((init.body as string)).toContain("To=%2B12818189288");
    fetchSpy.mockRestore();
  });

  it("returns false when Twilio returns a non-ok status", async () => {
    process.env.TWILIO_ACCOUNT_SID = "ACtest";
    process.env.TWILIO_AUTH_TOKEN = "authtest";
    process.env.TWILIO_FROM_NUMBER = "+12818189288";
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Unauthorized", { status: 401 })
    );
    const { sendSms } = await import("./sms");
    const result = await sendSms({ to: "2818189288", body: "Test" });
    expect(result).toBe(false);
    fetchSpy.mockRestore();
  });
});

describe("sendProjectWelcomeSms", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_FROM_NUMBER;
  });

  it("sends an SMS with client name, business name, and portal URL", async () => {
    process.env.TWILIO_ACCOUNT_SID = "ACtest";
    process.env.TWILIO_AUTH_TOKEN = "authtest";
    process.env.TWILIO_FROM_NUMBER = "+12818189288";
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ sid: "SM456" }), { status: 201 })
    );
    const { sendProjectWelcomeSms } = await import("./sms");
    const result = await sendProjectWelcomeSms({
      clientName: "John Doe",
      clientPhone: "2818189288",
      businessName: "Doe's Dojo",
      monthlyPrice: 297,
      portalUrl: "https://flow-sites.com/client-portal?token=abc123",
    });
    expect(result).toBe(true);
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    // The body is a URLSearchParams string; decode it fully to check content
    const rawBody = init.body as string;
    const params = new URLSearchParams(rawBody);
    const smsBody = params.get("Body") ?? "";
    expect(smsBody).toContain("John Doe");
    expect(smsBody).toContain("Doe's Dojo");
    expect(smsBody).toContain("297.00");
    expect(smsBody).toContain("abc123");
    fetchSpy.mockRestore();
  });

  it("omits price line when monthlyPrice is not provided", async () => {
    process.env.TWILIO_ACCOUNT_SID = "ACtest";
    process.env.TWILIO_AUTH_TOKEN = "authtest";
    process.env.TWILIO_FROM_NUMBER = "+12818189288";
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ sid: "SM789" }), { status: 201 })
    );
    const { sendProjectWelcomeSms } = await import("./sms");
    await sendProjectWelcomeSms({
      clientName: "Jane Smith",
      clientPhone: "2818189288",
      businessName: "Smith Fitness",
      portalUrl: "https://flow-sites.com/client-portal?token=xyz",
    });
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = decodeURIComponent(init.body as string);
    expect(body).not.toContain("plan:");
    fetchSpy.mockRestore();
  });

  it("returns false when Twilio credentials are not configured", async () => {
    const { sendProjectWelcomeSms } = await import("./sms");
    const result = await sendProjectWelcomeSms({
      clientName: "No Creds",
      clientPhone: "2818189288",
      businessName: "No Creds LLC",
      portalUrl: "https://flow-sites.com/client-portal?token=nocreds",
    });
    expect(result).toBe(false);
  });
});
