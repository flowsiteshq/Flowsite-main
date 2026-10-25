import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { VIDEO_STUDIO_PACKAGES } from "./routers/videoStudioRouter";

const source = (relative: string) => fs.readFileSync(path.resolve(process.cwd(), relative), "utf8");

describe("AI Video Studio", () => {
  it("defines the approved package pricing server-side", () => {
    expect(VIDEO_STUDIO_PACKAGES.social_spark).toEqual({
      label: "Social Spark",
      amountCents: 14_900,
      durationLabel: "15 seconds",
    });
    expect(VIDEO_STUDIO_PACKAGES.business_spotlight).toEqual({
      label: "Business Spotlight",
      amountCents: 29_900,
      durationLabel: "30 seconds",
    });
    expect(VIDEO_STUDIO_PACKAGES.cinematic_pro).toEqual({
      label: "Cinematic Pro",
      amountCents: 59_900,
      durationLabel: "Up to 60 seconds",
    });
  });

  it("creates a separate, server-priced order before checkout", () => {
    const router = source("server/routers/videoStudioRouter.ts");

    expect(router).toContain("const packageDetails = VIDEO_STUDIO_PACKAGES[input.packageId]");
    expect(router).toContain("amountCents: packageDetails.amountCents");
    expect(router).toContain('status: "pending_payment"');
    expect(router).toContain("uploadToken");
    expect(router).toContain("metadata: {");
    expect(router).toContain("videoOrderId: String(order.id)");
    expect(router).toContain("FlowSites AI Video Studio");
    expect(router).toContain("stripe.checkout.sessions.create");
  });

  it("keeps brand uploads bounded and production management protected", () => {
    const router = source("server/routers/videoStudioRouter.ts");
    const schema = source("drizzle/schema.ts");

    expect(router).toContain("safeMimeTypes");
    expect(router).toContain("5 * 1024 * 1024");
    expect(router).toContain("requireVideoAdmin");
    expect(router).toContain("adminList: protectedProcedure");
    expect(router).toContain("adminUpdate: protectedProcedure");
    expect(schema).toContain('videoOrders = mysqlTable("video_orders"');
    expect(schema).toContain('videoOrderAssets = mysqlTable("video_order_assets"');
  });

  it("updates only Video Studio orders after a paid Stripe checkout", () => {
    const webhook = source("server/stripe/webhookHandler.ts");

    expect(webhook).toContain("videoOrderId");
    expect(webhook).toContain("Video Studio orders are deliberately separate from website invoices");
    expect(webhook).toContain('status: "paid"');
    expect(webhook).toContain("Failed to update Video Studio order");
  });

  it("labels showcase clips honestly and protects mobile and reduced-motion playback", () => {
    const studio = source("client/src/pages/AIVideoStudio.tsx");
    const home = source("client/src/pages/Home.tsx");
    const navbar = source("client/src/components/Navbar.tsx");
    const app = source("client/src/App.tsx");

    expect(studio).toContain("Your Brand. Your Story.");
    expect(studio).toContain("Brought to Life.");
    expect(studio).toContain("Created by FlowSites Video Studio. Not client work.");
    expect(studio).toContain("prefers-reduced-motion: reduce");
    expect(studio).toContain('preload={allowAutoplay ? "metadata" : "none"}');
    expect(studio).toContain("Mobile playback is user initiated.");
    expect(home).toContain("Cinematic · engaging · built for business");
    expect(home).toContain("VideoPreviewCard");
    expect(home).toContain('preload={allowHoverPlayback ? "metadata" : "none"}');
    expect(home).toContain("prefers-reduced-motion: reduce");
    expect(home).toContain("video preview");
    expect(navbar).toContain('{ href: "/ai-video-studio", label: "AI Video Studio" }');
    expect(app).toContain('path="/ai-video-studio" component={AIVideoStudio}');
  });

  it("bundles all three playable videos and lightweight posters", () => {
    const publicDir = path.resolve(process.cwd(), "client/public/video-studio");
    for (const name of [
      "automotive-showcase.mp4",
      "restaurant-showcase.mp4",
      "professional-services-showcase.mp4",
      "automotive-poster.jpg",
      "restaurant-poster.jpg",
      "professional-services-poster.jpg",
    ]) {
      const target = path.join(publicDir, name);
      expect(fs.existsSync(target)).toBe(true);
      expect(fs.statSync(target).size).toBeGreaterThan(0);
    }
  });
});
