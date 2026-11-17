import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { get, run } from "./db.ts";
import type { AccountType } from "../shared/types.ts";

const SESSION_COOKIE = "tidbit_session";
const SESSION_DAYS = 30;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(expected, actual);
}

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export function createSession(res: Response, userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  run("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)", tokenHash(token), userId, expires.toISOString());
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    expires,
    path: "/",
  });
}

export function destroySession(req: Request, res: Response) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) run("DELETE FROM sessions WHERE id = ?", tokenHash(token));
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export interface AuthUser {
  id: number;
  username: string;
  account_type: AccountType;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** Attaches req.user when a valid session cookie is present. Never rejects. */
export function loadUser(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    const row = get<AuthUser & { expires_at: string }>(
      `SELECT u.id, u.username, u.account_type, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?`,
      tokenHash(token),
    );
    if (row && row.expires_at > new Date().toISOString()) {
      req.user = { id: row.id, username: row.username, account_type: row.account_type };
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "auth_required", message: "Sign in to do that." });
    return;
  }
  next();
}

/** Role checks are enforced on the server for every protected route. */
export function requireRole(...roles: AccountType[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "auth_required", message: "Sign in to do that." });
      return;
    }
    if (!roles.includes(req.user.account_type)) {
      res.status(403).json({ error: "forbidden", message: "You don't have permission to do that." });
      return;
    }
    next();
  };
}

/** Simple in-memory fixed-window rate limiter, keyed by user id or IP. */
export function rateLimit(name: string, max: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${name}:${req.user?.id ?? req.ip}`;
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    entry.count += 1;
    if (entry.count > max) {
      res.status(429).json({ error: "rate_limited", message: "Slow down a little and try again in a moment." });
      return;
    }
    next();
  };
}
