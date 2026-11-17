import { Link } from "react-router";
import { BarChart3, Bookmark, Heart, Layers, MessageCircle, Repeat2 } from "lucide-react";
import clsx from "clsx";
import { CONTENT_LABEL, compact, timeAgo } from "../lib/format";
import { usePostActions } from "../lib/actions";
import type { Post } from "../../shared/types";
import { CoverArt } from "./CoverArt";
import { DemoBadge, PublisherLogo, Verified } from "./ui";

/** Vertical row used in search results, profiles, saved lists and story pages. */
export function PostRow({ post, showActions = true }: { post: Post; showActions?: boolean }) {
  const actions = usePostActions();
  return (
    <article className="flex gap-3.5 py-3.5">
      <Link to={`/post/${post.id}`} className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl" aria-hidden tabIndex={-1}>
        <CoverArt seed={post.id} category={post.category.slug} className="h-full w-full" />
        <span className={clsx("absolute bottom-1.5 left-1.5 rounded px-1 py-px text-[9px] font-bold uppercase", post.contentType === "breaking" ? "bg-coral text-navy" : "bg-black/50 text-white")}>
          {CONTENT_LABEL[post.contentType]}
        </span>
      </Link>
      <div className="min-w-0 flex-1">
        {post.repostedBy ? (
          <p className="mb-1 flex items-center gap-1 text-xs text-muted"><Repeat2 size={12} /> Reposted by {post.repostedBy.displayName}{post.repostedBy.commentary ? `: "${post.repostedBy.commentary}"` : ""}</p>
        ) : null}
        <Link to={`/p/${post.publisher.handle}`} className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-fg">
          <PublisherLogo text={post.publisher.logoText} color={post.publisher.logoColor} size={18} className="rounded-md" />
          {post.publisher.name}
          {post.publisher.verified ? <Verified className="h-3.5 w-3.5" /> : null}
          <span className="font-normal">· {timeAgo(post.publishedAt)}</span>
        </Link>
        <Link to={`/post/${post.id}`} className="mt-1 block font-display text-[16px] leading-snug font-bold hover:underline">{post.headline}</Link>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted">{post.summary}</p>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted">
          <Link to={`/topic/${post.category.slug}`} className="font-semibold text-accent-text">{post.category.name}</Link>
          {post.isDemo ? <DemoBadge /> : null}
          {post.relatedCount ? <span className="inline-flex items-center gap-1"><Layers size={12} />{post.relatedCount} related</span> : null}
          {post.poll ? <span className="inline-flex items-center gap-1"><BarChart3 size={12} />Poll</span> : null}
          {showActions ? (
            <span className="ml-auto flex items-center gap-3">
              <button onClick={() => actions.toggleLike(post)} className={clsx("inline-flex items-center gap-1", post.viewer.liked && "text-coral-text")} aria-label={`${post.viewer.liked ? "Unlike" : "Like"} (${post.counts.likes})`} aria-pressed={post.viewer.liked}>
                <Heart size={14} fill={post.viewer.liked ? "currentColor" : "none"} />{compact(post.counts.likes)}
              </button>
              <span className="inline-flex items-center gap-1" aria-label={`${post.counts.comments} comments`}><MessageCircle size={14} />{post.counts.comments}</span>
              <button onClick={() => actions.toggleSave(post)} className={clsx(post.viewer.saved && "text-accent-text")} aria-label={post.viewer.saved ? "Remove from saved" : "Save"} aria-pressed={post.viewer.saved}>
                <Bookmark size={14} fill={post.viewer.saved ? "currentColor" : "none"} />
              </button>
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** Tall card used in horizontal carousels and grids. */
export function PostTile({ post, className, meta }: { post: Post; className?: string; meta?: string }) {
  return (
    <Link to={`/post/${post.id}`} className={clsx("group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-navy text-white", className)}>
      <CoverArt seed={post.id} category={post.category.slug} className="absolute inset-0 h-full w-full transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute top-2.5 left-2.5 flex gap-1.5">
        <span className={clsx("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase", post.contentType === "breaking" ? "bg-[#FF786B] text-[#101827]" : "bg-black/45")}>{CONTENT_LABEL[post.contentType]}</span>
        {post.isDemo ? <DemoBadge className="bg-black/30 text-white" /> : null}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="text-[10px] font-bold tracking-wider text-[#35D5B1] uppercase">{post.category.name}</p>
        <p className="mt-1 line-clamp-3 font-display text-[15px] leading-snug font-bold">{post.headline}</p>
        <p className="mt-1.5 flex items-center gap-1 truncate text-[11px] text-white/70">
          {post.publisher.name}{post.publisher.verified ? <Verified className="h-3 w-3" /> : null} · {meta ?? timeAgo(post.publishedAt)}
        </p>
      </div>
    </Link>
  );
}

export function PostListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-line" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-3.5 py-3.5">
          <div className="skeleton h-28 w-20 rounded-xl" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="skeleton h-3 w-32 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
