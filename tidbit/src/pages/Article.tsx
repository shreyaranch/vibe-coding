import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "../lib/api";
import { CLAIM_LABEL, placeLabel } from "../lib/format";
import type { Post } from "../../shared/types";
import { DemoBadge, ErrorState, PageHeader, PublisherLogo, Spinner, Verified } from "../components/ui";

/**
 * Full-story page for demo posts. Real publisher posts link to the publisher's own site instead;
 * the fictional demo publishers have no website, so their articles are shown here.
 */
export default function Article() {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["post", Number(id)], queryFn: () => api.get<{ post: Post }>(`/posts/${id}`) });
  const post = data?.post;
  useEffect(() => {
    if (post) document.title = `${post.headline} · Tidbit`;
    return () => { document.title = "Tidbit"; };
  }, [post]);

  if (isLoading) return <><PageHeader title="Full story" /><div className="flex justify-center py-20"><Spinner /></div></>;
  if (error || !post) return <><PageHeader title="Full story" /><ErrorState error={error} retry={() => refetch()} /></>;
  const m = post.media;

  return (
    <div className="pb-16">
      <PageHeader title="Full story" />
      <article className="mx-auto max-w-2xl px-5 pt-6">
        {post.isDemo ? (
          <p className="mb-6 flex items-start gap-2 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-muted">
            <DemoBadge className="mt-0.5" />
            {post.publisher.name} is a fictional demo publisher, so this article is hosted on Tidbit. For real publishers, “Read full story” opens their website.
          </p>
        ) : null}
        <Link to={`/p/${post.publisher.handle}`} className="flex items-center gap-2 text-sm font-semibold">
          <PublisherLogo text={post.publisher.logoText} color={post.publisher.logoColor} size={28} className="rounded-lg" />
          {post.publisher.name} {post.publisher.verified ? <Verified /> : null}
        </Link>
        <p className="mt-4 text-sm font-semibold text-accent-text">{post.category.name} · {CLAIM_LABEL[post.claimType].label}</p>
        <h1 className="mt-2 font-display text-[32px] leading-tight font-extrabold text-balance">{post.headline}</h1>
        <p className="mt-3 text-sm text-muted">
          {[placeLabel(post), new Date(post.publishedAt).toLocaleString([], { dateStyle: "long", timeStyle: "short" })].filter(Boolean).join(" · ")}
          {post.updatedAt !== post.publishedAt ? ` · Updated ${new Date(post.updatedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}` : ""}
        </p>
        {post.correctionNotice ? <p className="mt-4 rounded-xl bg-amber-400/15 px-4 py-3 text-sm"><b>Correction:</b> {post.correctionNotice}</p> : null}

        <div className="mt-6 space-y-5 text-[18px] leading-[1.7]">
          <p className="font-medium">{post.summary}</p>
          {m.scenes?.map((s, i) => <p key={i}>{s.stat ? <b>{s.stat}. </b> : null}{s.text}</p>)}
          {m.slides?.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-xl font-bold">{s.title}</h2>
              <p className="mt-1">{s.body}</p>
            </section>
          ))}
          {m.updates ? (
            <section>
              <h2 className="font-display text-xl font-bold">Updates</h2>
              <ul className="mt-2 space-y-2">
                {[...m.updates].sort((a, b) => b.minutesAgo - a.minutesAgo).map((u) => (
                  <li key={u.text}>{u.text} {!u.confirmed ? <em className="text-coral-text">(unconfirmed)</em> : null}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {m.chart ? (
            <section>
              <h2 className="font-display text-xl font-bold">{m.chart.title}</h2>
              <table className="mt-3 w-full text-base">
                <tbody>
                  {m.chart.points.map((p) => (
                    <tr key={p.label} className="border-b border-line"><td className="py-2">{p.label}</td><td className="py-2 text-right font-semibold tabular-nums">{m.chart!.unit === "$" ? `$${p.value.toLocaleString()}` : `${p.value}${m.chart!.unit === "%" ? "%" : m.chart!.unit ? ` ${m.chart!.unit}` : ""}`}</td></tr>
                  ))}
                </tbody>
              </table>
              {m.chart.note ? <p className="mt-2 text-sm text-muted">{m.chart.note}</p> : null}
            </section>
          ) : null}
          {m.keyPoints ? <ul className="list-disc space-y-1 pl-6">{m.keyPoints.map((k) => <li key={k}>{k}</li>)}</ul> : null}
        </div>

        <footer className="mt-10 border-t border-line pt-5 text-sm text-muted">
          <p className="font-semibold text-fg">Sources</p>
          <ul className="mt-1 space-y-1">{post.sources.map((s) => <li key={s}>{s}</li>)}</ul>
          <Link to={`/post/${post.id}`} className="mt-5 inline-block font-semibold text-accent-text">← Back to the Tidbit story, comments and related coverage</Link>
        </footer>
      </article>
    </div>
  );
}
