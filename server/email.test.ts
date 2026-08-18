import { describe, it, expect, vi, beforeEach } from "vitest";

// The email module uses a singleton Resend client. We need to reset modules
// between tests to get a fresh instance with the correct mock.

describe("sendEmail", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns true when Resend succeeds", async () => {
    const mockSend = vi.fn().mockResolvedValue({ data: { id: "mock-id" }, error: null });
    vi.doMock("resend", () => ({
      Resend: vi.fn().mockImplementation(() => ({ emails: { send: mockSend } })),
    }));
    vi.doMock("./_core/env", () => ({
      ENV: { resendApiKey: "re_test_key", emailFromAddress: "FlowSites <test@flow-sites.com>" },
    }));

    const { sendEmail } = await import("./email");
    const result = await sendEmail({ to: "guest@example.com", subject: "Test", html: "<p>Hello</p>" });
    expect(result).toBe(true);
    expect(mockSend).toHaveBeenCalledOnce();
  });

  it("returns false when Resend returns an error object", async () => {
    const mockSend = vi.fn().mockResolvedValue({ data: null, error: { message: "Invalid API key" } });
    vi.doMock("resend", () => ({
      Resend: vi.fn().mockImplementation(() => ({ emails: { send: mockSend } })),
    }));
    vi.doMock("./_core/env", () => ({
      ENV: { resendApiKey: "re_bad_key", emailFromAddress: "test@test.com" },
    }));

    const { sendEmail } = await import("./email");
    const result = await sendEmail({ to: "x@x.com", subject: "s", html: "<p>h</p>" });
    expect(result).toBe(false);
  });

  it("returns false and skips sending when RESEND_API_KEY is empty", async () => {
    const mockSend = vi.fn();
    vi.doMock("resend", () => ({
      Resend: vi.fn().mockImplementation(() => ({ emails: { send: mockSend } })),
    }));
    vi.doMock("./_core/env", () => ({
      ENV: { resendApiKey: "", emailFromAddress: "test@test.com" },
    }));

    const { sendEmail } = await import("./email");
    const result = await sendEmail({ to: "x@x.com", subject: "s", html: "<p>h</p>" });
    expect(result).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });
});

describe("sendBookingConfirmationEmail", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("sends an email and returns true on success", async () => {
    const mockSend = vi.fn().mockResolvedValue({ data: { id: "abc" }, error: null });
    vi.doMock("resend", () => ({
      Resend: vi.fn().mockImplementation(() => ({ emails: { send: mockSend } })),
    }));
    vi.doMock("./_core/env", () => ({
      ENV: { resendApiKey: "re_test_key", emailFromAddress: "FlowSites <test@flow-sites.com>" },
    }));

    const { sendBookingConfirmationEmail } = await import("./email");
    const result = await sendBookingConfirmationEmail({
      guestName: "John Doe",
      guestEmail: "john@example.com",
      bookingDate: "2026-04-15",
      startTime: "10:00",
      endTime: "10:30",
      confirmationCode: "ABCD1234",
    });

    expect(result).toBe(true);
    expect(mockSend).toHaveBeenCalledOnce();
    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.to).toBe("john@example.com");
    expect(callArgs.subject).toContain("Confirmed");
  });

  it("formats 24h time to 12h AM/PM in the email HTML", async () => {
    const mockSend = vi.fn().mockResolvedValue({ data: { id: "xyz" }, error: null });
    vi.doMock("resend", () => ({
      Resend: vi.fn().mockImplementation(() => ({ emails: { send: mockSend } })),
    }));
    vi.doMock("./_core/env", () => ({
      ENV: { resendApiKey: "re_test_key", emailFromAddress: "FlowSites <test@flow-sites.com>" },
    }));

    const { sendBookingConfirmationEmail } = await import("./email");
    await sendBookingConfirmationEmail({
      guestName: "Jane Smith",
      guestEmail: "jane@example.com",
      bookingDate: "2026-05-01",
      startTime: "14:00",
      endTime: "14:30",
      confirmationCode: "XYZ9876",
    });

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.html).toContain("2:00 PM");
    expect(callArgs.html).toContain("2:30 PM");
    expect(callArgs.html).toContain("XYZ9876");
  });

  it("includes the guest name and confirmation code in the email body", async () => {
    const mockSend = vi.fn().mockResolvedValue({ data: { id: "def" }, error: null });
    vi.doMock("resend", () => ({
      Resend: vi.fn().mockImplementation(() => ({ emails: { send: mockSend } })),
    }));
    vi.doMock("./_core/env", () => ({
      ENV: { resendApiKey: "re_test_key", emailFromAddress: "FlowSites <test@flow-sites.com>" },
    }));

    const { sendBookingConfirmationEmail } = await import("./email");
    await sendBookingConfirmationEmail({
      guestName: "Alice Cooper",
      guestEmail: "alice@example.com",
      bookingDate: "2026-06-10",
      startTime: "09:00",
      endTime: "09:30",
      confirmationCode: "ALICE001",
    });

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.html).toContain("Alice Cooper");
    expect(callArgs.html).toContain("ALICE001");
  });
});

describe("sendProjectWelcomeEmail", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("sends a welcome email to the client and returns true on success", async () => {
    const mockSend = vi.fn().mockResolvedValue({ data: { id: "proj-001" }, error: null });
    vi.doMock("resend", () => ({
      Resend: vi.fn().mockImplementation(() => ({ emails: { send: mockSend } })),
    }));
    vi.doMock("./_core/env", () => ({
      ENV: { resendApiKey: "re_test_key", emailFromAddress: "FlowSites <hello@flow-sites.com>" },
    }));

    const { sendProjectWelcomeEmail } = await import("./email");
    const result = await sendProjectWelcomeEmail({
      clientName: "John Doe",
      clientEmail: "john@example.com",
      businessName: "Doe's Dojo",
      packageName: "Growth",
      monthlyPrice: 297,
      portalUrl: "https://flow-sites.com/client-portal?token=abc123",
    });

    expect(result).toBe(true);
    expect(mockSend).toHaveBeenCalledOnce();
    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.to).toBe("john@example.com");
    expect(callArgs.subject).toContain("John Doe");
    expect(callArgs.html).toContain("Doe's Dojo");
    expect(callArgs.html).toContain("297.00");
    expect(callArgs.html).toContain("abc123");
  });

  it("includes the portal URL CTA in the email body", async () => {
    const mockSend = vi.fn().mockResolvedValue({ data: { id: "proj-002" }, error: null });
    vi.doMock("resend", () => ({
      Resend: vi.fn().mockImplementation(() => ({ emails: { send: mockSend } })),
    }));
    vi.doMock("./_core/env", () => ({
      ENV: { resendApiKey: "re_test_key", emailFromAddress: "FlowSites <hello@flow-sites.com>" },
    }));

    const { sendProjectWelcomeEmail } = await import("./email");
    await sendProjectWelcomeEmail({
      clientName: "Jane Smith",
      clientEmail: "jane@example.com",
      businessName: "Smith Fitness",
      portalUrl: "https://flow-sites.com/client-portal?token=xyz789",
    });

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.html).toContain("xyz789");
    expect(callArgs.html).toContain("Access Your Client Portal");
  });

  it("omits monthly price section when monthlyPrice is not provided", async () => {
    const mockSend = vi.fn().mockResolvedValue({ data: { id: "proj-003" }, error: null });
    vi.doMock("resend", () => ({
      Resend: vi.fn().mockImplementation(() => ({ emails: { send: mockSend } })),
    }));
    vi.doMock("./_core/env", () => ({
      ENV: { resendApiKey: "re_test_key", emailFromAddress: "FlowSites <hello@flow-sites.com>" },
    }));

    const { sendProjectWelcomeEmail } = await import("./email");
    await sendProjectWelcomeEmail({
      clientName: "Bob Lee",
      clientEmail: "bob@example.com",
      businessName: "Lee's Gym",
      portalUrl: "https://flow-sites.com/client-portal?token=nopricetoken",
    });

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.html).not.toContain("monthly plan");
  });

  it("returns false when RESEND_API_KEY is not configured", async () => {
    const mockSend = vi.fn();
    vi.doMock("resend", () => ({
      Resend: vi.fn().mockImplementation(() => ({ emails: { send: mockSend } })),
    }));
    vi.doMock("./_core/env", () => ({
      ENV: { resendApiKey: "", emailFromAddress: "test@test.com" },
    }));

    const { sendProjectWelcomeEmail } = await import("./email");
    const result = await sendProjectWelcomeEmail({
      clientName: "No Key",
      clientEmail: "nokey@example.com",
      businessName: "No Key LLC",
      portalUrl: "https://flow-sites.com/client-portal?token=nokey",
    });

    expect(result).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });
});
