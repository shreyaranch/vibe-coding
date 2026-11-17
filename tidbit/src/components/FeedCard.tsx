import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { BarChart3, Bookmark, ExternalLink, Heart, Layers, MapPin, MessageCircle, MoreHorizontal, Repeat2, Share2, X } from "lucide-react";
import clsx from "clsx";
import { api } from "../lib/api";
import { usePostActions } from "../lib/actions";
import { CLAIM_LABEL, CONTENT_LABEL, compact, placeLabel, timeAgo } from "../lib/format";
import { useMe, usePrefersReducedMotion } from "../lib/session";
import type { Post } from "../../shared/types";
import { CoverArt } from "./CoverArt";
import { BreakingUpdates, Chart, KeyPoints, MotionPlayer, Slides } from "./PostFormats";
import { PollCard } from "./Poll";
import { CommentsSheet, PollSheet, PostMenuSheet, SaveSheet, ShareSheet } from "./Sheets";
import { DemoBadge, PublisherLogo, Verified } from "./ui";

type SheetKind = "comments" | "share" | "menu" | "poll" | "save" | null;

export const FeedCard = memo(function FeedCard({ post, active, preload }: { post: Post; active: boolean; preload: boolean }) {
  const { me } = useMe();
  const actions = usePostActions();
  const reduced = usePrefersReducedMotion();
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [likePop, setLikePop] = useState(false);
  const [showEndPoll, setShowEndPoll] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const progress = useRef(0);
  const activeSince = useRef<number | null>(null);
  const autoplay = (me?.feed.autoplay ?? true) && !reduced && !(me?.feed.dataSaver ?? false);
  const accent = post.publisher.logoColor;

  // Report a view (duration and completion) when the card stops being the active one.
  useEffect(() => {
    if (active) {
      activeSince.current = performance.now();
      return;
    }
    if (activeSince.current === null) return;
    const secs = (performance.now() - activeSince.current) / 1000;
    activeSince.current = null;
    if (secs < 1) return;
    const completion = post.contentType === "video" || post.contentType === "explainer" ? progress.current : Math.min(1, secs / 10);
    void api.post(`/posts/${post.id}/view`, { duration: secs, completion }).catch(() => {});
  }, [active, post.id, post.contentType]);

  const onProgress = useCallback((p: number) => { progress.current = Math.max(progress.current, p); }, []);
  const onEnded = useCallback(() => { if (post.poll?.placement === "end_of_video") setShowEndPoll(true); }, [post.poll?.placement]);
  const onSlide = useCallback((i: number, of: number) => { progress.current = Math.max(progress.current, (i + 1) / of); }, []);

  const like = () => {
    actions.toggleLike(post);
    if (!post.viewer.liked && me) {
      setLikePop(true);
      window.setTimeout(() => setLikePop(false), 400);
    }
  };

  const center = () => {
    const m = post.media;
    switch (post.contentType) {
      case "video":
        return m.scenes?.length && (active || preload) ? (
          <div className="relative h-full">
            <MotionPlayer scenes={m.scenes} active={active} autoplay={autoplay} accent={accent} onProgress={onProgress} onEnded={onEnded} />
            {showEndPoll && post.poll ? (
              <div className="absolute inset-x-4 top-1/2 z-10 -translate-y-1/2 rounded-3xl border border-white/15 bg-[#101827]/90 p-5 backdrop-blur-md animate-rise">
                <button onClick={() => setShowEndPoll(false)} className="absolute top-3 right-3 rounded-full p-1.5 text-white/70 hover:bg-white/10" aria-label="Close poll">
                  <X size={18} />
                </button>
                <PollCard pollId={post.poll.id} dark compact />
              </div>
            ) : null}
          </div>
        ) : <div className="h-full" />;
      case "explainer":
        return m.slides ? (
          <Slides slides={m.slides} accent={accent} onSlideChange={onSlide}
            extra={post.poll?.placement === "after_slides" ? <PollCard pollId={post.poll.id} dark compact /> : undefined} />
        ) : null;
      case "infographic":
        return (
          <div data-inner-scroll className="flex h-full flex-col overflow-y-auto px-6">
            <div className="my-auto rounded-3xl border border-white/10 bg-[#101827]/70 p-5 backdrop-blur-sm">
              {m.chart ? <Chart chart={m.chart} /> : null}
              {m.keyPoints ? <KeyPoints points={m.keyPoints} /> : null}
              <p className="mt-3 text-[11px] text-white/55">Source: {post.sources.join("; ")}</p>
            </div>
          </div>
        );
      case "breaking":
        return (
          <div data-inner-scroll className="flex h-full flex-col overflow-y-auto px-6">
            <div className="my-auto rounded-3xl border border-[#FF786B]/30 bg-[#101827]/80 p-5 backdrop-blur-sm">
              <p className="mb-1 text-xs font-bold tracking-widest text-[#FF786B] uppercase">Developing story</p>
              <p className="mb-4 text-sm text-white/70">Details may change. Unconfirmed reports are labelled.</p>
              {m.updates ? <BreakingUpdates updates={m.updates} publishedAt={post.publishedAt} /> : null}
            </div>
          </div>
        );
      case "quick_read":
      default:
        return (
          <div data-inner-scroll className="flex h-full flex-col overflow-y-auto px-6 pb-2">
            {/* mt-auto (not justify-end) keeps overflowing text reachable from the top */}
            <p className="mt-auto text-[15.5px] leading-[1.6] text-white/90 sm:text-[17px]">{post.summary}</p>
            {post.poll?.placement === "embedded" ? (
              <button
                onClick={() => setSheet("poll")}
                className="mt-4 flex items-center gap-3 rounded-2xl border border-white/15 bg-[#101827]/75 p-3.5 text-left backdrop-blur-sm hover:bg-[#101827]/90"
              >
                <BarChart3 size={22} className="shrink-0 text-[#35D5B1]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold tracking-wider text-[#35D5B1] uppercase">Poll</span>
                  <span className="block font-semibold leading-snug">{post.poll.voted ? "See the results" : "Have your say"}</span>
                </span>
                <span className="rounded-full bg-[#35D5B1] px-3 py-1 text-xs font-bold text-[#062B23]">{post.poll.voted ? "Results" : "Vote"}</span>
              </button>
            ) : null}
          </div>
        );
    }
  };

  const showSummaryBelow = post.contentType !== "quick_read";
  const claim = CLAIM_LABEL[post.claimType];

  return (
    <article className="relative h-full w-full overflow-hidden bg-[#101827] text-white" aria-label={post.headline}>
      {/* Background art and readability gradients */}
      <CoverArt seed={post.id} category={post.category.slug} animated={active && !reduced} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/85" aria-hidden />
      {post.contentType === "quick_read" ? <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden /> : null}

      <div className="relative flex h-full flex-col pt-[104px] md:pt-[88px]">
        {/* Format, label and repost line */}
        <div className="mb-3 flex flex-wrap items-center gap-2 px-5 pr-16 text-xs font-semibold">
          {post.contentType === "breaking" ? (
            <span className="rounded-md bg-[#FF786B] px-2 py-0.5 font-bold tracking-wider text-[#101827] uppercase">Breaking</span>
          ) : (
            <span className="rounded-md bg-white/15 px-2 py-0.5 backdrop-blur-sm">{CONTENT_LABEL[post.contentType]}</span>
          )}
          {post.isDemo ? <DemoBadge className="text-white" /> : null}
          {post.claimType !== "reporting" ? <span className={clsx("rounded-md bg-black/30 px-2 py-0.5", claim.tone)}>{claim.label}</span> : null}
          {post.repostedBy ? (
            <Link to={`/u/${post.repostedBy.username}`} className="inline-flex items-center gap-1 text-white/80 hover:underline">
              <Repeat2 size={13} /> {post.repostedBy.displayName} reposted
            </Link>
          ) : null}
        </div>
        {post.repostedBy?.commentary ? (
          <p className="mx-5 mb-2 mr-16 rounded-2xl bg-white/10 px-3 py-2 text-sm text-white/90 backdrop-blur-sm">"{post.repostedBy.commentary}"</p>
        ) : null}

        <div className="min-h-0 flex-1 pr-14">{center()}</div>

        {/* Bottom info block */}
        <div className="px-5 pt-3 pr-[76px] pb-5">
          <div className="flex items-center gap-2.5">
            <Link to={`/p/${post.publisher.handle}`} className="flex min-w-0 items-center gap-2.5" aria-label={`${post.publisher.name} profile`}>
              <PublisherLogo text={post.publisher.logoText} color={post.publisher.logoColor} size={36} />
              <span className="min-w-0 truncate text-[15px] font-semibold">{post.publisher.name}</span>
              {post.publisher.verified ? <Verified /> : null}
            </Link>
            <button
              onClick={() => actions.followPublisher(post.publisher)}
              className={clsx("h-7 shrink-0 rounded-full px-3 text-xs font-bold transition", post.publisher.following ? "border border-white/40 text-white" : "bg-[#35D5B1] text-[#062B23]")}
              aria-pressed={post.publisher.following}
            >
              {post.publisher.following ? "Following" : "Follow"}
            </button>
          </div>
          <h2 className="mt-2.5 font-display text-[22px] leading-tight font-extrabold text-balance">
            <Link to={`/post/${post.id}`} className="hover:underline">{post.headline}</Link>
          </h2>
          {showSummaryBelow ? (
            <p className={clsx("mt-1.5 text-[15px] leading-snug text-white/80", !expanded && "line-clamp-2")} onClick={() => setExpanded((e) => !e)}>
              {post.summary}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/65">
            <Link to={`/topic/${post.category.slug}`} className="font-semibold text-[#35D5B1] hover:underline">{post.category.name}</Link>
            {post.tags.slice(0, 2).map((t) => <Link key={t} to={`/search?q=${encodeURIComponent(t)}`} className="hover:text-white">#{t.replace(/\s+/g, "")}</Link>)}
            <span aria-hidden>·</span>
            <time dateTime={post.publishedAt}>{timeAgo(post.publishedAt)}</time>
            {post.city || post.region ? <span className="inline-flex items-center gap-0.5"><MapPin size={11} />{placeLabel(post)}</span> : null}
          </div>
          {post.correctionNotice ? <p className="mt-2 text-xs text-amber-200">Corrected: {post.correctionNotice}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <ArticleLink post={post} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold text-[#101827] hover:bg-white/90">
              Read full story <ExternalLink size={14} />
            </ArticleLink>
            {post.relatedCount > 0 ? (
              <Link to={`/post/${post.id}#coverage`} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/35 px-4 text-sm font-semibold hover:bg-white/10">
                <Layers size={15} /> Related coverage · {post.relatedCount}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Right action rail */}
      <div className="absolute right-2.5 bottom-6 flex flex-col items-center gap-3.5">
        <RailButton label={`${post.viewer.liked ? "Unlike" : "Like"} (${post.counts.likes} likes)`} pressed={post.viewer.liked} onClick={like} count={compact(post.counts.likes)}>
          <Heart size={26} className={clsx(likePop && "animate-pop", post.viewer.liked && "text-[#FF786B]")} fill={post.viewer.liked ? "#FF786B" : "none"} />
        </RailButton>
        <RailButton label={`Comments (${post.counts.comments})`} onClick={() => setSheet("comments")} count={compact(post.counts.comments)}>
          <MessageCircle size={26} />
        </RailButton>
        <RailButton
          label={post.viewer.saved ? "Remove from saved" : "Save"}
          pressed={post.viewer.saved}
          onClick={() => actions.toggleSave(post)}
          onLongPress={() => me && setSheet("save")}
          count={post.viewer.saved ? "Saved" : "Save"}
        >
          <Bookmark size={26} fill={post.viewer.saved ? "#35D5B1" : "none"} className={post.viewer.saved ? "text-[#35D5B1]" : undefined} />
        </RailButton>
        <RailButton label="Share" onClick={() => setSheet("share")} count={compact(post.counts.shares)}>
          <Share2 size={25} />
        </RailButton>
        {post.poll ? (
          <RailButton label={post.poll.voted ? "See poll results" : "Open poll"} onClick={() => setSheet("poll")} count={post.poll.voted ? "Results" : "Poll"}>
            <BarChart3 size={25} className={post.poll.voted ? "text-[#35D5B1]" : undefined} />
          </RailButton>
        ) : null}
        <RailButton label="More options" onClick={() => setSheet("menu")}>
          <MoreHorizontal size={26} />
        </RailButton>
      </div>

      {sheet === "comments" ? <CommentsSheet post={post} open onOpenChange={(o) => !o && setSheet(null)} /> : null}
      {sheet === "share" ? <ShareSheet post={post} open onOpenChange={(o) => !o && setSheet(null)} /> : null}
      {sheet === "menu" ? <PostMenuSheet post={post} open onOpenChange={(o) => !o && setSheet(null)} /> : null}
      {sheet === "save" ? <SaveSheet post={post} open onOpenChange={(o) => !o && setSheet(null)} /> : null}
      {sheet === "poll" && post.poll ? <PollSheet pollId={post.poll.id} open onOpenChange={(o) => !o && setSheet(null)} /> : null}
    </article>
  );
});

/** Opens the original article: external publisher URLs in a new tab, demo articles on Tidbit's article page. */
export function ArticleLink({ post, className, children }: { post: Post; className?: string; children: React.ReactNode }) {
  const track = () => void api.post(`/posts/${post.id}/view`, { type: "open_article" }).catch(() => {});
  return /^https?:\/\//.test(post.originalArticleUrl) ? (
    <a href={post.originalArticleUrl} target="_blank" rel="noopener noreferrer" onClick={track} className={className}>{children}</a>
  ) : (
    <Link to={post.originalArticleUrl} onClick={track} className={className}>{children}</Link>
  );
}

function RailButton({ children, label, count, onClick, onLongPress, pressed }: {
  children: React.ReactNode; label: string; count?: string; onClick: () => void; onLongPress?: () => void; pressed?: boolean;
}) {
  const timer = useRef<number | undefined>(undefined);
  const long = useRef(false);
  return (
    <button
      type="button"
      onClick={() => { if (!long.current) onClick(); long.current = false; }}
      onContextMenu={onLongPress ? (e) => { e.preventDefault(); onLongPress(); } : undefined}
      onPointerDown={onLongPress ? () => { long.current = false; timer.current = window.setTimeout(() => { long.current = true; onLongPress(); }, 550); } : undefined}
      onPointerUp={() => window.clearTimeout(timer.current)}
      onPointerLeave={() => window.clearTimeout(timer.current)}
      aria-label={label}
      aria-pressed={pressed}
      className="flex w-14 flex-col items-center gap-0.5 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,.5)]"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/25 backdrop-blur-sm transition hover:bg-black/40">{children}</span>
      {count ? <span className="text-[11px] font-semibold">{count}</span> : null}
    </button>
  );
}
