import { all, get, parseJson } from "./db.ts";
import type { Poll, Post, PostMedia } from "../shared/types.ts";

export interface PostRow {
  id: number;
  headline: string;
  summary: string;
  content_type: Post["contentType"];
  media: string;
  original_article_url: string;
  category_id: number;
  cat_name: string;
  cat_slug: string;
  story_group_id: number | null;
  country: string;
  region: string;
  city: string;
  scope: Post["scope"];
  tags: string;
  sources: string;
  claim_type: Post["claimType"];
  tone: Post["tone"];
  credibility: number;
  is_demo: number;
  correction_notice: string | null;
  published_at: string;
  updated_at: string;
  publisher_id: number;
  pub_handle: string;
  pub_name: string;
  pub_logo_text: string;
  pub_logo_color: string;
  pub_verified: number;
  pub_is_demo: number;
  seed_likes: number;
  seed_shares: number;
  seed_saves: number;
  seed_views: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  save_count: number;
  repost_count: number;
  related_count: number;
  viewer_liked: number;
  viewer_saved: number;
  viewer_reposted: number;
  viewer_follows_pub: number;
  poll_id: number | null;
  poll_placement: Poll["placement"] | null;
  viewer_voted: number;
}

const vid = (viewerId?: number) => (Number.isInteger(viewerId) ? Number(viewerId) : -1);

/** Base SELECT for posts with counts and the viewer's own state. viewerId is coerced to an integer. */
export function postSelect(viewerId?: number) {
  const v = vid(viewerId);
  return `
  SELECT p.id, p.headline, p.summary, p.content_type, p.media, p.original_article_url, p.category_id,
    c.name AS cat_name, c.slug AS cat_slug, p.story_group_id, p.country, p.region, p.city, p.scope, p.tags, p.sources,
    p.claim_type, p.tone, p.credibility, p.is_demo, p.correction_notice, p.published_at, p.updated_at,
    p.publisher_id, pub.handle AS pub_handle, pub.name AS pub_name, pub.logo_text AS pub_logo_text, pub.logo_color AS pub_logo_color,
    (pub.verification_status = 'verified') AS pub_verified, pub.is_demo AS pub_is_demo,
    p.seed_likes, p.seed_shares, p.seed_saves, p.seed_views,
    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
    (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id AND cm.status = 'visible') AS comment_count,
    (SELECT COUNT(*) FROM shares s WHERE s.post_id = p.id) AS share_count,
    (SELECT COUNT(*) FROM bookmarks b WHERE b.post_id = p.id) AS save_count,
    (SELECT COUNT(*) FROM reposts r WHERE r.post_id = p.id) AS repost_count,
    CASE WHEN p.story_group_id IS NULL THEN 0 ELSE
      (SELECT COUNT(*) FROM posts p2 WHERE p2.story_group_id = p.story_group_id AND p2.id <> p.id AND p2.status = 'published') END AS related_count,
    EXISTS (SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ${v}) AS viewer_liked,
    EXISTS (SELECT 1 FROM bookmarks b WHERE b.post_id = p.id AND b.user_id = ${v}) AS viewer_saved,
    EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = ${v}) AS viewer_reposted,
    EXISTS (SELECT 1 FROM follows f WHERE f.followed_publisher_id = p.publisher_id AND f.follower_user_id = ${v}) AS viewer_follows_pub,
    pl.id AS poll_id, pl.placement AS poll_placement,
    EXISTS (SELECT 1 FROM poll_votes pv WHERE pv.poll_id = pl.id AND pv.user_id = ${v}) AS viewer_voted
  FROM posts p
  JOIN publishers pub ON pub.id = p.publisher_id
  JOIN categories c ON c.id = p.category_id
  LEFT JOIN polls pl ON pl.post_id = p.id`;
}

export function toPost(r: PostRow): Post {
  return {
    id: r.id,
    headline: r.headline,
    summary: r.summary,
    contentType: r.content_type,
    media: parseJson<PostMedia>(r.media, {}),
    originalArticleUrl: r.original_article_url || `/article/${r.id}`,
    category: { id: r.category_id, name: r.cat_name, slug: r.cat_slug },
    storyGroupId: r.story_group_id,
    relatedCount: r.related_count,
    country: r.country,
    region: r.region,
    city: r.city,
    scope: r.scope,
    tags: r.tags ? r.tags.split(",") : [],
    sources: parseJson<string[]>(r.sources, []),
    claimType: r.claim_type,
    tone: r.tone,
    isDemo: !!r.is_demo,
    correctionNotice: r.correction_notice,
    publishedAt: r.published_at,
    updatedAt: r.updated_at,
    publisher: {
      id: r.publisher_id,
      handle: r.pub_handle,
      name: r.pub_name,
      logoText: r.pub_logo_text,
      logoColor: r.pub_logo_color,
      verified: !!r.pub_verified,
      isDemo: !!r.pub_is_demo,
      following: !!r.viewer_follows_pub,
    },
    counts: {
      likes: r.seed_likes + r.like_count,
      comments: r.comment_count,
      shares: r.seed_shares + r.share_count,
      saves: r.seed_saves + r.save_count,
      views: r.seed_views,
      reposts: r.repost_count,
    },
    viewer: { liked: !!r.viewer_liked, saved: !!r.viewer_saved, reposted: !!r.viewer_reposted },
    poll: r.poll_id ? { id: r.poll_id, voted: !!r.viewer_voted, placement: r.poll_placement! } : null,
  };
}

/** Load posts by id, preserving the order of `ids`. */
export function loadPosts(ids: number[], viewerId?: number): Post[] {
  if (ids.length === 0) return [];
  const clean = ids.filter(Number.isInteger);
  const rows = all<PostRow>(`${postSelect(viewerId)} WHERE p.id IN (${clean.join(",")}) AND p.status = 'published'`);
  const byId = new Map(rows.map((r) => [r.id, toPost(r)]));
  return clean.map((id) => byId.get(id)).filter((p): p is Post => !!p);
}

export function loadPost(id: number, viewerId?: number): Post | undefined {
  const row = get<PostRow>(`${postSelect(viewerId)} WHERE p.id = ? AND p.status = 'published'`, id);
  return row ? toPost(row) : undefined;
}

export function loadPoll(pollId: number, viewerId?: number): Poll | undefined {
  const p = get<{ id: number; post_id: number; question: string; context: string; poll_type: Poll["type"]; placement: Poll["placement"];
    status: Poll["status"]; closes_at: string | null; results_visibility: string; verified_only: number }>("SELECT * FROM polls WHERE id = ?", pollId);
  if (!p) return undefined;
  const options = all<{ id: number; option_text: string; seed_votes: number; votes: number }>(
    `SELECT o.id, o.option_text, o.seed_votes, (SELECT COUNT(*) FROM poll_votes v WHERE v.option_id = o.id) AS votes
     FROM poll_options o WHERE o.poll_id = ? ORDER BY o.display_order`, pollId);
  const myVotes = viewerId
    ? all<{ option_id: number }>("SELECT option_id FROM poll_votes WHERE poll_id = ? AND user_id = ?", pollId, viewerId).map((r) => r.option_id)
    : [];
  const closed = p.status === "closed" || (p.closes_at !== null && p.closes_at < new Date().toISOString());
  const totals = options.map((o) => o.seed_votes + o.votes);
  const sum = totals.reduce((a, b) => a + b, 0);
  // Respondent count: for multi-select polls, count distinct voters plus seeded respondents (approximate as largest option share).
  const respondents = p.poll_type === "multiple"
    ? Math.round(sum / 1.6) + (get<{ n: number }>("SELECT COUNT(DISTINCT user_id) AS n FROM poll_votes WHERE poll_id = ?", pollId)?.n ?? 0)
    : sum;
  const showResults = closed || (myVotes.length > 0 && p.results_visibility === "after_vote");
  return {
    id: p.id,
    postId: p.post_id,
    question: p.question,
    context: p.context,
    type: p.poll_type,
    placement: p.placement,
    status: closed ? "closed" : "open",
    closesAt: p.closes_at,
    verifiedOnly: !!p.verified_only,
    totalVotes: respondents,
    myVotes,
    showResults,
    options: options.map((o, i) => ({
      id: o.id,
      text: o.option_text,
      votes: showResults ? totals[i] : 0,
      pct: showResults && sum > 0 ? Math.round((totals[i] / sum) * 1000) / 10 : 0,
    })),
  };
}
