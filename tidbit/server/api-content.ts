import { Router, type Request } from "express";
import { z } from "zod";
import { all, get, run, tx } from "./db.ts";
import { rateLimit, requireAuth } from "./auth.ts";
import { loadPoll, loadPost, loadPosts } from "./posts.ts";
import { rankForYou, rankLocal, rankTrending, storyCoverageCount } from "./ranking.ts";
import { notify } from "./notify.ts";
import type { CommentItem, Post, TrendScope } from "../shared/types.ts";

export const content = Router();

const GUEST_FEED_LIMIT = 12;
const intParam = (v: unknown) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : NaN;
};

function viewerLocation(req: Request) {
  if (!req.user) return undefined;
  return get<{ country: string; region: string; city: string }>("SELECT country, region, city FROM users WHERE id = ?", req.user.id);
}

/** Users the viewer has blocked or muted. Their comments and reposts are hidden. */
function hiddenUserIds(viewerId?: number): Set<number> {
  if (!viewerId) return new Set();
  return new Set(all<{ id: number }>("SELECT blocked_user_id AS id FROM blocks WHERE user_id = ?", viewerId).map((r) => r.id));
}

content.get("/feed", (req, res) => {
  const tab = String(req.query.tab ?? "foryou");
  const offset = Math.max(0, Number(req.query.offset) || 0);
  const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 8));
  const uid = req.user?.id;
  let ids: { id: number; reasons?: string[]; repostedBy?: Post["repostedBy"] }[] = [];
  let notice: string | undefined;

  if (tab === "foryou") {
    ids = rankForYou(uid, { explore: req.query.explore === "1" });
    if (!uid) {
      ids = ids.slice(0, GUEST_FEED_LIMIT);
      notice = "guest_limit";
    }
  } else if (tab === "following") {
    if (!uid) return void res.json({ items: [], nextOffset: null, total: 0, notice: "auth_required" });
    const hidden = hiddenUserIds(uid);
    const pubPosts = all<{ id: number; at: string }>(
      `SELECT p.id, p.published_at AS at FROM posts p JOIN follows f ON f.followed_publisher_id = p.publisher_id
       WHERE f.follower_user_id = ? AND p.status = 'published' AND p.published_at <= ?`, uid, new Date().toISOString());
    const reposts = all<{ id: number; at: string; user_id: number; username: string; display_name: string; commentary: string; reposts_public: number }>(
      `SELECT r.post_id AS id, r.created_at AS at, u.id AS user_id, u.username, u.display_name, r.commentary,
         COALESCE(json_extract(u.privacy_settings, '$.repostsPublic'), 1) AS reposts_public
       FROM reposts r JOIN follows f ON f.followed_user_id = r.user_id JOIN users u ON u.id = r.user_id
       WHERE f.follower_user_id = ?`, uid);
    const seen = new Set<number>();
    const merged = [
      ...pubPosts.map((p) => ({ id: p.id, at: p.at, repostedBy: null })),
      ...reposts.filter((r) => r.reposts_public && !hidden.has(r.user_id))
        .map((r) => ({ id: r.id, at: r.at, repostedBy: { username: r.username, displayName: r.display_name, commentary: r.commentary } })),
    ].sort((a, b) => b.at.localeCompare(a.at));
    ids = merged.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));
    if (ids.length === 0) notice = "follow_some";
  } else if (tab === "trending") {
    const scope = (["local", "national", "global"].includes(String(req.query.scope)) ? req.query.scope : "global") as TrendScope;
    const loc = viewerLocation(req);
    if (scope !== "global" && !loc?.country) notice = uid ? "set_location" : "auth_required";
    ids = rankTrending(scope, loc);
  } else if (tab === "local") {
    const loc = viewerLocation(req);
    if (!loc?.country && !loc?.city) return void res.json({ items: [], nextOffset: null, total: 0, notice: uid ? "set_location" : "auth_required" });
    ids = rankLocal(loc);
  } else {
    return void res.status(400).json({ error: "invalid", message: "Unknown feed." });
  }

  const page = ids.slice(offset, offset + limit);
  const posts = loadPosts(page.map((p) => p.id), uid);
  const extras = new Map(page.map((p) => [p.id, p]));
  res.json({
    items: posts.map((p) => ({ ...p, reasons: extras.get(p.id)?.reasons, repostedBy: extras.get(p.id)?.repostedBy ?? null })),
    nextOffset: offset + limit < ids.length ? offset + limit : null,
    total: ids.length,
    notice,
  });
});

content.get("/posts/:id", (req, res) => {
  const id = intParam(req.params.id);
  const post = loadPost(id, req.user?.id);
  if (!post) return void res.status(404).json({ error: "not_found", message: "This story isn't available. It may have been removed." });
  let group = null;
  let related: Post[] = [];
  if (post.storyGroupId) {
    group = get("SELECT id, canonical_headline AS headline, summary, background, region FROM story_groups WHERE id = ?", post.storyGroupId);
    related = loadPosts(
      all<{ id: number }>("SELECT id FROM posts WHERE story_group_id = ? AND status = 'published' ORDER BY published_at ASC", post.storyGroupId).map((r) => r.id),
      req.user?.id,
    );
  }
  const revisions = all("SELECT version, change_summary AS changeSummary, correction_notice AS correctionNotice, created_at AS createdAt FROM post_revisions WHERE post_id = ? ORDER BY version", id);
  res.json({
    post,
    poll: post.poll ? loadPoll(post.poll.id, req.user?.id) : null,
    group: group ? { ...group, publisherCount: storyCoverageCount(post.storyGroupId!) } : null,
    related,
    revisions,
  });
});

content.get("/posts/:id/why", (req, res) => {
  const id = intParam(req.params.id);
  const ranked = rankForYou(req.user?.id).find((r) => r.id === id);
  const post = loadPost(id, req.user?.id);
  if (!post) return void res.status(404).json({ error: "not_found" });
  res.json({
    reasons: ranked?.reasons ?? ["This story was opened directly, not picked by the For You feed."],
    note: "Tidbit ranks stories with a transparent weighted score: interests 25%, recent engagement 15%, freshness 15%, credibility 15%, follows 10%, location 10%, variety 10%.",
  });
});

const mustExist = (id: number) => !!get("SELECT 1 FROM posts WHERE id = ? AND status = 'published'", id);
const engageLimiter = rateLimit("engage", 120, 60_000);

content.post("/posts/:id/like", requireAuth, engageLimiter, (req, res) => {
  const id = intParam(req.params.id);
  if (!mustExist(id)) return void res.status(404).json({ error: "not_found" });
  run("INSERT OR IGNORE INTO likes (user_id, post_id) VALUES (?, ?)", req.user!.id, id);
  res.json(loadPost(id, req.user!.id));
});
content.delete("/posts/:id/like", requireAuth, engageLimiter, (req, res) => {
  const id = intParam(req.params.id);
  run("DELETE FROM likes WHERE user_id = ? AND post_id = ?", req.user!.id, id);
  res.json(loadPost(id, req.user!.id));
});

content.post("/posts/:id/bookmark", requireAuth, engageLimiter, (req, res) => {
  const id = intParam(req.params.id);
  if (!mustExist(id)) return void res.status(404).json({ error: "not_found" });
  const collectionId = req.body?.collectionId ? intParam(req.body.collectionId) : null;
  if (collectionId && !get("SELECT 1 FROM collections WHERE id = ? AND user_id = ?", collectionId, req.user!.id)) {
    return void res.status(400).json({ error: "invalid", message: "That collection doesn't exist." });
  }
  run(`INSERT INTO bookmarks (user_id, post_id, collection_id) VALUES (?, ?, ?)
       ON CONFLICT (user_id, post_id) DO UPDATE SET collection_id = excluded.collection_id`, req.user!.id, id, collectionId);
  res.json(loadPost(id, req.user!.id));
});
content.delete("/posts/:id/bookmark", requireAuth, engageLimiter, (req, res) => {
  const id = intParam(req.params.id);
  run("DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?", req.user!.id, id);
  res.json(loadPost(id, req.user!.id));
});

content.post("/posts/:id/repost", requireAuth, engageLimiter, (req, res) => {
  const id = intParam(req.params.id);
  if (!mustExist(id)) return void res.status(404).json({ error: "not_found" });
  const commentary = z.string().trim().max(280).catch("").parse(req.body?.commentary ?? "");
  run(`INSERT INTO reposts (user_id, post_id, commentary) VALUES (?, ?, ?)
       ON CONFLICT (user_id, post_id) DO UPDATE SET commentary = excluded.commentary`, req.user!.id, id, commentary);
  // Let followers know (respects their notification settings).
  const me = get<{ display_name: string }>("SELECT display_name FROM users WHERE id = ?", req.user!.id)!;
  for (const f of all<{ id: number }>("SELECT follower_user_id AS id FROM follows WHERE followed_user_id = ?", req.user!.id)) {
    notify(f.id, { type: "repost", text: `${me.display_name} reposted a story`, actorId: req.user!.id, postId: id });
  }
  res.json(loadPost(id, req.user!.id));
});
content.delete("/posts/:id/repost", requireAuth, engageLimiter, (req, res) => {
  const id = intParam(req.params.id);
  run("DELETE FROM reposts WHERE user_id = ? AND post_id = ?", req.user!.id, id);
  res.json(loadPost(id, req.user!.id));
});

content.post("/posts/:id/share", rateLimit("share", 60, 60_000), (req, res) => {
  const id = intParam(req.params.id);
  if (!mustExist(id)) return void res.status(404).json({ error: "not_found" });
  const type = z.enum(["copy_link", "native", "x", "facebook", "linkedin", "whatsapp", "email"]).catch("copy_link").parse(req.body?.type);
  run("INSERT INTO shares (user_id, post_id, share_type) VALUES (?, ?, ?)", req.user?.id ?? null, id, type);
  res.json({ ok: true });
});

content.post("/posts/:id/feedback", requireAuth, (req, res) => {
  const id = intParam(req.params.id);
  const post = get<{ publisher_id: number; category_id: number }>("SELECT publisher_id, category_id FROM posts WHERE id = ?", id);
  if (!post) return void res.status(404).json({ error: "not_found" });
  const type = z.enum(["not_interested", "more_like_this", "less_topic", "hide_publisher"]).safeParse(req.body?.type);
  if (!type.success) return void res.status(400).json({ error: "invalid" });
  if (type.data === "hide_publisher") {
    run("INSERT OR IGNORE INTO hidden_publishers (user_id, publisher_id) VALUES (?, ?)", req.user!.id, post.publisher_id);
  }
  run("INSERT INTO engagement_events (user_id, post_id, event_type) VALUES (?, ?, ?)", req.user!.id, id, type.data);
  res.json({ ok: true });
});

content.post("/posts/:id/view", rateLimit("view", 240, 60_000), (req, res) => {
  const id = intParam(req.params.id);
  if (!req.user || !mustExist(id)) return void res.json({ ok: true });
  const duration = Math.min(3600, Math.max(0, Number(req.body?.duration) || 0));
  const completion = Math.min(1, Math.max(0, Number(req.body?.completion) || 0));
  const type = req.body?.type === "open_article" ? "open_article" : "view";
  run("INSERT INTO engagement_events (user_id, post_id, event_type, watch_or_read_duration, completion_percentage) VALUES (?, ?, ?, ?, ?)",
    req.user.id, id, type, duration, completion);
  res.json({ ok: true });
});

// ---------- Comments ----------

interface CommentRow {
  id: number; post_id: number; parent_comment_id: number | null; text: string; status: string; created_at: string;
  user_id: number; username: string; display_name: string; profile_photo: string | null; pub_name: string | null; pub_handle: string | null;
  likes: number; liked: number;
}

content.get("/posts/:id/comments", (req, res) => {
  const id = intParam(req.params.id);
  const v = req.user?.id ?? -1;
  const hidden = hiddenUserIds(req.user?.id);
  const rows = all<CommentRow>(
    `SELECT c.id, c.post_id, c.parent_comment_id, c.text, c.status, c.created_at, u.id AS user_id, u.username, u.display_name, u.profile_photo,
       pub.name AS pub_name, pub.handle AS pub_handle,
       (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) AS likes,
       EXISTS (SELECT 1 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = ?) AS liked
     FROM comments c JOIN users u ON u.id = c.user_id
     LEFT JOIN publishers pub ON pub.owner_user_id = u.id AND pub.verification_status = 'verified'
     WHERE c.post_id = ? ORDER BY c.created_at ASC`, v, id);
  const toItem = (r: CommentRow): CommentItem => ({
    id: r.id,
    postId: r.post_id,
    parentId: r.parent_comment_id,
    text: r.status === "removed" ? "" : r.text,
    createdAt: r.created_at,
    likes: r.likes,
    likedByMe: !!r.liked,
    isMine: r.user_id === req.user?.id,
    removed: r.status === "removed",
    author: { id: r.user_id, username: r.username, displayName: r.display_name, profilePhoto: r.profile_photo, publisherName: r.pub_name, publisherHandle: r.pub_handle },
    replies: [],
  });
  const items = rows.filter((r) => !hidden.has(r.user_id)).map(toItem);
  const byId = new Map(items.map((c) => [c.id, c]));
  const roots: CommentItem[] = [];
  for (const c of items) {
    const parent = c.parentId ? byId.get(c.parentId) : undefined;
    if (parent) parent.replies.push(c);
    else if (!c.parentId) roots.push(c);
  }
  // Drop removed comments that have no replies left to anchor.
  const visible = roots.filter((c) => !c.removed || c.replies.length > 0);
  if (req.query.sort === "newest") visible.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else visible.sort((a, b) => b.likes + b.replies.length - (a.likes + a.replies.length) || b.createdAt.localeCompare(a.createdAt));
  res.json(visible);
});

content.post("/posts/:id/comments", requireAuth, rateLimit("comment", 6, 60_000), (req, res) => {
  const id = intParam(req.params.id);
  if (!mustExist(id)) return void res.status(404).json({ error: "not_found" });
  const body = z.object({ text: z.string().trim().min(1, "Write something first.").max(500, "Comments can be up to 500 characters."), parentId: z.number().int().nullable().optional() }).safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "invalid", message: body.error.issues[0].message });
  let parentId = body.data.parentId ?? null;
  let parentAuthor: number | undefined;
  if (parentId) {
    const parent = get<{ id: number; post_id: number; parent_comment_id: number | null; user_id: number }>("SELECT id, post_id, parent_comment_id, user_id FROM comments WHERE id = ?", parentId);
    if (!parent || parent.post_id !== id) return void res.status(400).json({ error: "invalid", message: "That comment no longer exists." });
    parentAuthor = parent.user_id;
    parentId = parent.parent_comment_id ?? parent.id; // keep threads one level deep
  }
  const newId = Number(run("INSERT INTO comments (post_id, user_id, parent_comment_id, text) VALUES (?, ?, ?, ?)", id, req.user!.id, parentId, body.data.text).lastInsertRowid);
  if (parentAuthor) {
    const me = get<{ display_name: string }>("SELECT display_name FROM users WHERE id = ?", req.user!.id)!;
    notify(parentAuthor, { type: "comment_reply", text: `${me.display_name} replied to your comment: "${body.data.text.slice(0, 80)}"`, actorId: req.user!.id, postId: id, entityId: newId });
  }
  res.status(201).json({ id: newId });
});

content.post("/comments/:id/like", requireAuth, engageLimiter, (req, res) => {
  const id = intParam(req.params.id);
  const c = get<{ user_id: number; post_id: number; status: string }>("SELECT user_id, post_id, status FROM comments WHERE id = ?", id);
  if (!c || c.status !== "visible") return void res.status(404).json({ error: "not_found" });
  const r = run("INSERT OR IGNORE INTO comment_likes (user_id, comment_id) VALUES (?, ?)", req.user!.id, id);
  if (r.changes > 0) {
    const n = get<{ n: number }>("SELECT COUNT(*) AS n FROM comment_likes WHERE comment_id = ?", id)!.n;
    if ([1, 5, 10, 25, 50, 100].includes(n)) {
      notify(c.user_id, { type: "comment_like", text: n === 1 ? "Someone liked your comment." : `Your comment received ${n} likes.`, actorId: req.user!.id, postId: c.post_id, entityId: id });
    }
  }
  res.json({ ok: true });
});
content.delete("/comments/:id/like", requireAuth, engageLimiter, (req, res) => {
  run("DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?", req.user!.id, intParam(req.params.id));
  res.json({ ok: true });
});

content.delete("/comments/:id", requireAuth, (req, res) => {
  const id = intParam(req.params.id);
  const c = get<{ user_id: number }>("SELECT user_id FROM comments WHERE id = ?", id);
  if (!c) return void res.status(404).json({ error: "not_found" });
  if (c.user_id !== req.user!.id && req.user!.account_type !== "admin") return void res.status(403).json({ error: "forbidden", message: "You can only delete your own comments." });
  const hasReplies = get("SELECT 1 FROM comments WHERE parent_comment_id = ?", id);
  if (hasReplies) run("UPDATE comments SET status = 'removed' WHERE id = ?", id);
  else run("DELETE FROM comments WHERE id = ?", id);
  res.json({ ok: true });
});

// ---------- Polls ----------

content.get("/polls/:id", (req, res) => {
  const poll = loadPoll(intParam(req.params.id), req.user?.id);
  if (!poll) return void res.status(404).json({ error: "not_found" });
  res.json(poll);
});

content.post("/polls/:id/vote", requireAuth, rateLimit("vote", 30, 60_000), (req, res) => {
  const pollId = intParam(req.params.id);
  const poll = loadPoll(pollId, req.user!.id);
  if (!poll) return void res.status(404).json({ error: "not_found" });
  if (poll.status === "closed") return void res.status(400).json({ error: "closed", message: "This poll has closed." });
  if (poll.myVotes.length) return void res.status(409).json({ error: "already_voted", message: "You've already voted in this poll." });
  if (poll.verifiedOnly && req.user!.account_type === "reader") return void res.status(403).json({ error: "forbidden", message: "This poll is limited to verified accounts." });
  const body = z.object({ optionIds: z.array(z.number().int()).min(1).max(10) }).safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "invalid", message: "Choose an option first." });
  const valid = new Set(poll.options.map((o) => o.id));
  const chosen = [...new Set(body.data.optionIds)].filter((id) => valid.has(id));
  if (chosen.length === 0 || (poll.type !== "multiple" && chosen.length > 1)) return void res.status(400).json({ error: "invalid", message: "Choose one option." });
  try {
    tx(() => { for (const o of chosen) run("INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES (?, ?, ?)", pollId, o, req.user!.id); });
  } catch (e) {
    if (String(e).includes("already_voted") || String(e).includes("UNIQUE")) return void res.status(409).json({ error: "already_voted", message: "You've already voted in this poll." });
    throw e;
  }
  res.json(loadPoll(pollId, req.user!.id));
});

// ---------- Reports and tips ----------

content.post("/reports", requireAuth, rateLimit("report", 10, 60_000), (req, res) => {
  const body = z.object({
    contentType: z.enum(["post", "comment", "user"]),
    contentId: z.number().int(),
    reason: z.enum(["misinformation", "manipulated_media", "harassment", "hate_speech", "spam", "copyright", "impersonation", "other"]),
    details: z.string().trim().max(1000).optional(),
  }).safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "invalid", message: "Choose a reason." });
  run("INSERT INTO reports (reporter_user_id, content_id, content_type, reason, details) VALUES (?, ?, ?, ?, ?)",
    req.user!.id, body.data.contentId, body.data.contentType, body.data.reason, body.data.details ?? "");
  res.status(201).json({ ok: true });
});

content.post("/tips", requireAuth, rateLimit("tip", 5, 60 * 60_000), (req, res) => {
  const body = z.object({
    text: z.string().trim().min(10, "Tell us a little more (at least 10 characters).").max(2000),
    link: z.union([z.literal(""), z.url("Enter a full URL, starting with https://")]).optional(),
    location: z.string().trim().max(100).optional(),
  }).safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "invalid", message: body.error.issues[0].message });
  run("INSERT INTO tips (user_id, text, link, location) VALUES (?, ?, ?, ?)", req.user!.id, body.data.text, body.data.link ?? "", body.data.location ?? "");
  res.status(201).json({ ok: true });
});
