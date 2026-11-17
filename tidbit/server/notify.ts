import { get, parseJson, run } from "./db.ts";
import { DEFAULT_NOTIFICATIONS, type NotificationSettings } from "../shared/types.ts";

const CATEGORY: Record<string, keyof NotificationSettings | null> = {
  welcome: null,
  breaking: "breaking",
  publisher_post: "publisherUpdates",
  comment_reply: "social",
  comment_like: "social",
  new_follower: "social",
  repost: "social",
  poll_results: "pollResults",
};

/** Creates an in-app notification if the recipient's settings allow that category and they haven't blocked the actor. */
export function notify(recipientId: number, n: { type: string; text: string; actorId?: number; postId?: number; entityId?: number }) {
  if (n.actorId === recipientId) return;
  const u = get<{ notification_settings: string }>("SELECT notification_settings FROM users WHERE id = ?", recipientId);
  if (!u) return;
  const settings = { ...DEFAULT_NOTIFICATIONS, ...parseJson<Partial<NotificationSettings>>(u.notification_settings, {}) };
  const key = CATEGORY[n.type];
  if (key && settings[key] === false) return;
  if (n.actorId && get("SELECT 1 FROM blocks WHERE user_id = ? AND blocked_user_id = ?", recipientId, n.actorId)) return;
  run(
    "INSERT INTO notifications (recipient_user_id, type, actor_user_id, related_entity_id, post_id, text) VALUES (?, ?, ?, ?, ?, ?)",
    recipientId, n.type, n.actorId ?? null, n.entityId ?? null, n.postId ?? null, n.text,
  );
}
