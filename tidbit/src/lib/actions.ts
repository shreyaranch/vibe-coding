import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, errorMessage } from "./api";
import { useRequireAuth } from "./session";
import type { Post } from "../../shared/types";

const isPost = (x: unknown): x is Post =>
  typeof x === "object" && x !== null && "id" in x && "counts" in x && "publisher" in x && "viewer" in x;

/** Walk any cached value and replace matching posts. Keeps every feed, list and detail view in sync. */
function deepMap(value: unknown, fn: (p: Post) => Post): unknown {
  if (Array.isArray(value)) {
    let changed = false;
    const out = value.map((v) => {
      const n = deepMap(v, fn);
      if (n !== v) changed = true;
      return n;
    });
    return changed ? out : value;
  }
  if (value && typeof value === "object") {
    if (isPost(value)) {
      const next = fn(value);
      return next;
    }
    let changed = false;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const n = deepMap(v, fn);
      if (n !== v) changed = true;
      out[k] = n;
    }
    return changed ? out : value;
  }
  return value;
}

export function patchPosts(qc: QueryClient, match: (p: Post) => boolean, fn: (p: Post) => Post) {
  qc.setQueriesData({ predicate: (q) => q.queryKey[0] !== "me" }, (old: unknown) =>
    old === undefined ? old : deepMap(old, (p) => (match(p) ? fn(p) : p)),
  );
}

export function usePostActions() {
  const qc = useQueryClient();
  const requireAuth = useRequireAuth();

  const applyServer = (p: Post) =>
    patchPosts(qc, (x) => x.id === p.id, (x) => ({ ...x, counts: p.counts, viewer: p.viewer, publisher: { ...x.publisher, following: p.publisher.following } }));

  async function optimistic(post: Post, change: (p: Post) => Post, call: () => Promise<Post>) {
    patchPosts(qc, (x) => x.id === post.id, change);
    try {
      applyServer(await call());
    } catch (e) {
      patchPosts(qc, (x) => x.id === post.id, () => post);
      toast.error(errorMessage(e));
    }
  }

  return {
    toggleLike(post: Post) {
      if (!requireAuth("Sign up to like stories and shape your feed.")) return;
      const liked = !post.viewer.liked;
      void optimistic(
        post,
        (p) => ({ ...p, viewer: { ...p.viewer, liked }, counts: { ...p.counts, likes: p.counts.likes + (liked ? 1 : -1) } }),
        () => (liked ? api.post<Post>(`/posts/${post.id}/like`) : api.del<Post>(`/posts/${post.id}/like`)),
      );
    },
    toggleSave(post: Post, collectionId?: number | null) {
      if (!requireAuth("Sign up to save stories for later.")) return;
      const saved = collectionId !== undefined ? true : !post.viewer.saved;
      void optimistic(
        post,
        (p) => ({ ...p, viewer: { ...p.viewer, saved }, counts: { ...p.counts, saves: p.counts.saves + (saved === p.viewer.saved ? 0 : saved ? 1 : -1) } }),
        () => (saved ? api.post<Post>(`/posts/${post.id}/bookmark`, { collectionId: collectionId ?? null }) : api.del<Post>(`/posts/${post.id}/bookmark`)),
      ).then(() => {
        if (collectionId === undefined) toast.success(saved ? "Saved to your profile" : "Removed from Saved");
        void qc.invalidateQueries({ queryKey: ["saved"] });
      });
    },
    async repost(post: Post, commentary: string) {
      if (!requireAuth("Sign up to repost stories to your followers.")) return false;
      try {
        applyServer(await api.post<Post>(`/posts/${post.id}/repost`, { commentary }));
        toast.success("Reposted to your followers");
        void qc.invalidateQueries({ queryKey: ["user-posts"] });
        return true;
      } catch (e) {
        toast.error(errorMessage(e));
        return false;
      }
    },
    async undoRepost(post: Post) {
      try {
        applyServer(await api.del<Post>(`/posts/${post.id}/repost`));
        toast.success("Repost removed");
        void qc.invalidateQueries({ queryKey: ["user-posts"] });
      } catch (e) {
        toast.error(errorMessage(e));
      }
    },
    async followPublisher(publisher: Post["publisher"], follow = !publisher.following) {
      if (!requireAuth(`Sign up to follow ${publisher.name}.`)) return;
      const set = (following: boolean) =>
        patchPosts(qc, (x) => x.publisher.id === publisher.id, (x) => ({ ...x, publisher: { ...x.publisher, following } }));
      set(follow);
      try {
        await (follow ? api.post(`/follow/publisher/${publisher.id}`) : api.del(`/follow/publisher/${publisher.id}`));
        void qc.invalidateQueries({ queryKey: ["publisher"] });
        void qc.invalidateQueries({ queryKey: ["publishers"] });
        void qc.invalidateQueries({ queryKey: ["discover"] });
        void qc.invalidateQueries({ queryKey: ["search"] });
        void qc.invalidateQueries({ queryKey: ["feed", "following"] });
      } catch (e) {
        set(!follow);
        toast.error(errorMessage(e));
      }
    },
    recordShare(post: Post, type: string) {
      void api.post(`/posts/${post.id}/share`, { type }).catch(() => {});
      patchPosts(qc, (x) => x.id === post.id, (x) => ({ ...x, counts: { ...x.counts, shares: x.counts.shares + 1 } }));
    },
    async feedback(post: Post, type: "not_interested" | "more_like_this" | "less_topic" | "hide_publisher") {
      if (!requireAuth("Sign up to tune your recommendations.")) return false;
      try {
        await api.post(`/posts/${post.id}/feedback`, { type });
        const msg = {
          not_interested: "Got it. You'll see fewer stories like this.",
          more_like_this: `We'll show you more ${post.category.name}.`,
          less_topic: `You'll see less about ${post.category.name}.`,
          hide_publisher: `${post.publisher.name} is hidden. Undo in Settings › Personalization.`,
        }[type];
        toast.success(msg);
        // Remove hidden stories from feeds in place, so the reader keeps their position.
        const remove = type === "not_interested" ? (p: Post) => p.id === post.id
          : type === "hide_publisher" ? (p: Post) => p.publisher.id === post.publisher.id : null;
        if (remove) {
          qc.setQueriesData({ queryKey: ["feed"] }, (old: unknown) => {
            const o = old as { pages: { items: Post[] }[] } | undefined;
            return o?.pages ? { ...o, pages: o.pages.map((pg) => ({ ...pg, items: pg.items.filter((p) => !remove(p)) })) } : old;
          });
        }
        return true;
      } catch (e) {
        toast.error(errorMessage(e));
        return false;
      }
    },
  };
}

export function postUrl(id: number) {
  return `${window.location.origin}/post/${id}`;
}
