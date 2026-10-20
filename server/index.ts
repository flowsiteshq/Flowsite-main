import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  // HTML must always be revalidated so Safari/Cloudflare do not pair an
  // outdated page with stale or missing Vite CSS/JS asset references.
  app.use((req, res, next) => {
    if (req.path === "/" || req.path.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
    next();
  });

  app.use(express.static(staticPath, {
    setHeaders(res, filePath) {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
      } else if (/\/assets\//.test(filePath)) {
        // Vite hashed assets are safe to cache long-term.
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }));

  // Missing asset URLs must return a real 404, not the SPA HTML document.
  app.use("/assets", (_req, res) => {
    res.status(404).type("text/plain").send("Asset not found");
  });

  app.get("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
