import { Router } from "express";
import { z } from "zod";
import { all, get, parseJson, run, tx } from "./db.ts";
import { requireAuth, requireRole } from "./auth.ts";
import { loadPosts } from "./posts.ts";
import { rankTrending } from "./ranking.ts";
import { notify } from "./notify.ts";
import { DEFAULT_PRIVACY, type PrivacySettings, type UserProfile } from "../shared/types.ts";

export const social = Router();

const intParam = (v: unknown) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : NaN;
};
const published = "p.status = 'published' AND p.published_at <= strftime('%Y-%m-%dT%H:%M:%fZ','now')";

social.get("/categories", (_req, res) => {
  res.json(all("SELECT id, name, slug, description, icon FROM categories ORDER BY id"));
});

// ---------- Publishers ----------

function publisherSummary(where: string, viewerId: number | undefined, ...params: (string | number)[]) {
  const v = Number.isInteger(viewerId) ? viewerId : -1;
  return all<Record<string, unknown>>(
    `SELECT pub.id, pub.handle, pub.name, pub.logo_text AS logoText, pub.logo_color AS logoColor, pub.description, pub.website,
       pub.publisher_location AS location, pub.verification_status AS verificationStatus, pub.verification_date AS verificationDate,
       pub.editorial_contact AS editorialContact, pub.ownership, pub.correction_policy_url AS correctionPolicyUrl, pub.is_demo AS isDemo,
       pub.seed_followers + (SELECT COUNT(*) FROM follows f WHERE f.followed_publisher_id = pub.id) AS followers,
       (SELECT COUNT(*) FROM posts p WHERE p.publisher_id = pub.id AND ${published}) AS postCount,
       EXISTS (SELECT 1 FROM follows f WHERE f.followed_publisher_id = pub.id AND f.follower_user_id = ${v}) AS following
     FROM publishers pub WHERE ${where}`, ...params,
  ).map((p) => ({ ...p, verified: p.verificationStatus === "verified", isDemo: !!p.isDemo, following: !!p.following }));
}

social.get("/publishers", (req, res) => {
  res.json(publisherSummary("pub.verification_status = 'verified' ORDER BY pub.seed_followers DESC", req.user?.id));
});

social.get("/publishers/:handle", (req, res) => {
  const p = publisherSummary("pub.handle = ?", req.user?.id, String(req.params.handle))[0];
  if (!p) return void res.status(404).json({ error: "not_found", message: "Publisher not found." });
  res.json(p);
});

social.get("/publishers/:handle/posts", (req, res) => {
  const pub = get<{ id: number }>("SELECT id FROM publishers WHERE handle = ?", String(req.params.handle));
  if (!pub) return void res.status(404).json({ error: "not_found" });
  const tab = String(req.query.tab ?? "latest");
  const filter: Record<string, string> = {
    latest: "", videos: "AND p.content_type = 'video'", articles: "AND p.content_type IN ('quick_read','explainer','breaking','infographic')",
    polls: "AND EXISTS (SELECT 1 FROM polls pl WHERE pl.post_id = p.id)", popular: "",
  };
  const order = tab === "popular" ? "p.seed_likes + (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) DESC" : "p.published_at DESC";
  const ids = all<{ id: number }>(`SELECT p.id FROM posts p WHERE p.publisher_id = ? AND ${published} ${filter[tab] ?? ""} ORDER BY ${order}`, pub.id).map((r) => r.id);
  res.json(loadPosts(ids, req.user?.id));
});

social.post("/follow/publisher/:id", requireAuth, (req, res) => {
  const id = intParam(req.params.id);
  if (!get("SELECT 1 FROM publishers WHERE id = ?", id)) return void res.status(404).json({ error: "not_found" });
  run("INSERT OR IGNORE INTO follows (follower_user_id, followed_publisher_id) VALUES (?, ?)", req.user!.id, id);
  run("DELETE FROM hidden_publishers WHERE user_id = ? AND publisher_id = ?", req.user!.id, id);
  res.json({ following: true });
});
social.delete("/follow/publisher/:id", requireAuth, (req, res) => {
  run("DELETE FROM follows WHERE follower_user_id = ? AND followed_publisher_id = ?", req.user!.id, intParam(req.params.id));
  res.json({ following: false });
});

// ---------- Users ----------

interface UserRowLite {
  id: number; username: string; display_name: string; profile_photo: string | null; bio: string; website: string;
  city: string; region: string; country: string; privacy_settings: string; is_demo: number;
}

function profileFor(u: UserRowLite, viewerId?: number): UserProfile {
  const privacy = { ...DEFAULT_PRIVACY, ...parseJson<Partial<PrivacySettings>>(u.privacy_settings, {}) };
  const isMe = u.id === viewerId;
  const iFollow = !!viewerId && !!get("SELECT 1 FROM follows WHERE follower_user_id = ? AND followed_user_id = ?", viewerId, u.id);
  const blocked = !!viewerId && !!get("SELECT 1 FROM blocks WHERE user_id = ? AND blocked_user_id = ? AND kind = 'block'", viewerId, u.id);
  const muted = !!viewerId && !!get("SELECT 1 FROM blocks WHERE user_id = ? AND blocked_user_id = ? AND kind = 'mute'", viewerId, u.id);
  const blockedMe = !!viewerId && !!get("SELECT 1 FROM blocks WHERE user_id = ? AND blocked_user_id = ? AND kind = 'block'", u.id, viewerId);
  const canSeeContent = isMe || ((!privacy.privateProfile || iFollow) && !blockedMe);
  return {
    id: u.id,
    username: u.username,
    displayName: u.display_name,
    profilePhoto: u.profile_photo,
    bio: u.bio,
    website: u.website,
    location: canSeeContent ? [u.city, u.country].filter(Boolean).join(", ") : "",
    interests: canSeeContent
      ? all<{ name: string }>("SELECT c.name FROM user_interests ui JOIN categories c ON c.id = ui.category_id WHERE ui.user_id = ?", u.id).map((r) => r.name)
      : [],
    followers: get<{ n: number }>("SELECT COUNT(*) AS n FROM follows WHERE followed_user_id = ?", u.id)!.n,
    following: get<{ n: number }>("SELECT COUNT(*) AS n FROM follows WHERE follower_user_id = ?", u.id)!.n,
    likesReceived: get<{ n: number }>("SELECT COUNT(*) AS n FROM comment_likes cl JOIN comments c ON c.id = cl.comment_id WHERE c.user_id = ?", u.id)!.n,
    isMe,
    iFollow,
    isPrivate: privacy.privateProfile,
    canSeeContent,
    likesVisible: isMe || (canSeeContent && privacy.likesPublic),
    isDemo: !!u.is_demo,
    blocked,
    muted,
    publisherHandle: get<{ handle: string }>("SELECT handle FROM publishers WHERE owner_user_id = ?", u.id)?.handle ?? null,
  };
}

const userByName = (username: string) => get<UserRowLite>("SELECT * FROM users WHERE username = ?", username);

social.get("/users/:username", (req, res) => {
  const u = userByName(String(req.params.username));
  if (!u) return void res.status(404).json({ error: "not_found", message: "User not found." });
  res.json(profileFor(u, req.user?.id));
});

social.get("/users/:username/posts", (req, res) => {
  const u = userByName(String(req.params.username));
  if (!u) return void res.status(404).json({ error: "not_found" });
  const profile = profileFor(u, req.user?.id);
  const privacy = { ...DEFAULT_PRIVACY, ...parseJson<Partial<PrivacySettings>>(u.privacy_settings, {}) };
  const tab = String(req.query.tab ?? "reposts");
  if (!profile.canSeeContent) return void res.json({ items: [], hidden: "private" });
  if (tab === "reposts") {
    if (!profile.isMe && !privacy.repostsPublic) return void res.json({ items: [], hidden: "reposts_private" });
    const rows = all<{ post_id: number; commentary: string }>("SELECT post_id, commentary FROM reposts WHERE user_id = ? ORDER BY created_at DESC", u.id);
    const posts = loadPosts(rows.map((r) => r.post_id), req.user?.id);
    const c = new Map(rows.map((r) => [r.post_id, r.commentary]));
    return void res.json({ items: posts.map((p) => ({ ...p, repostedBy: { username: u.username, displayName: u.display_name, commentary: c.get(p.id) ?? "" } })) });
  }
  if (tab === "likes") {
    if (!profile.likesVisible) return void res.json({ items: [], hidden: "likes_private" });
    return void res.json({ items: loadPosts(all<{ post_id: number }>("SELECT post_id FROM likes WHERE user_id = ? ORDER BY created_at DESC", u.id).map((r) => r.post_id), req.user?.id) });
  }
  if (tab === "saved" || tab === "polls") {
    if (!profile.isMe) return void res.json({ items: [], hidden: "owner_only" });
    const sql = tab === "saved"
      ? "SELECT post_id FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC"
      : "SELECT DISTINCT pl.post_id FROM poll_votes v JOIN polls pl ON pl.id = v.poll_id WHERE v.user_id = ? ORDER BY v.created_at DESC";
    return void res.json({ items: loadPosts(all<{ post_id: number }>(sql, u.id).map((r) => r.post_id), req.user?.id) });
  }
  res.status(400).json({ error: "invalid" });
});

social.get("/users/:username/connections", (req, res) => {
  const u = userByName(String(req.params.username));
  if (!u) return void res.status(404).json({ error: "not_found" });
  const privacy = { ...DEFAULT_PRIVACY, ...parseJson<Partial<PrivacySettings>>(u.privacy_settings, {}) };
  const isMe = u.id === req.user?.id;
  const kind = req.query.kind === "following" ? "following" : "followers";
  if (!isMe && (privacy.privateProfile || (kind === "following" && !privacy.followingPublic))) return void res.json({ hidden: true, users: [], publishers: [] });
  const users = kind === "followers"
    ? all("SELECT u.username, u.display_name AS displayName, u.profile_photo AS profilePhoto FROM follows f JOIN users u ON u.id = f.follower_user_id WHERE f.followed_user_id = ?", u.id)
    : all("SELECT u.username, u.display_name AS displayName, u.profile_photo AS profilePhoto FROM follows f JOIN users u ON u.id = f.followed_user_id WHERE f.follower_user_id = ?", u.id);
  const publishers = kind === "following"
    ? all("SELECT p.handle, p.name, p.logo_text AS logoText, p.logo_color AS logoColor FROM follows f JOIN publishers p ON p.id = f.followed_publisher_id WHERE f.follower_user_id = ?", u.id)
    : [];
  res.json({ hidden: false, users, publishers });
});

social.post("/follow/user/:id", requireAuth, (req, res) => {
  const id = intParam(req.params.id);
  if (id === req.user!.id) return void res.status(400).json({ error: "invalid", message: "You can't follow yourself." });
  if (!get("SELECT 1 FROM users WHERE id = ?", id)) return void res.status(404).json({ error: "not_found" });
  if (get("SELECT 1 FROM blocks WHERE user_id = ? AND blocked_user_id = ? AND kind = 'block'", id, req.user!.id)) return void res.status(403).json({ error: "forbidden", message: "You can't follow this account." });
  const r = run("INSERT OR IGNORE INTO follows (follower_user_id, followed_user_id) VALUES (?, ?)", req.user!.id, id);
  if (r.changes > 0) {
    const me = get<{ display_name: string; username: string }>("SELECT display_name, username FROM users WHERE id = ?", req.user!.id)!;
    notify(id, { type: "new_follower", text: `${me.display_name} (@${me.username}) started following you.`, actorId: req.user!.id });
  }
  res.json({ following: true });
});
social.delete("/follow/user/:id", requireAuth, (req, res) => {
  run("DELETE FROM follows WHERE follower_user_id = ? AND followed_user_id = ?", req.user!.id, intParam(req.params.id));
  res.json({ following: false });
});

social.post("/users/:id/block", requireAuth, (req, res) => {
  const id = intParam(req.params.id);
  const kind = req.body?.kind === "mute" ? "mute" : "block";
  if (id === req.user!.id) return void res.status(400).json({ error: "invalid" });
  tx(() => {
    run("INSERT OR IGNORE INTO blocks (user_id, blocked_user_id, kind) VALUES (?, ?, ?)", req.user!.id, id, kind);
    if (kind === "block") run("DELETE FROM follows WHERE (follower_user_id = ? AND followed_user_id = ?) OR (follower_user_id = ? AND followed_user_id = ?)", req.user!.id, id, id, req.user!.id);
  });
  res.json({ ok: true });
});
social.delete("/users/:id/block", requireAuth, (req, res) => {
  const kind = req.query.kind === "mute" ? "mute" : "block";
  run("DELETE FROM blocks WHERE user_id = ? AND blocked_user_id = ? AND kind = ?", req.user!.id, intParam(req.params.id), kind);
  res.json({ ok: true });
});

// ---------- Saved posts and collections ----------

social.get("/me/saved", requireAuth, (req, res) => {
  const collection = req.query.collection ? String(req.query.collection) : "all";
  const category = req.query.category ? String(req.query.category) : "";
  const where: string[] = ["b.user_id = ?"];
  const params: (string | number)[] = [req.user!.id];
  if (collection === "none") where.push("b.collection_id IS NULL");
  else if (collection !== "all") { where.push("b.collection_id = ?"); params.push(intParam(collection)); }
  if (category) { where.push("c.slug = ?"); params.push(category); }
  const ids = all<{ post_id: number }>(
    `SELECT b.post_id FROM bookmarks b JOIN posts p ON p.id = b.post_id JOIN categories c ON c.id = p.category_id WHERE ${where.join(" AND ")} ORDER BY b.created_at DESC`, ...params,
  ).map((r) => r.post_id);
  const collections = all("SELECT c.id, c.name, (SELECT COUNT(*) FROM bookmarks b WHERE b.collection_id = c.id) AS count FROM collections c WHERE c.user_id = ? ORDER BY c.name", req.user!.id);
  const categories = all(
    "SELECT DISTINCT c.slug, c.name FROM bookmarks b JOIN posts p ON p.id = b.post_id JOIN categories c ON c.id = p.category_id WHERE b.user_id = ? ORDER BY c.name", req.user!.id);
  const collectionOf = new Map(all<{ post_id: number; collection_id: number | null }>("SELECT post_id, collection_id FROM bookmarks WHERE user_id = ?", req.user!.id).map((r) => [r.post_id, r.collection_id]));
  res.json({ items: loadPosts(ids, req.user!.id).map((p) => ({ ...p, collectionId: collectionOf.get(p.id) ?? null })), collections, categories });
});

social.post("/me/collections", requireAuth, (req, res) => {
  const name = z.string().trim().min(1, "Name your collection.").max(40).safeParse(req.body?.name);
  if (!name.success) return void res.status(400).json({ error: "invalid", message: name.error.issues[0].message });
  if (get("SELECT 1 FROM collections WHERE user_id = ? AND name = ?", req.user!.id, name.data)) return void res.status(409).json({ error: "exists", message: "You already have a collection with that name." });
  const id = Number(run("INSERT INTO collections (user_id, name) VALUES (?, ?)", req.user!.id, name.data).lastInsertRowid);
  res.status(201).json({ id, name: name.data, count: 0 });
});
social.delete("/me/collections/:id", requireAuth, (req, res) => {
  run("DELETE FROM collections WHERE id = ? AND user_id = ?", intParam(req.params.id), req.user!.id);
  res.json({ ok: true });
});

// ---------- Notifications ----------

social.get("/notifications", requireAuth, (req, res) => {
  const rows = all<{ id: number; type: string; text: string; post_id: number | null; actor: string | null; is_read: number; created_at: string }>(
    `SELECT n.id, n.type, n.text, n.post_id, u.username AS actor, n.is_read, n.created_at FROM notifications n
     LEFT JOIN users u ON u.id = n.actor_user_id WHERE n.recipient_user_id = ? ORDER BY n.created_at DESC LIMIT 100`, req.user!.id);
  res.json(rows.map((r) => ({ id: r.id, type: r.type, text: r.text, postId: r.post_id, actorUsername: r.actor, isRead: !!r.is_read, createdAt: r.created_at })));
});
social.post("/notifications/read", requireAuth, (req, res) => {
  run("UPDATE notifications SET is_read = 1 WHERE recipient_user_id = ?", req.user!.id);
  res.json({ ok: true });
});

// ---------- Discover, topics, search ----------

social.get("/discover", (req, res) => {
  const uid = req.user?.id;
  const ids = (sql: string, ...p: (string | number)[]) => all<{ id: number }>(sql, ...p).map((r) => r.id);
  const trending = rankTrending("global").slice(0, 8).map((r) => r.id);
  const countries = all<{ country: string }>(`SELECT country, COUNT(*) AS n FROM posts p WHERE ${published} AND country <> '' GROUP BY country ORDER BY n DESC`);
  res.json({
    trending: loadPosts(trending, uid),
    categories: all("SELECT c.id, c.name, c.slug, c.icon, (SELECT COUNT(*) FROM posts p WHERE p.category_id = c.id AND p.status = 'published') AS count FROM categories c ORDER BY c.id"),
    publishers: publisherSummary("pub.verification_status = 'verified' ORDER BY pub.seed_followers DESC", uid).filter((p) => !p.following).slice(0, 8),
    aroundTheWorld: countries.map((c) => ({
      country: c.country,
      posts: loadPosts(ids(`SELECT p.id FROM posts p WHERE ${published} AND p.country = ? ORDER BY p.published_at DESC LIMIT 4`, c.country), uid),
    })),
    curious: loadPosts(ids(`SELECT p.id FROM posts p JOIN categories c ON c.id = p.category_id WHERE ${published} AND p.content_type = 'explainer' AND c.slug IN ('technology','science','finance','sports','climate') ORDER BY p.published_at DESC LIMIT 6`), uid),
    deepDive: loadPosts(ids(`SELECT p.id FROM posts p WHERE ${published} AND p.content_type IN ('explainer','infographic') AND p.story_group_id IS NOT NULL ORDER BY p.seed_likes DESC LIMIT 6`), uid),
    goodNews: loadPosts(ids(`SELECT p.id FROM posts p WHERE ${published} AND p.tone = 'positive' ORDER BY p.published_at DESC LIMIT 8`), uid),
  });
});

social.get("/topics/:slug", (req, res) => {
  const cat = get<{ id: number; name: string; slug: string; description: string; icon: string }>("SELECT * FROM categories WHERE slug = ?", String(req.params.slug));
  if (!cat) return void res.status(404).json({ error: "not_found", message: "Topic not found." });
  const ids = all<{ id: number }>(`SELECT p.id FROM posts p WHERE ${published} AND p.category_id = ? ORDER BY p.published_at DESC`, cat.id).map((r) => r.id);
  if (req.user) run("INSERT INTO engagement_events (user_id, post_id, event_type) SELECT ?, id, 'explore' FROM posts WHERE id = ?", req.user.id, ids[0] ?? -1);
  res.json({ category: cat, posts: loadPosts(ids, req.user?.id) });
});

social.get("/story-groups/:id", (req, res) => {
  const g = get("SELECT id, canonical_headline AS headline, summary, background, region FROM story_groups WHERE id = ?", intParam(req.params.id));
  if (!g) return void res.status(404).json({ error: "not_found" });
  const ids = all<{ id: number }>("SELECT id FROM posts WHERE story_group_id = ? AND status = 'published' ORDER BY published_at ASC", intParam(req.params.id)).map((r) => r.id);
  res.json({ group: g, posts: loadPosts(ids, req.user?.id) });
});

social.get("/search", (req, res) => {
  const q = String(req.query.q ?? "").trim().slice(0, 100);
  const type = String(req.query.type ?? "all");
  const sort = String(req.query.sort ?? "relevant");
  const from = String(req.query.from ?? "any");
  const region = String(req.query.region ?? "");
  if (!q) return void res.json({ posts: [], publishers: [], people: [], topics: [] });

  const terms = q.toLowerCase().replace(/^#/, "").split(/\s+/).filter(Boolean).slice(0, 6);
  const like = (t: string) => `%${t.replace(/[%_]/g, "")}%`;
  const where: string[] = [published];
  const params: (string | number)[] = [];
  for (const t of terms) {
    where.push("(lower(p.headline) LIKE ? OR lower(p.summary) LIKE ? OR p.keywords LIKE ? OR lower(p.tags) LIKE ? OR lower(pub.name) LIKE ? OR lower(c.name) LIKE ? OR lower(p.city || ' ' || p.region || ' ' || p.country) LIKE ?)");
    params.push(...Array(7).fill(like(t)));
  }
  if (type === "videos") where.push("p.content_type = 'video'");
  if (type === "articles") where.push("p.content_type <> 'video'");
  const since: Record<string, number> = { "24h": 24, "7d": 168, "30d": 720 };
  if (since[from]) { where.push("p.published_at >= ?"); params.push(new Date(Date.now() - since[from] * 3600_000).toISOString()); }
  if (region) { where.push("(p.country = ? OR (? = 'Global' AND p.scope = 'global'))"); params.push(region, region); }

  const rows = all<{ id: number; headline: string; published_at: string; pop: number }>(
    `SELECT p.id, p.headline, p.published_at, p.seed_likes + (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS pop
     FROM posts p JOIN publishers pub ON pub.id = p.publisher_id JOIN categories c ON c.id = p.category_id WHERE ${where.join(" AND ")}`, ...params);
  const relevance = (h: string) => terms.reduce((s, t) => s + (h.toLowerCase().includes(t) ? 2 : 0), 0);
  rows.sort((a, b) =>
    sort === "latest" ? b.published_at.localeCompare(a.published_at)
      : sort === "popular" ? b.pop - a.pop
        : relevance(b.headline) - relevance(a.headline) || b.published_at.localeCompare(a.published_at));

  const pubMatch = terms.map(like);
  const pubWhere = pubMatch.map(() => "(lower(pub.name) LIKE ? OR lower(pub.handle) LIKE ? OR lower(pub.description) LIKE ?)").join(" AND ");
  const people = all(
    `SELECT username, display_name AS displayName, profile_photo AS profilePhoto, bio FROM users
     WHERE ${pubMatch.map(() => "(lower(username) LIKE ? OR lower(display_name) LIKE ?)").join(" AND ")}
       AND COALESCE(json_extract(privacy_settings, '$.privateProfile'), 0) = 0 LIMIT 10`,
    ...pubMatch.flatMap((t) => [t, t]));
  res.json({
    posts: type === "publishers" || type === "people" ? [] : loadPosts(rows.map((r) => r.id), req.user?.id),
    publishers: type === "all" || type === "publishers" ? publisherSummary(`pub.verification_status = 'verified' AND ${pubWhere}`, req.user?.id, ...pubMatch.flatMap((t) => [t, t, t])) : [],
    people: type === "all" || type === "people" ? people : [],
    topics: all(`SELECT name, slug FROM categories WHERE ${pubMatch.map(() => "lower(name) LIKE ?").join(" OR ")}`, ...pubMatch),
  });
});

// ---------- Moderation (admin only, enforced server-side) ----------

social.get("/admin/reports", requireRole("admin"), (_req, res) => {
  const reports = all<{ id: number; content_type: string; content_id: number; reason: string; details: string; status: string; created_at: string; reporter: string }>(
    `SELECT r.id, r.content_type, r.content_id, r.reason, r.details, r.status, r.created_at, u.username AS reporter
     FROM reports r JOIN users u ON u.id = r.reporter_user_id ORDER BY (r.status = 'open') DESC, r.created_at DESC LIMIT 200`);
  res.json(reports.map((r) => {
    const preview = r.content_type === "post" ? get<{ t: string }>("SELECT headline AS t FROM posts WHERE id = ?", r.content_id)?.t
      : r.content_type === "comment" ? get<{ t: string }>("SELECT text AS t FROM comments WHERE id = ?", r.content_id)?.t
        : get<{ t: string }>("SELECT '@' || username AS t FROM users WHERE id = ?", r.content_id)?.t;
    return { ...r, preview: preview ?? "(content no longer exists)" };
  }));
});

social.post("/admin/reports/:id", requireRole("admin"), (req, res) => {
  const id = intParam(req.params.id);
  const report = get<{ content_type: string; content_id: number }>("SELECT content_type, content_id FROM reports WHERE id = ?", id);
  if (!report) return void res.status(404).json({ error: "not_found" });
  const action = z.enum(["dismiss", "remove"]).safeParse(req.body?.action);
  if (!action.success) return void res.status(400).json({ error: "invalid" });
  tx(() => {
    if (action.data === "remove") {
      if (report.content_type === "comment") run("UPDATE comments SET status = 'removed' WHERE id = ?", report.content_id);
      if (report.content_type === "post") run("UPDATE posts SET status = 'removed' WHERE id = ?", report.content_id);
    }
    run("UPDATE reports SET status = ?, reviewed_by = ? WHERE id = ?", action.data === "remove" ? "actioned" : "dismissed", req.user!.id, id);
    run("INSERT INTO moderation_log (moderator_id, report_id, action) VALUES (?, ?, ?)", req.user!.id, id, action.data);
  });
  res.json({ ok: true });
});

social.get("/admin/tips", requireRole("admin"), (_req, res) => {
  res.json(all("SELECT t.id, t.text, t.link, t.location, t.status, t.created_at AS createdAt, u.username FROM tips t JOIN users u ON u.id = t.user_id ORDER BY t.created_at DESC"));
});
