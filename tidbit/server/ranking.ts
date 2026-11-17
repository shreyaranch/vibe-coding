// Transparent, rules-based ranking for the MVP. Weights live in shared/types.ts (RANKING_WEIGHTS).
import { all, get, parseJson } from "./db.ts";
import { RANKING_WEIGHTS, type FeedSettings, type TrendScope } from "../shared/types.ts";

interface Candidate {
  id: number;
  publisher_id: number;
  pub_name: string;
  category_id: number;
  cat_name: string;
  story_group_id: number | null;
  content_type: string;
  country: string;
  region: string;
  city: string;
  scope: TrendScope;
  tone: string;
  credibility: number;
  published_at: string;
  seed_likes: number;
  seed_shares: number;
  seed_saves: number;
}

export interface Ranked {
  id: number;
  score: number;
  reasons: string[];
}

interface ViewerContext {
  id: number;
  country: string;
  region: string;
  city: string;
  interests: Map<number, number>;
  followedPubs: Set<number>;
  hiddenPubs: Set<number>;
  hiddenTopics: Set<number>;
  notInterested: Set<number>;
  categoryAffinity: Map<number, number>;
  publisherAffinity: Map<number, number>;
  topicNudges: Map<number, number>;
  preferences: Set<string>;
  feed: Partial<FeedSettings>;
  personalization: boolean;
  repostedByFollowed: Set<number>;
}

const hoursSince = (iso: string) => Math.max(0, (Date.now() - new Date(iso).getTime()) / 3600_000);

function candidates(): Candidate[] {
  return all<Candidate>(
    `SELECT p.id, p.publisher_id, pub.name AS pub_name, p.category_id, c.name AS cat_name, p.story_group_id, p.content_type,
       p.country, p.region, p.city, p.scope, p.tone, p.credibility, p.published_at, p.seed_likes, p.seed_shares, p.seed_saves
     FROM posts p JOIN publishers pub ON pub.id = p.publisher_id JOIN categories c ON c.id = p.category_id
     WHERE p.status = 'published' AND p.published_at <= ? AND pub.verification_status = 'verified'`,
    new Date().toISOString(),
  );
}

export function viewerContext(userId: number): ViewerContext | undefined {
  const u = get<{ id: number; country: string; region: string; city: string; preferences: string; feed_settings: string; privacy_settings: string }>(
    "SELECT id, country, region, city, preferences, feed_settings, privacy_settings FROM users WHERE id = ?", userId);
  if (!u) return undefined;
  const ids = (sql: string) => new Set(all<{ id: number }>(sql, userId).map((r) => r.id));
  const privacy = parseJson<{ personalization?: boolean }>(u.privacy_settings, {});

  // Explicit, positive signals only. Passive time on distressing posts is ignored on purpose.
  const signals = all<{ category_id: number; publisher_id: number; w: number }>(
    `SELECT p.category_id, p.publisher_id, SUM(w) AS w FROM (
       SELECT post_id, 1.0 AS w FROM likes WHERE user_id = ?1
       UNION ALL SELECT post_id, 1.2 FROM bookmarks WHERE user_id = ?1
       UNION ALL SELECT post_id, 0.8 FROM shares WHERE user_id = ?1
       UNION ALL SELECT post_id, 1.5 FROM engagement_events WHERE user_id = ?1 AND event_type = 'more_like_this'
       UNION ALL SELECT e.post_id, 0.4 FROM engagement_events e JOIN posts pp ON pp.id = e.post_id
         WHERE e.user_id = ?1 AND e.event_type = 'view' AND e.completion_percentage >= 0.8 AND pp.tone <> 'distressing'
     ) s JOIN posts p ON p.id = s.post_id GROUP BY p.category_id, p.publisher_id`,
    userId,
  );
  const categoryAffinity = new Map<number, number>();
  const publisherAffinity = new Map<number, number>();
  for (const s of signals) {
    categoryAffinity.set(s.category_id, (categoryAffinity.get(s.category_id) ?? 0) + s.w);
    publisherAffinity.set(s.publisher_id, (publisherAffinity.get(s.publisher_id) ?? 0) + s.w);
  }

  const topicNudges = new Map<number, number>();
  for (const r of all<{ category_id: number; event_type: string; n: number }>(
    `SELECT p.category_id, e.event_type, COUNT(*) AS n FROM engagement_events e JOIN posts p ON p.id = e.post_id
     WHERE e.user_id = ? AND e.event_type IN ('more_like_this','less_topic') GROUP BY 1, 2`, userId)) {
    const delta = (r.event_type === "more_like_this" ? 0.25 : -0.5) * r.n;
    topicNudges.set(r.category_id, (topicNudges.get(r.category_id) ?? 0) + delta);
  }

  return {
    id: u.id,
    country: u.country,
    region: u.region,
    city: u.city,
    interests: new Map(all<{ category_id: number; preference_weight: number }>(
      "SELECT category_id, preference_weight FROM user_interests WHERE user_id = ?", userId).map((r) => [r.category_id, r.preference_weight])),
    followedPubs: ids("SELECT followed_publisher_id AS id FROM follows WHERE follower_user_id = ? AND followed_publisher_id IS NOT NULL"),
    hiddenPubs: ids("SELECT publisher_id AS id FROM hidden_publishers WHERE user_id = ?"),
    hiddenTopics: ids("SELECT category_id AS id FROM hidden_topics WHERE user_id = ?"),
    notInterested: ids("SELECT post_id AS id FROM engagement_events WHERE user_id = ? AND event_type = 'not_interested'"),
    repostedByFollowed: ids(
      `SELECT r.post_id AS id FROM reposts r JOIN follows f ON f.followed_user_id = r.user_id WHERE f.follower_user_id = ?`),
    categoryAffinity,
    publisherAffinity,
    topicNudges,
    preferences: new Set(parseJson<string[]>(u.preferences, [])),
    feed: parseJson<Partial<FeedSettings>>(u.feed_settings, {}),
    personalization: privacy.personalization !== false,
  };
}

function geoScore(c: Candidate, v?: { country: string; region: string; city: string }) {
  if (!v || (!v.country && !v.city)) return c.scope === "global" ? 0.4 : 0.2;
  if (v.city && c.city && c.city.toLowerCase() === v.city.toLowerCase()) return 1;
  if (v.region && c.region && c.region.toLowerCase() === v.region.toLowerCase()) return 0.75;
  if (v.country && c.country && c.country.toLowerCase() === v.country.toLowerCase()) return 0.55;
  if (c.scope === "global") return 0.4;
  return 0.05;
}

const PREF_BOOSTS: Record<string, (c: Candidate) => boolean> = {
  breaking: (c) => c.content_type === "breaking",
  videos: (c) => c.content_type === "video",
  summaries: (c) => c.content_type === "quick_read",
  explainers: (c) => c.content_type === "explainer",
  local: (c) => c.scope === "local",
  perspectives: (c) => c.story_group_id !== null,
  markets: (c) => ["Business", "Finance"].includes(c.cat_name),
  positive: (c) => c.tone === "positive",
};

const fmtAge = (h: number) => (h < 1 ? "in the last hour" : h < 24 ? `${Math.round(h)}h ago` : `${Math.round(h / 24)}d ago`);

/** For You ranking: weighted score, then a diversity-aware re-rank. */
export function rankForYou(userId: number | undefined, opts: { explore?: boolean } = {}): Ranked[] {
  const v = userId ? viewerContext(userId) : undefined;
  const personal = v?.personalization ?? false;
  const W: Record<keyof typeof RANKING_WEIGHTS, number> = { ...RANKING_WEIGHTS };
  if (opts.explore) {
    // "Explore outside my bubble": swap emphasis from interests to discovery.
    W.interest = 0.1;
    W.diversity = 0.3;
    W.engagement = 0.05;
  }

  const maxCat = Math.max(1, ...(v ? [...v.categoryAffinity.values()] : [1]));
  const maxPub = Math.max(1, ...(v ? [...v.publisherAffinity.values()] : [1]));
  const pool = candidates();
  const maxPop = Math.max(1, ...pool.map((c) => c.seed_likes));
  const hasInterests = !!v && v.interests.size > 0;

  const scored = pool
    .filter((c) => !v || (!v.hiddenPubs.has(c.publisher_id) && !v.hiddenTopics.has(c.category_id) && !v.notInterested.has(c.id)))
    .map((c) => {
      const age = hoursSince(c.published_at);
      const interestBase = personal && hasInterests ? (v!.interests.has(c.category_id) ? Math.min(1, v!.interests.get(c.category_id)!) : 0) : 0.35;
      const nudge = personal ? v?.topicNudges.get(c.category_id) ?? 0 : 0;
      const f = {
        interest: Math.max(0, Math.min(1, interestBase + nudge)),
        engagement: personal && v
          ? 0.6 * ((v.categoryAffinity.get(c.category_id) ?? 0) / maxCat) + 0.4 * ((v.publisherAffinity.get(c.publisher_id) ?? 0) / maxPub)
          : 0.5 * (c.seed_likes / maxPop),
        freshness: Math.exp(-age / 36),
        credibility: c.credibility,
        follow: v?.followedPubs.has(c.publisher_id) ? 1 : v?.repostedByFollowed.has(c.id) ? 0.5 : 0,
        geography: geoScore(c, personal ? v : undefined),
        diversity: personal && v
          ? 1 - Math.min(1, ((v.categoryAffinity.get(c.category_id) ?? 0) / maxCat) * 0.6 + (v.interests.has(c.category_id) ? 0.4 : 0))
          : 0.5,
      };
      let score = Object.entries(W).reduce((s, [k, w]) => s + w * f[k as keyof typeof f], 0);
      if (personal && v) for (const p of v.preferences) if (PREF_BOOSTS[p]?.(c)) score *= 1.06;
      if (v?.feed.reduceDistressing && c.tone === "distressing") score *= 0.6;

      const reasons: string[] = [];
      if (f.follow === 1) reasons.push(`You follow ${c.pub_name}`);
      else if (f.follow === 0.5) reasons.push("Reposted by someone you follow");
      if (personal && hasInterests && v!.interests.has(c.category_id)) reasons.push(`You picked ${c.cat_name} as an interest`);
      if (personal && nudge > 0) reasons.push(`You asked for more ${c.cat_name}`);
      if (personal && f.engagement > 0.4) reasons.push(`You've engaged with similar ${c.cat_name} stories`);
      if (personal && f.geography >= 0.75 && v?.city) reasons.push(`Relevant to ${f.geography === 1 ? c.city : c.region}`);
      if (age < 6) reasons.push(`Fresh: published ${fmtAge(age)}`);
      if (f.diversity > 0.8 && personal) reasons.push("Adding variety: a topic outside your usual picks");
      if (!personal) reasons.push(userId ? "Personalization is off, so this is ranked by freshness, quality and variety" : "Popular, recent and from a verified publisher");
      if (reasons.length === 0) reasons.push("A recent, well-sourced story from a verified publisher");
      return { c, score, reasons: reasons.slice(0, 3) };
    })
    .sort((a, b) => b.score - a.score);

  return diversify(scored);
}

/**
 * Greedy re-rank: avoid back-to-back posts from one publisher, repeat coverage of the same story
 * within three slots, and more than one distressing story in any three consecutive slots.
 */
function diversify(scored: { c: Candidate; score: number; reasons: string[] }[]): Ranked[] {
  const pool = [...scored];
  const out: typeof scored = [];
  while (pool.length) {
    const recent = out.slice(-3);
    const last = out[out.length - 1];
    const ok = (x: (typeof scored)[number], strict: boolean) =>
      (!last || x.c.publisher_id !== last.c.publisher_id) &&
      (!x.c.story_group_id || !recent.some((r) => r.c.story_group_id === x.c.story_group_id)) &&
      (!strict || x.c.tone !== "distressing" || !recent.slice(-2).some((r) => r.c.tone === "distressing"));
    let idx = pool.findIndex((x) => ok(x, true));
    if (idx < 0) idx = pool.findIndex((x) => ok(x, false));
    if (idx < 0) idx = 0;
    out.push(pool.splice(idx, 1)[0]);
  }
  return out.map((x) => ({ id: x.c.id, score: Math.round(x.score * 1000) / 1000, reasons: x.reasons }));
}

/**
 * Trending: recent unique engagement, share velocity and how many independent publishers cover
 * the same story, decayed by age. At most two posts per publisher make the list.
 */
export function rankTrending(scope: TrendScope, viewer?: { country: string; region: string; city: string }): Ranked[] {
  const counts = new Map(
    all<{ id: number; recent: number; shares: number }>(
      `SELECT p.id,
         (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.created_at > ?1)
         + (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.created_at > ?1)
         + (SELECT COUNT(*) FROM bookmarks b WHERE b.post_id = p.id AND b.created_at > ?1) AS recent,
         (SELECT COUNT(*) FROM shares s WHERE s.post_id = p.id AND s.created_at > ?1) AS shares
       FROM posts p WHERE p.status = 'published'`,
      new Date(Date.now() - 48 * 3600_000).toISOString(),
    ).map((r) => [r.id, r]),
  );
  const coverage = new Map(
    all<{ story_group_id: number; n: number }>(
      "SELECT story_group_id, COUNT(DISTINCT publisher_id) AS n FROM posts WHERE story_group_id IS NOT NULL AND status = 'published' GROUP BY 1",
    ).map((r) => [r.story_group_id, r.n]),
  );

  const inScope = (c: Candidate) => {
    if (scope === "global") return true;
    if (!viewer?.country) return false;
    if (scope === "national") return c.country.toLowerCase() === viewer.country.toLowerCase();
    return (viewer.city && c.city.toLowerCase() === viewer.city.toLowerCase()) || (viewer.region && c.region.toLowerCase() === viewer.region.toLowerCase());
  };

  const scored = candidates()
    .filter(inScope)
    .map((c) => {
      const age = hoursSince(c.published_at);
      const live = counts.get(c.id);
      const engagement = Math.log10(1 + c.seed_likes + c.seed_saves + 25 * (live?.recent ?? 0));
      const velocity = Math.log10(1 + (c.seed_shares + 25 * (live?.shares ?? 0)) / Math.max(1, age));
      const pubs = c.story_group_id ? coverage.get(c.story_group_id) ?? 1 : 1;
      const score = (engagement * 0.45 + velocity * 0.35 + Math.log2(1 + pubs) * 0.6) * c.credibility * Math.exp(-age / 48);
      const reasons = [pubs > 1 ? `${pubs} publishers covering this story` : "Gaining attention", `Published ${fmtAge(age)}`];
      return { c, score, reasons };
    })
    .sort((a, b) => b.score - a.score);

  const perPub = new Map<number, number>();
  const out: Ranked[] = [];
  for (const s of scored) {
    const n = perPub.get(s.c.publisher_id) ?? 0;
    if (n >= 2 && out.length < 12) continue;
    perPub.set(s.c.publisher_id, n + 1);
    out.push({ id: s.c.id, score: Math.round(s.score * 1000) / 1000, reasons: s.reasons });
  }
  return out;
}

/** Local feed: city first, then region, then country; freshest first within each tier. */
export function rankLocal(viewer: { country: string; region: string; city: string }): Ranked[] {
  return candidates()
    .map((c) => ({ c, g: geoScore(c, viewer) }))
    .filter((x) => x.g >= 0.55)
    .sort((a, b) => b.g - a.g || b.c.published_at.localeCompare(a.c.published_at))
    .map((x) => ({
      id: x.c.id,
      score: x.g,
      reasons: [x.g === 1 ? `From ${x.c.city}` : x.g >= 0.75 ? `From ${x.c.region}` : `From ${x.c.country}`],
    }));
}

export function storyCoverageCount(groupId: number) {
  return get<{ n: number }>("SELECT COUNT(DISTINCT publisher_id) AS n FROM posts WHERE story_group_id = ? AND status = 'published'", groupId)?.n ?? 0;
}
