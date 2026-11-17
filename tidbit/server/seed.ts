import { all, get, migrate, run, tx } from "./db.ts";
import { hashPassword } from "./auth.ts";
import { CATEGORIES, DEMO_COMMENTS, DEMO_READERS, POSTS, PUBLISHERS, STORY_GROUPS, type GroupKey } from "./seed-data.ts";
import { DEFAULT_FEED, DEFAULT_NOTIFICATIONS, DEFAULT_PRIVACY } from "../shared/types.ts";

export const DEMO_PASSWORD = "tidbit-demo";

const hoursAgoIso = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

/** Seeds the database once. Safe to call on every start. */
export function seedIfEmpty() {
  migrate();
  const existing = get<{ n: number }>("SELECT COUNT(*) AS n FROM posts");
  if (existing && existing.n > 0) {
    refreshDemoTimestamps();
    return false;
  }
  tx(seed);
  return true;
}

function seed() {
  const catId = new Map<string, number>();
  for (const c of CATEGORIES) {
    const r = run("INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)", c.name, c.slug, c.description, c.icon);
    catId.set(c.slug, Number(r.lastInsertRowid));
  }

  const settings = (o: object) => JSON.stringify(o);
  const pw = hashPassword(DEMO_PASSWORD);

  // Demo login accounts for development testing.
  const insertAccount = (username: string, name: string, email: string, type: string, bio: string) =>
    Number(
      run(
        `INSERT INTO users (username, display_name, email, password_hash, bio, account_type, country, region, city,
           privacy_settings, feed_settings, notification_settings, preferences, onboarded, is_demo)
         VALUES (?, ?, ?, ?, ?, ?, 'Canada', 'Ontario', 'Port Avalon', ?, ?, ?, '["summaries","perspectives"]', 1, 1)`,
        username, name, email, pw, bio, type, settings(DEFAULT_PRIVACY), settings(DEFAULT_FEED), settings(DEFAULT_NOTIFICATIONS),
      ).lastInsertRowid,
    );
  const readerId = insertAccount("riley", "Riley (Demo Reader)", "reader@tidbit.demo", "reader", "Demo reader account for testing Tidbit.");
  const publisherUserId = insertAccount("dailybrief.editor", "Daily Brief Editor (Demo)", "publisher@tidbit.demo", "publisher", "Demo publisher account. Manages The Daily Brief.");
  insertAccount("tidbit.mod", "Tidbit Moderator (Demo)", "admin@tidbit.demo", "admin", "Demo moderator account.");

  const userId = new Map<string, number>();
  userId.set("riley", readerId);
  for (const r of DEMO_READERS) {
    const id = Number(
      run(
        `INSERT INTO users (username, display_name, bio, country, region, city, privacy_settings, feed_settings, notification_settings, onboarded, is_demo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`,
        r.username, r.name, r.bio, r.country, r.region, r.city,
        settings({ ...DEFAULT_PRIVACY, likesPublic: true }), settings(DEFAULT_FEED), settings(DEFAULT_NOTIFICATIONS),
      ).lastInsertRowid,
    );
    userId.set(r.username, id);
    for (const slug of r.interests) run("INSERT INTO user_interests (user_id, category_id) VALUES (?, ?)", id, catId.get(slug)!);
  }
  for (const slug of ["technology", "ai", "local", "healthcare", "climate"]) {
    run("INSERT INTO user_interests (user_id, category_id) VALUES (?, ?)", readerId, catId.get(slug)!);
  }

  const pubId = new Map<string, number>();
  const verifiedAt = hoursAgoIso(24 * 120);
  for (const p of PUBLISHERS) {
    const id = Number(
      run(
        `INSERT INTO publishers (owner_user_id, handle, name, logo_text, logo_color, website, description, verification_status,
           verification_date, publisher_location, editorial_contact, ownership, correction_policy_url, seed_followers, is_demo)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'verified', ?, ?, ?, ?, ?, ?, 1)`,
        p.handle === "dailybrief" ? publisherUserId : null,
        p.handle, p.name, p.logoText, p.color,
        `https://${p.handle}.example`,
        p.description, verifiedAt, p.location,
        `editors@${p.handle}.example`,
        p.ownership,
        `https://${p.handle}.example/corrections`,
        p.followers,
      ).lastInsertRowid,
    );
    pubId.set(p.handle, id);
    run("INSERT INTO publisher_verification (publisher_id, review_status, reviewed_at, notes) VALUES (?, 'approved', ?, 'Demo publisher seeded for development.')", id, verifiedAt);
  }

  const groupId = new Map<GroupKey, number>();
  for (const [key, g] of Object.entries(STORY_GROUPS) as [GroupKey, (typeof STORY_GROUPS)[GroupKey]][]) {
    const id = Number(
      run("INSERT INTO story_groups (canonical_headline, summary, background, category_id, region) VALUES (?, ?, ?, ?, ?)",
        g.headline, g.summary, g.background, catId.get(g.category)!, g.region).lastInsertRowid,
    );
    groupId.set(key, id);
  }

  const postIds: number[] = [];
  POSTS.forEach((p, i) => {
    const at = hoursAgoIso(p.hoursAgo);
    const credibility = p.claim === "unconfirmed" ? 0.7 : p.claim === "opinion" ? 0.75 : 0.85 + ((i * 7) % 10) / 100;
    const id = Number(
      run(
        `INSERT INTO posts (publisher_id, headline, summary, content_type, media, cover, category_id, story_group_id,
           country, region, city, scope, tags, keywords, sources, claim_type, tone, credibility, correction_notice, is_demo,
           seed_likes, seed_shares, seed_saves, seed_views, published_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)`,
        pubId.get(p.pub)!, p.headline, p.summary, p.type, JSON.stringify(p.media ?? {}), JSON.stringify({ seed: i + 1 }),
        catId.get(p.cat)!, p.group ? groupId.get(p.group)! : null,
        p.place[2], p.place[1], p.place[0], p.scope,
        p.tags.join(","), [p.headline, ...p.tags, p.place[0]].join(" ").toLowerCase(),
        JSON.stringify(p.sources), p.claim ?? "reporting", p.tone ?? "neutral", credibility, p.correction ?? null,
        p.pop, Math.round(p.pop * 0.12), Math.round(p.pop * 0.21), p.pop * 14,
        at, p.correction ? hoursAgoIso(Math.max(0, p.hoursAgo - 1.5)) : at,
      ).lastInsertRowid,
    );
    postIds.push(id);
    if (p.correction) {
      run("INSERT INTO post_revisions (post_id, version, change_summary, created_at) VALUES (?, 1, 'Original publication', ?)", id, at);
      run("INSERT INTO post_revisions (post_id, version, change_summary, correction_notice, created_at) VALUES (?, 2, 'Corrected number of affected terminals', ?, ?)",
        id, p.correction, hoursAgoIso(Math.max(0, p.hoursAgo - 1.5)));
    }
    if (p.poll) {
      const pollId = Number(
        run(
          `INSERT INTO polls (post_id, question, context, poll_type, placement, opens_at, closes_at, verified_only)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          id, p.poll.question, p.poll.context ?? "", p.poll.type, p.poll.placement, at, hoursAgoIso(-24 * 14), p.poll.verifiedOnly ? 1 : 0,
        ).lastInsertRowid,
      );
      p.poll.options.forEach(([text, votes], order) =>
        run("INSERT INTO poll_options (poll_id, option_text, display_order, seed_votes) VALUES (?, ?, ?, ?)", pollId, text, order, votes),
      );
    }
  });

  // Northline's replies come from a staff account so they show the publisher badge.
  const northlineStaff = Number(
    run(`INSERT INTO users (username, display_name, bio, account_type, onboarded, is_demo, privacy_settings) VALUES ('northline.desk', 'Northline News Desk', 'Demo publisher staff account.', 'publisher', 1, 1, ?)`,
      settings(DEFAULT_PRIVACY)).lastInsertRowid,
  );
  run("UPDATE publishers SET owner_user_id = ? WHERE handle = 'northline'", northlineStaff);

  // Demo comments, including a publisher reply. Spread across the hours since posting.
  for (const c of DEMO_COMMENTS) {
    const postId = postIds[c.post - 1];
    const postAge = POSTS[c.post - 1].hoursAgo;
    const parent = Number(
      run("INSERT INTO comments (post_id, user_id, text, created_at) VALUES (?, ?, ?, ?)", postId, userId.get(c.user)!, c.text, hoursAgoIso(postAge * 0.7)).lastInsertRowid,
    );
    c.replies?.forEach((r, i) => {
      const uid = r.user.startsWith("@") ? get<{ owner_user_id: number }>("SELECT owner_user_id FROM publishers WHERE handle = ?", r.user.slice(1))?.owner_user_id ?? publisherUserId : userId.get(r.user)!;
      run("INSERT INTO comments (post_id, user_id, parent_comment_id, text, created_at) VALUES (?, ?, ?, ?, ?)", postId, uid, parent, r.text, hoursAgoIso(postAge * (0.5 - i * 0.1)));
    });
  }
  // A few seeded comment likes, follows, likes and reposts between demo readers.
  const allComments = all<{ id: number }>("SELECT id FROM comments");
  allComments.forEach((c, i) => {
    const likers = [...userId.values()].filter((_, j) => (i + j) % 3 === 0);
    for (const u of likers) run("INSERT OR IGNORE INTO comment_likes (user_id, comment_id) VALUES (?, ?)", u, c.id);
  });

  const follow = (follower: string, handle: string) =>
    run("INSERT OR IGNORE INTO follows (follower_user_id, followed_publisher_id) VALUES (?, ?)", userId.get(follower)!, pubId.get(handle)!);
  follow("avareads", "circuitcode"); follow("avareads", "pulsehealth"); follow("marcusb", "northline"); follow("marcusb", "meridian");
  follow("priyanair", "greenwire"); follow("leo.ok", "markethour"); follow("leo.ok", "fieldhouse"); follow("sofiaruiz", "pulsehealth");
  follow("dankim", "circuitcode"); follow("dankim", "greenwire"); follow("riley", "dailybrief"); follow("riley", "circuitcode");

  const followUser = (a: string, b: string) =>
    run("INSERT OR IGNORE INTO follows (follower_user_id, followed_user_id) VALUES (?, ?)", userId.get(a)!, userId.get(b)!);
  followUser("avareads", "dankim"); followUser("dankim", "avareads"); followUser("marcusb", "avareads"); followUser("sofiaruiz", "avareads");
  followUser("priyanair", "dankim"); followUser("riley", "avareads"); followUser("leo.ok", "marcusb");

  const repost = (user: string, postNo: number, commentary: string) =>
    run("INSERT INTO reposts (user_id, post_id, commentary, created_at) VALUES (?, ?, ?, ?)", userId.get(user)!, postIds[postNo - 1], commentary, hoursAgoIso(POSTS[postNo - 1].hoursAgo * 0.6));
  repost("avareads", 9, "The clearest explanation of open models I've seen.");
  repost("avareads", 19, "");
  repost("marcusb", 2, "Worth reading before Tuesday's vote.");
  repost("dankim", 11, "Bookmark this before smoke season.");
  repost("priyanair", 23, "Good news for once.");

  const like = (user: string, postNo: number) =>
    run("INSERT OR IGNORE INTO likes (user_id, post_id) VALUES (?, ?)", userId.get(user)!, postIds[postNo - 1]);
  [7, 9, 19, 40, 12].forEach((n) => like("avareads", n));
  [1, 2, 3, 28].forEach((n) => like("marcusb", n));
  [11, 13, 23, 24, 20].forEach((n) => like("priyanair", n));
  [16, 21, 18, 5].forEach((n) => like("leo.ok", n));
  [12, 14, 26, 34].forEach((n) => like("sofiaruiz", n));
  [6, 19, 35, 22].forEach((n) => like("dankim", n));
}

/**
 * Demo posts are seeded relative to "now". When the server restarts days later, shift them
 * forward so relative times still read sensibly. All demo posts remain labelled as demo content.
 */
function refreshDemoTimestamps() {
  const newest = get<{ t: string | null }>("SELECT MAX(published_at) AS t FROM posts WHERE is_demo = 1");
  if (!newest?.t) return;
  const shiftMs = Date.now() - 3600_000 - new Date(newest.t).getTime();
  if (shiftMs < 6 * 3600_000) return;
  const shift = `+${Math.round(shiftMs / 1000)} seconds`;
  const fmt = (col: string) => `strftime('%Y-%m-%dT%H:%M:%fZ', ${col}, '${shift}')`;
  tx(() => {
    run(`UPDATE posts SET published_at = ${fmt("published_at")}, updated_at = ${fmt("updated_at")} WHERE is_demo = 1`);
    run(`UPDATE polls SET opens_at = ${fmt("opens_at")}, closes_at = ${fmt("closes_at")} WHERE post_id IN (SELECT id FROM posts WHERE is_demo = 1)`);
    run(`UPDATE comments SET created_at = ${fmt("created_at")} WHERE user_id IN (SELECT id FROM users WHERE is_demo = 1)`);
    run(`UPDATE reposts SET created_at = ${fmt("created_at")} WHERE user_id IN (SELECT id FROM users WHERE is_demo = 1)`);
  });
}
