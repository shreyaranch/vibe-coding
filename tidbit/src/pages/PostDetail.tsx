import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Bookmark, ExternalLink, Heart, Layers, MapPin, MessageCircle, MoreHorizontal, Share2 } from "lucide-react";
import clsx from "clsx";
import { api } from "../lib/api";
import { usePostActions } from "../lib/actions";
import { CLAIM_LABEL, CONTENT_LABEL, compact, placeLabel, timeAgo } from "../lib/format";
import type { Poll, Post } from "../../shared/types";
import { CoverArt } from "../components/CoverArt";
import { ArticleLink } from "../components/FeedCard";
import { BreakingUpdates, Chart, KeyPoints, MotionPlayer, Slides } from "../components/PostFormats";
import { PollCard } from "../components/Poll";
import { CommentsSheet, PostMenuSheet, ShareSheet } from "../components/Sheets";
import { Button, DemoBadge, ErrorState, PageHeader, PublisherLogo, Spinner, Verified } from "../components/ui";

interface Detail {
  post: Post;
  poll: Poll | null;
  group: { id: number; headline: string; summary: string; background: string; region: string; publisherCount: number } | null;
  related: Post[];
  revisions: { version: number; changeSummary: string; correctionNotice: string | null; createdAt: string }[];
}

export default function PostDetail() {
  const { id } = useParams();
  const loc = useLocation();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["post", Number(id)], queryFn: () => api.get<Detail>(`/posts/${id}`) });
  const [sheet, setSheet] = useState<"comments" | "share" | "menu" | null>(null);
  const actions = usePostActions();

  useEffect(() => {
    if (data && loc.hash === "#coverage") window.setTimeout(() => document.getElementById("coverage")?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [data, loc.hash]);

  if (isLoading) return <><PageHeader title="Story" /><div className="flex justify-center py-20"><Spinner /></div></>;
  if (error || !data) return <><PageHeader title="Story" /><ErrorState error={error} retry={() => refetch()} /></>;
  const { post, group, related, revisions } = data;
  const claim = CLAIM_LABEL[post.claimType];
  const others = related.filter((r) => r.id !== post.id);

  return (
    <div className="mx-auto w-full max-w-3xl pb-16">
      <PageHeader title={post.publisher.name} right={<button onClick={() => setSheet("menu")} className="rounded-full p-2 hover:bg-surface-2" aria-label="More options"><MoreHorizontal /></button>} />

      {/* Media panel */}
      <div className="relative mx-auto mt-0 overflow-hidden bg-navy text-white sm:mt-4 sm:rounded-3xl" style={{ height: post.contentType === "quick_read" ? 260 : 520 }}>
        <CoverArt seed={post.id} category={post.category.slug} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
        <div className="relative flex h-full flex-col py-5">
          {post.contentType === "video" && post.media.scenes ? <MotionPlayer scenes={post.media.scenes} active autoplay={false} accent={post.publisher.logoColor} /> : null}
          {post.contentType === "explainer" && post.media.slides ? <Slides slides={post.media.slides} accent={post.publisher.logoColor} /> : null}
          {post.contentType === "infographic" && post.media.chart ? (
            <div className="flex h-full flex-col justify-center px-6"><Chart chart={post.media.chart} />{post.media.keyPoints ? <KeyPoints points={post.media.keyPoints} /> : null}</div>
          ) : null}
          {post.contentType === "breaking" && post.media.updates ? (
            <div className="flex h-full flex-col justify-center overflow-y-auto px-6">
              <p className="mb-3 text-xs font-bold tracking-widest text-[#FF786B] uppercase">Developing story · details may change</p>
              <BreakingUpdates updates={post.media.updates} publishedAt={post.publishedAt} />
            </div>
          ) : null}
          {post.contentType === "quick_read" ? (
            <div className="mt-auto px-6">
              <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-semibold">{CONTENT_LABEL[post.contentType]}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="px-4 pt-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {post.contentType === "breaking" ? <span className="rounded-md bg-coral px-2 py-0.5 text-navy uppercase">Breaking</span> : <span className="rounded-md bg-surface-2 px-2 py-0.5">{CONTENT_LABEL[post.contentType]}</span>}
          <span className={clsx("rounded-md bg-surface-2 px-2 py-0.5", post.claimType === "unconfirmed" ? "text-coral-text" : post.claimType === "reporting" ? "text-accent-text" : "")}>{claim.label}</span>
          {post.isDemo ? <DemoBadge className="text-muted" /> : null}
        </div>
        <h1 className="mt-3 font-display text-[28px] leading-tight font-extrabold text-balance">{post.headline}</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-fg/90">{post.summary}</p>

        <div className="mt-4 flex items-center gap-3">
          <Link to={`/p/${post.publisher.handle}`} className="flex min-w-0 flex-1 items-center gap-3">
            <PublisherLogo text={post.publisher.logoText} color={post.publisher.logoColor} size={42} />
            <span className="min-w-0">
              <span className="flex items-center gap-1 font-semibold">{post.publisher.name} {post.publisher.verified ? <Verified /> : null}</span>
              <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                <time dateTime={post.publishedAt}>Published {new Date(post.publishedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</time>
                {post.updatedAt !== post.publishedAt ? <span>· Updated {timeAgo(post.updatedAt)}</span> : null}
                {post.city || post.region ? <span className="inline-flex items-center gap-0.5"><MapPin size={11} />{placeLabel(post)}</span> : null}
              </span>
            </span>
          </Link>
          <Button size="sm" variant={post.publisher.following ? "outline" : "primary"} onClick={() => actions.followPublisher(post.publisher)} aria-pressed={post.publisher.following}>
            {post.publisher.following ? "Following" : "Follow"}
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/topic/${post.category.slug}`} className="rounded-full bg-accent/12 px-3 py-1 text-sm font-semibold text-accent-text">{post.category.name}</Link>
          {post.tags.map((t) => <Link key={t} to={`/search?q=${encodeURIComponent(t)}`} className="rounded-full bg-surface-2 px-3 py-1 text-sm">#{t.replace(/\s+/g, "")}</Link>)}
        </div>

        {/* Action bar */}
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-line bg-surface p-1.5">
          <ActionBtn onClick={() => actions.toggleLike(post)} pressed={post.viewer.liked} label={compact(post.counts.likes)} aria={post.viewer.liked ? "Unlike" : "Like"}>
            <Heart size={20} fill={post.viewer.liked ? "currentColor" : "none"} className={post.viewer.liked ? "text-coral-text" : ""} />
          </ActionBtn>
          <ActionBtn onClick={() => setSheet("comments")} label={String(post.counts.comments)} aria="Comments"><MessageCircle size={20} /></ActionBtn>
          <ActionBtn onClick={() => actions.toggleSave(post)} pressed={post.viewer.saved} label={post.viewer.saved ? "Saved" : "Save"} aria={post.viewer.saved ? "Remove from saved" : "Save"}>
            <Bookmark size={20} fill={post.viewer.saved ? "currentColor" : "none"} className={post.viewer.saved ? "text-accent-text" : ""} />
          </ActionBtn>
          <ActionBtn onClick={() => setSheet("share")} label="Share" aria="Share"><Share2 size={20} /></ActionBtn>
        </div>

        <ArticleLink post={post} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-fg font-bold text-bg hover:opacity-90">
          Read full story <ExternalLink size={16} />
        </ArticleLink>

        {data.poll ? (
          <section className="mt-6 rounded-3xl border border-line bg-surface p-5">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-muted"><BarChart3 size={16} /> Audience poll</div>
            <PollCard pollId={data.poll.id} />
          </section>
        ) : null}

        <section className="mt-6 space-y-3 text-sm">
          <h2 className="font-display text-lg font-bold">Sources and attribution</h2>
          <ul className="space-y-1.5 text-muted">
            {post.sources.map((s) => <li key={s} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted" />{s}</li>)}
          </ul>
          <p className="text-muted">Artwork: original generated graphic. {post.isDemo ? "This story and its publisher are fictional demo content." : null}</p>
        </section>

        {revisions.length > 1 ? (
          <section className="mt-6 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm">
            <h2 className="font-semibold">Correction history</h2>
            <ol className="mt-2 space-y-2">
              {revisions.map((r) => (
                <li key={r.version}>
                  <span className="font-semibold">Version {r.version}</span> · {new Date(r.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}: {r.changeSummary}
                  {r.correctionNotice ? <p className="mt-0.5 text-muted">{r.correctionNotice}</p> : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {group ? (
          <section id="coverage" className="mt-10 scroll-mt-16">
            <p className="flex items-center gap-2 text-sm font-semibold text-accent-text"><Layers size={16} /> Related coverage · {group.publisherCount} publishers</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold">{group.headline}</h2>
            <div className="mt-3 rounded-2xl bg-surface-2 p-4">
              <h3 className="text-sm font-bold">Background</h3>
              <p className="mt-1 text-[15px] leading-relaxed">{group.background}</p>
            </div>

            <h3 className="mt-7 font-display text-lg font-bold">See other perspectives</h3>
            <p className="text-sm text-muted">What each publisher reports, labelled by type. Tidbit doesn't assign political labels to sources.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {others.map((r) => {
                const c = CLAIM_LABEL[r.claimType];
                return (
                  <Link key={r.id} to={`/post/${r.id}`} className="rounded-2xl border border-line bg-surface p-4 transition hover:bg-surface-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <PublisherLogo text={r.publisher.logoText} color={r.publisher.logoColor} size={24} className="rounded-md" />{r.publisher.name}
                      </span>
                      <span className={clsx("rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-bold", r.claimType === "unconfirmed" ? "text-coral-text" : r.claimType === "reporting" ? "text-accent-text" : "text-muted")}>
                        {r.claimType === "unconfirmed" ? "Unconfirmed claims" : c.label}
                      </span>
                    </div>
                    <p className="mt-2 font-semibold leading-snug">{r.headline}</p>
                    <p className="mt-1 line-clamp-3 text-sm text-muted">{r.summary}</p>
                  </Link>
                );
              })}
            </div>

            <h3 className="mt-7 font-display text-lg font-bold">Timeline</h3>
            <ol className="mt-3 border-l-2 border-line pl-5">
              {related.map((r) => (
                <li key={r.id} className="relative pb-5">
                  <span className={clsx("absolute top-1 -left-[27px] h-3 w-3 rounded-full ring-4 ring-bg", r.id === post.id ? "bg-accent" : "bg-line")} />
                  <p className="text-xs text-muted">{new Date(r.publishedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} · {r.publisher.name}</p>
                  <Link to={`/post/${r.id}`} className={clsx("font-semibold hover:underline", r.id === post.id && "text-accent-text")}>{r.headline}</Link>
                  {r.id === post.id ? <span className="ml-2 text-xs text-muted">(you're here)</span> : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>

      {sheet === "comments" ? <CommentsSheet post={post} open onOpenChange={(o) => !o && setSheet(null)} /> : null}
      {sheet === "share" ? <ShareSheet post={post} open onOpenChange={(o) => !o && setSheet(null)} /> : null}
      {sheet === "menu" ? <PostMenuSheet post={post} open onOpenChange={(o) => !o && setSheet(null)} /> : null}
    </div>
  );
}

function ActionBtn({ children, label, onClick, pressed, aria }: { children: React.ReactNode; label: string; onClick: () => void; pressed?: boolean; aria: string }) {
  return (
    <button onClick={onClick} aria-pressed={pressed} aria-label={aria} className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold hover:bg-surface-2">
      {children}<span>{label}</span>
    </button>
  );
}
