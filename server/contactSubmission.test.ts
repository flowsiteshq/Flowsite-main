import { beforeEach, describe, expect, it, vi } from "vitest";

const { createWizardSubmission, notifyOwner } = vi.hoisted(() => ({
  createWizardSubmission: vi.fn(),
  notifyOwner: vi.fn(),
}));

vi.mock("./db", () => ({
  createWizardSubmission,
}));

vi.mock("./_core/notification", () => ({
  notifyOwner,
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function makeContext(): TrpcContext {
  return {
    user: null,
    req: { headers: {}, cookies: {}, protocol: "http" } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("contact.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createWizardSubmission.mockResolvedValue({ id: 901 });
    notifyOwner.mockResolvedValue(true);
  });

  it("accepts a phone-only Free Website Review and records a non-routable CRM placeholder", async () => {
    const caller = appRouter.createCaller(makeContext());

    await expect(caller.contact.submit({
      name: "Northstar Studio",
      businessName: "Northstar Studio",
      email: "",
      phone: "555-010-1234",
      lookingFor: "Free Website Review — More leads",
    })).resolves.toEqual({ success: true, id: 901 });

    expect(createWizardSubmission).toHaveBeenCalledWith(expect.objectContaining({
      businessName: "Northstar Studio",
      phone: "555-010-1234",
      email: expect.stringMatching(/^phone-only-\d+@lead\.flowsites\.invalid$/),
      source: "website",
    }));
    expect(notifyOwner).toHaveBeenCalledWith(expect.objectContaining({
      title: "New Contact Form: Northstar Studio",
      content: expect.stringContaining("Phone: 555-010-1234"),
    }));
  });

  it("accepts an email-only Free Website Review and preserves that email in the CRM lead", async () => {
    const caller = appRouter.createCaller(makeContext());

    await caller.contact.submit({
      name: "Westview Fitness",
      businessName: "Westview Fitness",
      email: "owner@westview.example",
      phone: "",
      lookingFor: "Free Website Review — Online booking",
    });

    expect(createWizardSubmission).toHaveBeenCalledWith(expect.objectContaining({
      email: "owner@westview.example",
      phone: "Not provided",
      primaryGoal: "Free Website Review — Online booking",
    }));
    expect(notifyOwner).toHaveBeenCalledOnce();
  });

  it("rejects a review without an email address or phone number", async () => {
    const caller = appRouter.createCaller(makeContext());

    await expect(caller.contact.submit({
      name: "No Contact Business",
      businessName: "No Contact Business",
      email: "",
      phone: "",
      lookingFor: "Free Website Review — A redesign",
    })).rejects.toThrow("An email address or phone number is required");

    expect(createWizardSubmission).not.toHaveBeenCalled();
    expect(notifyOwner).not.toHaveBeenCalled();
  });
});
