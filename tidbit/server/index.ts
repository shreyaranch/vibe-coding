import express, { type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadUser } from "./auth.ts";
import { seedIfEmpty } from "./seed.ts";
import { account } from "./api-account.ts";
import { content } from "./api-content.ts";
import { social } from "./api-social.ts";

const seeded = seedIfEmpty();
const app = express();
app.disable("x-powered-by");
app.set("trust proxy", "loopback");
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(loadUser);

// Basic CSRF protection: state-changing API calls must be JSON (browsers can't send that cross-site without CORS).
app.use("/api", (req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && !String(req.headers["content-type"] ?? "").startsWith("application/json")) {
    res.status(415).json({ error: "unsupported", message: "Send requests as JSON." });
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use("/api", account, content, social);
app.use("/api", (_req, res) => void res.status(404).json({ error: "not_found", message: "Unknown API route." }));

// In production, serve the built client.
const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
if (existsSync(dist)) {
  app.use(express.static(dist, { index: false, maxAge: "1h" }));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(join(dist, "index.html")));
}

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "server_error", message: "Something went wrong on our side. Please try again." });
});

const port = Number(process.env.API_PORT ?? process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`Tidbit API listening on http://localhost:${port}${seeded ? " (seeded demo data)" : ""}`);
});
