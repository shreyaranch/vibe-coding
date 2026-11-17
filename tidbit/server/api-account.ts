import { Router } from "express";
import { z } from "zod";
import { all, get, parseJson, run, tx, nowIso } from "./db.ts";
import { createSession, destroySession, hashPassword, rateLimit, requireAuth, verifyPassword } from "./auth.ts";
import { notify } from "./notify.ts";
import {
  DEFAULT_FEED, DEFAULT_NOTIFICATIONS, DEFAULT_PRIVACY,
  type FeedSettings, type Me, type NotificationSettings, type PrivacySettings,
} from "../shared/types.ts";

export const account = Router();

const username = z.string().trim().toLowerCase().regex(/^[a-z0-9._]{3,24}$/, "Usernames are 3–24 characters: letters, numbers, dots and underscores.");
const password = z.string().min(8, "Use at least 8 characters.").max(200);
const photo = z.string().max(400_000).regex(/^data:image\/(png|jpeg|webp);base64,/, "Upload a PNG, JPEG or WebP image.").nullable();

interface UserRow {
  id: number; username: string; display_name: string; email: string | null; profile_photo: string | null; bio: string; website: string;
  account_type: Me["accountType"]; country: string; region: string; city: string; extra_locations: string; preferences: string;
  privacy_settings: string; feed_settings: string; notification_settings: string; onboarded: number;
}

export function loadMe(userId: number): Me | undefined {
  const u = get<UserRow>("SELECT * FROM users WHERE id = ?", userId);
  if (!u) return undefined;
  return {
    id: u.id,
    username: u.username,
    displayName: u.display_name,
    email: u.email ?? "",
    profilePhoto: u.profile_photo,
    bio: u.bio,
    website: u.website,
    accountType: u.account_type,
    country: u.country,
    region: u.region,
    city: u.city,
    extraLocations: parseJson<string[]>(u.extra_locations, []),
    interests: all<{ category_id: number }>("SELECT category_id FROM user_interests WHERE user_id = ?", userId).map((r) => r.category_id),
    preferences: parseJson<string[]>(u.preferences, []),
    privacy: { ...DEFAULT_PRIVACY, ...parseJson<Partial<PrivacySettings>>(u.privacy_settings, {}) },
    feed: { ...DEFAULT_FEED, ...parseJson<Partial<FeedSettings>>(u.feed_settings, {}) },
    notifications: { ...DEFAULT_NOTIFICATIONS, ...parseJson<Partial<NotificationSettings>>(u.notification_settings, {}) },
    onboarded: !!u.onboarded,
    unreadNotifications: get<{ n: number }>("SELECT COUNT(*) AS n FROM notifications WHERE recipient_user_id = ? AND is_read = 0", userId)?.n ?? 0,
    publisherHandle: get<{ handle: string }>("SELECT handle FROM publishers WHERE owner_user_id = ?", userId)?.handle ?? null,
  };
}

const authLimiter = rateLimit("auth", 20, 10 * 60_000);

account.post("/auth/signup", authLimiter, (req, res) => {
  const body = z.object({
    email: z.email("Enter a valid email address.").trim().toLowerCase(),
    password,
    displayName: z.string().trim().min(1, "Add a display name.").max(50),
    username,
    profilePhoto: photo.optional(),
  }).safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "invalid", message: body.error.issues[0].message });
  const { email, displayName, profilePhoto } = body.data;
  if (get("SELECT 1 FROM users WHERE email = ?", email)) return void res.status(409).json({ error: "email_taken", message: "An account with that email already exists. Try logging in." });
  if (get("SELECT 1 FROM users WHERE username = ?", body.data.username)) return void res.status(409).json({ error: "username_taken", message: "That username is taken." });
  const id = Number(
    run(
      `INSERT INTO users (username, display_name, email, password_hash, profile_photo, privacy_settings, feed_settings, notification_settings)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      body.data.username, displayName, email, hashPassword(body.data.password), profilePhoto ?? null,
      JSON.stringify(DEFAULT_PRIVACY), JSON.stringify(DEFAULT_FEED), JSON.stringify(DEFAULT_NOTIFICATIONS),
    ).lastInsertRowid,
  );
  notify(id, { type: "welcome", text: "Welcome to Tidbit. Everything in this demo feed is fictional sample content from demo publishers." });
  createSession(res, id);
  res.status(201).json(loadMe(id));
});

account.post("/auth/login", authLimiter, (req, res) => {
  const body = z.object({ email: z.string().trim().toLowerCase(), password: z.string() }).safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "invalid", message: "Enter your email and password." });
  const u = get<{ id: number; password_hash: string | null }>("SELECT id, password_hash FROM users WHERE email = ?", body.data.email);
  if (!u || !verifyPassword(body.data.password, u.password_hash)) {
    return void res.status(401).json({ error: "bad_credentials", message: "That email and password don't match." });
  }
  createSession(res, u.id);
  res.json(loadMe(u.id));
});

account.post("/auth/logout", (req, res) => {
  destroySession(req, res);
  res.json({ ok: true });
});

account.get("/auth/me", (req, res) => {
  res.json(req.user ? loadMe(req.user.id) ?? null : null);
});

account.get("/username-available", (req, res) => {
  const parsed = username.safeParse(req.query.u);
  if (!parsed.success) return void res.json({ available: false, message: parsed.error.issues[0].message });
  const taken = get<{ id: number }>("SELECT id FROM users WHERE username = ?", parsed.data);
  res.json({ available: !taken || taken.id === req.user?.id });
});

account.patch("/me", requireAuth, (req, res) => {
  const body = z.object({
    displayName: z.string().trim().min(1).max(50).optional(),
    username: username.optional(),
    bio: z.string().trim().max(160).optional(),
    website: z.union([z.literal(""), z.url("Enter a full URL, starting with https://")]).optional(),
    profilePhoto: photo.optional(),
  }).safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "invalid", message: body.error.issues[0].message });
  const d = body.data;
  if (d.username) {
    const taken = get<{ id: number }>("SELECT id FROM users WHERE username = ?", d.username);
    if (taken && taken.id !== req.user!.id) return void res.status(409).json({ error: "username_taken", message: "That username is taken." });
  }
  const sets: string[] = [];
  const vals: (string | null)[] = [];
  const map: [keyof typeof d, string][] = [["displayName", "display_name"], ["username", "username"], ["bio", "bio"], ["website", "website"], ["profilePhoto", "profile_photo"]];
  for (const [k, col] of map) if (d[k] !== undefined) { sets.push(`${col} = ?`); vals.push(d[k] as string | null); }
  if (sets.length) run(`UPDATE users SET ${sets.join(", ")}, updated_at = ? WHERE id = ?`, ...vals, nowIso(), req.user!.id);
  res.json(loadMe(req.user!.id));
});

account.put("/me/interests", requireAuth, (req, res) => {
  const body = z.object({ categoryIds: z.array(z.number().int()).max(30) }).safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "invalid", message: "Invalid interests." });
  tx(() => {
    run("DELETE FROM user_interests WHERE user_id = ?", req.user!.id);
    for (const id of new Set(body.data.categoryIds)) {
      if (get("SELECT 1 FROM categories WHERE id = ?", id)) run("INSERT INTO user_interests (user_id, category_id) VALUES (?, ?)", req.user!.id, id);
      run("DELETE FROM hidden_topics WHERE user_id = ? AND category_id = ?", req.user!.id, id);
    }
  });
  res.json(loadMe(req.user!.id));
});

account.put("/me/location", requireAuth, (req, res) => {
  const s = z.string().trim().max(80);
  const body = z.object({ country: s, region: s, city: s, extraLocations: z.array(s).max(10).optional() }).safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "invalid", message: "Invalid location." });
  run("UPDATE users SET country = ?, region = ?, city = ?, extra_locations = ?, updated_at = ? WHERE id = ?",
    body.data.country, body.data.region, body.data.city, JSON.stringify(body.data.extraLocations ?? []), nowIso(), req.user!.id);
  res.json(loadMe(req.user!.id));
});

account.put("/me/preferences", requireAuth, (req, res) => {
  const body = z.object({ preferences: z.array(z.string().max(30)).max(10) }).safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "invalid", message: "Invalid preferences." });
  run("UPDATE users SET preferences = ?, updated_at = ? WHERE id = ?", JSON.stringify(body.data.preferences), nowIso(), req.user!.id);
  res.json(loadMe(req.user!.id));
});

account.post("/me/onboarded", requireAuth, (req, res) => {
  const first = get<{ onboarded: number }>("SELECT onboarded FROM users WHERE id = ?", req.user!.id)?.onboarded === 0;
  run("UPDATE users SET onboarded = 1 WHERE id = ?", req.user!.id);
  if (first) {
    // Point new readers at real posts from the publishers they chose to follow.
    const latest = all<{ id: number; headline: string; name: string }>(
      `SELECT p.id, p.headline, pub.name FROM follows f JOIN publishers pub ON pub.id = f.followed_publisher_id
       JOIN posts p ON p.id = (SELECT id FROM posts WHERE publisher_id = pub.id AND status = 'published' ORDER BY published_at DESC LIMIT 1)
       WHERE f.follower_user_id = ? LIMIT 3`, req.user!.id);
    for (const l of latest) notify(req.user!.id, { type: "publisher_post", text: `${l.name} posted: ${l.headline}`, postId: l.id });
    const breaking = get<{ id: number; headline: string }>(
      "SELECT id, headline FROM posts WHERE content_type = 'breaking' AND status = 'published' ORDER BY published_at DESC LIMIT 1");
    if (breaking) notify(req.user!.id, { type: "breaking", text: `Breaking (demo): ${breaking.headline}`, postId: breaking.id });
  }
  res.json(loadMe(req.user!.id));
});

account.put("/me/settings", requireAuth, (req, res) => {
  const body = z.object({
    privacy: z.object({
      privateProfile: z.boolean(), likesPublic: z.boolean(), followingPublic: z.boolean(), repostsPublic: z.boolean(), personalization: z.boolean(),
    }).partial().optional(),
    feed: z.object({
      autoplay: z.boolean(), captions: z.boolean(), defaultTab: z.enum(["foryou", "following", "trending", "local"]),
      reduceDistressing: z.boolean(), dataSaver: z.boolean(),
    }).partial().optional(),
    notifications: z.object({
      breaking: z.boolean(), publisherUpdates: z.boolean(), social: z.boolean(), pollResults: z.boolean(),
      quietHoursStart: z.string().regex(/^(\d{2}:\d{2})?$/), quietHoursEnd: z.string().regex(/^(\d{2}:\d{2})?$/),
    }).partial().optional(),
  }).safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "invalid", message: "Invalid settings." });
  const me = loadMe(req.user!.id)!;
  run("UPDATE users SET privacy_settings = ?, feed_settings = ?, notification_settings = ?, updated_at = ? WHERE id = ?",
    JSON.stringify({ ...me.privacy, ...body.data.privacy }),
    JSON.stringify({ ...me.feed, ...body.data.feed }),
    JSON.stringify({ ...me.notifications, ...body.data.notifications }),
    nowIso(), req.user!.id);
  res.json(loadMe(req.user!.id));
});

account.post("/me/password", requireAuth, (req, res) => {
  const body = z.object({ current: z.string(), next: password }).safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "invalid", message: body.error.issues[0].message });
  const u = get<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = ?", req.user!.id);
  if (!verifyPassword(body.data.current, u?.password_hash ?? null)) return void res.status(400).json({ error: "bad_password", message: "Your current password is incorrect." });
  run("UPDATE users SET password_hash = ? WHERE id = ?", hashPassword(body.data.next), req.user!.id);
  run("DELETE FROM sessions WHERE user_id = ?", req.user!.id);
  createSession(res, req.user!.id);
  res.json({ ok: true });
});

account.post("/me/email", requireAuth, (req, res) => {
  const body = z.object({ email: z.email("Enter a valid email address.").trim().toLowerCase(), password: z.string() }).safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "invalid", message: body.error.issues[0].message });
  const u = get<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = ?", req.user!.id);
  if (!verifyPassword(body.data.password, u?.password_hash ?? null)) return void res.status(400).json({ error: "bad_password", message: "Your password is incorrect." });
  const taken = get<{ id: number }>("SELECT id FROM users WHERE email = ?", body.data.email);
  if (taken && taken.id !== req.user!.id) return void res.status(409).json({ error: "email_taken", message: "That email is already in use." });
  run("UPDATE users SET email = ? WHERE id = ?", body.data.email, req.user!.id);
  res.json(loadMe(req.user!.id));
});

account.post("/me/reset-recommendations", requireAuth, (req, res) => {
  tx(() => {
    run("DELETE FROM engagement_events WHERE user_id = ?", req.user!.id);
    run("DELETE FROM hidden_publishers WHERE user_id = ?", req.user!.id);
    run("DELETE FROM hidden_topics WHERE user_id = ?", req.user!.id);
  });
  res.json({ ok: true });
});

account.get("/me/hidden", requireAuth, (req, res) => {
  res.json({
    publishers: all("SELECT p.id, p.name, p.handle FROM hidden_publishers h JOIN publishers p ON p.id = h.publisher_id WHERE h.user_id = ?", req.user!.id),
    topics: all("SELECT c.id, c.name, c.slug FROM hidden_topics h JOIN categories c ON c.id = h.category_id WHERE h.user_id = ?", req.user!.id),
    blocked: all("SELECT u.id, u.username, u.display_name AS displayName, b.kind FROM blocks b JOIN users u ON u.id = b.blocked_user_id WHERE b.user_id = ?", req.user!.id),
  });
});

account.delete("/me/hidden/publisher/:id", requireAuth, (req, res) => {
  run("DELETE FROM hidden_publishers WHERE user_id = ? AND publisher_id = ?", req.user!.id, Number(req.params.id));
  res.json({ ok: true });
});
account.delete("/me/hidden/topic/:id", requireAuth, (req, res) => {
  run("DELETE FROM hidden_topics WHERE user_id = ? AND category_id = ?", req.user!.id, Number(req.params.id));
  res.json({ ok: true });
});

account.get("/me/export", requireAuth, (req, res) => {
  const id = req.user!.id;
  const me = loadMe(id);
  const data = {
    exportedAt: nowIso(),
    profile: me,
    likes: all("SELECT post_id, created_at FROM likes WHERE user_id = ?", id),
    bookmarks: all("SELECT post_id, collection_id, created_at FROM bookmarks WHERE user_id = ?", id),
    collections: all("SELECT id, name, created_at FROM collections WHERE user_id = ?", id),
    comments: all("SELECT id, post_id, parent_comment_id, text, status, created_at FROM comments WHERE user_id = ?", id),
    reposts: all("SELECT post_id, commentary, created_at FROM reposts WHERE user_id = ?", id),
    follows: all("SELECT followed_user_id, followed_publisher_id, created_at FROM follows WHERE follower_user_id = ?", id),
    pollVotes: all("SELECT poll_id, option_id, created_at FROM poll_votes WHERE user_id = ?", id),
    engagementEvents: all("SELECT post_id, event_type, watch_or_read_duration, completion_percentage, created_at FROM engagement_events WHERE user_id = ?", id),
    reports: all("SELECT content_type, content_id, reason, status, created_at FROM reports WHERE reporter_user_id = ?", id),
  };
  res.setHeader("Content-Disposition", `attachment; filename="tidbit-data-${me?.username}.json"`);
  res.json(data);
});

account.delete("/me", requireAuth, (req, res) => {
  const body = z.object({ password: z.string() }).safeParse(req.body);
  const u = get<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = ?", req.user!.id);
  if (!body.success || !verifyPassword(body.data.password, u?.password_hash ?? null)) {
    return void res.status(400).json({ error: "bad_password", message: "Your password is incorrect." });
  }
  run("DELETE FROM users WHERE id = ?", req.user!.id);
  destroySession(req, res);
  res.json({ ok: true });
});
