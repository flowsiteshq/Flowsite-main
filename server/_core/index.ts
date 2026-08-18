import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { stripeWebhookHandler } from "../stripe/webhookHandler";
import { invoicePdfHandler } from "../invoicePdfRoute";
import { eightHundredWebhookHandler, eightHundredWebhookVerify } from "../800comWebhook";
import { createGoogleAuthRouter } from "../googleAuth";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ⚠️ Stripe webhook MUST use raw body — register BEFORE express.json()
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhookHandler
  );

  // 800.com inbound SMS webhook — register BEFORE express.json() so body is available
  app.post("/api/800com/webhook", eightHundredWebhookHandler);
  app.get("/api/800com/webhook", eightHundredWebhookVerify);

  // Parse cookies so req.cookies is populated for all routes
  app.use(cookieParser());
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Public invoice PDF download
  app.get("/api/invoice/:shareToken/pdf", invoicePdfHandler);

  // Screenshot proxy — fetches site screenshot from microlink.io and strips
  // the restrictive CSP header so browsers can display the image
  app.get("/api/screenshot", async (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).send("Missing url parameter");
    try {
      const encoded = encodeURIComponent(url);
      const apiUrl = `https://image.thum.io/get/width/1440/crop/900/${url}`;
      const upstream = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        }
      });
      if (!upstream.ok) {
        return res.status(502).send("Screenshot service error");
      }
      const buffer = await upstream.arrayBuffer();
      const contentType = upstream.headers.get("content-type") || "image/png";
      // Forward cache headers but strip the restrictive CSP
      const cacheControl = upstream.headers.get("cache-control") || "public, max-age=3600";
      res.set("Content-Type", contentType);
      res.set("Cache-Control", cacheControl);
      res.set("Access-Control-Allow-Origin", "*");
      return res.send(Buffer.from(buffer));
    } catch (err) {
      console.error("[screenshot proxy] error:", err);
      return res.status(502).send("Screenshot proxy error");
    }
  });

  // Storage proxy for webdev static assets
  registerStorageProxy(app);

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Google OAuth for team member login
  app.use("/api", createGoogleAuthRouter());

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
