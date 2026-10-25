import { describe, expect, it } from "vitest";
import { leadCaptureHref } from "../client/src/lib/leadCapture";

describe("leadCaptureHref", () => {
  it("preserves the selected package with the business-needs intake request", () => {
    expect(leadCaptureHref({
      intent: "Start the Growth package",
      packageId: "growth",
    })).toBe("/ai-intake?intent=Start+the+Growth+package&package=growth");
  });

  it("continues to preserve prompt and intent routing for non-package CTAs", () => {
    expect(leadCaptureHref({
      prompt: "I need a booking website",
      intent: "Discuss a website",
    })).toBe("/ai-intake?q=I+need+a+booking+website&intent=Discuss+a+website");
  });
});
