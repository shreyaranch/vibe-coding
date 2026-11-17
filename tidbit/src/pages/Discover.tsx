import { Link, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Sun } from "lucide-react";
import { api } from "../lib/api";
import { usePostActions } from "../lib/actions";
import { compact } from "../lib/format";
import type { Post } from "../../shared/types";
import { PostRow, PostTile } from "../components/PostList";
import { CategoryIcon } from "../components/CategoryIcon";
import { Button, DemoBadge, ErrorState, PublisherLogo, Spinner, Verified } from "../components/ui";

export interface PublisherCard {
  id: number; handle: string; name: string; logoText: string; logoColor: string; description: string; followers: number; postCount: number;
  following: boolean; verified: boolean; isDemo: boolean;
}

interface DiscoverData {
  trending: Post[];
  categories: { id: number; name: string; slug: string; icon: string; count: number }[];
  publishers: PublisherCard[];
  aroundTheWorld: { country: string; posts: Post[] }[];
  curious: Post[];
  deepDive: Post[];
  goodNews: Post[];
}

export default function Discover() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["discover"], queryFn: () => api.get<DiscoverData>("/discover") });

  return (
    <div className="mx-auto w-full max-w-3xl pb-10">
      <div className="sticky top-0 z-20 bg-bg/90 px-4 pt-4 pb-3 backdrop-blur">
        <h1 className="mb-3 font-display text-2xl font-extrabold">Discover</h1>
        <form onSubmit={(e) => { e.preventDefault(); const q = new FormData(e.currentTarget).get("q"); if (q) navigate(`/search?q=${encodeURIComponent(String(q))}`); }} role="search">
          <label className="relative block">
            <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-muted" size={20} />
            <input name="q" type="search" placeholder="Search news, topics, or publishers." aria-label="Search news, topics, or publishers"
              className="h-12 w-full rounded-full border border-line bg-surface pr-4 pl-12 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25" />
          </label>
        </form>
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Spinner /></div> : error ? <ErrorState error={error} retry={() => refetch()} /> : data ? (
        <div className="space-y-9">
          <Section title="Trending today" link={{ to: "/?tab=trending", label: "Open feed" }}>
            <Carousel posts={data.trending} />
          </Section>

          <Section title="Explore categories">
            <div className="grid grid-cols-2 gap-2.5 px-4 sm:grid-cols-4">
              {data.categories.map((c) => (
                <Link key={c.slug} to={`/topic/${c.slug}`} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 transition hover:bg-surface-2">
                  <span className="rounded-xl bg-accent/12 p-2 text-accent-text"><CategoryIcon name={c.icon} size={18} /></span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{c.name}</span>
                    <span className="text-xs text-muted">{c.count} {c.count === 1 ? "story" : "stories"}</span>
                  </span>
                </Link>
              ))}
            </div>
          </Section>

          {data.publishers.length ? (
            <Section title="Recommended publishers">
              <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
                {data.publishers.map((p) => <PublisherCardView key={p.id} p={p} />)}
              </div>
            </Section>
          ) : null}

          <Section title="Around the world">
            <div className="space-y-5">
              {data.aroundTheWorld.map((g) => (
                <div key={g.country}>
                  <p className="mb-2 px-4 text-sm font-bold text-muted">{g.country}</p>
                  <Carousel posts={g.posts} small />
                </div>
              ))}
            </div>
          </Section>

          <Section title="For the curious" subtitle="Explainers on how things work">
            <Carousel posts={data.curious} />
          </Section>

          <Section title="Deep dive" subtitle="Stories with coverage from several publishers">
            <div className="divide-y divide-line px-4">{data.deepDive.map((p) => <PostRow key={p.id} post={p} />)}</div>
          </Section>

          <Section title={<span className="inline-flex items-center gap-2"><Sun size={20} className="text-amber-400" /> Good news</span>} subtitle="Constructive reporting and positive developments">
            <Carousel posts={data.goodNews} small />
          </Section>
        </div>
      ) : null}
    </div>
  );
}

function Section({ title, subtitle, link, children }: { title: React.ReactNode; subtitle?: string; link?: { to: string; label: string }; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between px-4">
        <div>
          <h2 className="font-display text-xl font-extrabold">{title}</h2>
          {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
        </div>
        {link ? <Link to={link.to} className="text-sm font-semibold text-accent-text">{link.label}</Link> : null}
      </div>
      {children}
    </section>
  );
}

function Carousel({ posts, small }: { posts: Post[]; small?: boolean }) {
  return (
    <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto scroll-px-4 px-4 pb-1">
      {posts.map((p) => <PostTile key={p.id} post={p} className={small ? "w-36 shrink-0 snap-start" : "w-44 shrink-0 snap-start sm:w-52"} />)}
    </div>
  );
}

export function PublisherCardView({ p, wide }: { p: PublisherCard; wide?: boolean }) {
  const actions = usePostActions();
  return (
    <div className={wide ? "flex items-center gap-3 rounded-2xl border border-line bg-surface p-3" : "flex w-52 shrink-0 flex-col rounded-2xl border border-line bg-surface p-4"}>
      <Link to={`/p/${p.handle}`} className={wide ? "flex min-w-0 flex-1 items-center gap-3" : "block"}>
        <PublisherLogo text={p.logoText} color={p.logoColor} size={wide ? 44 : 48} />
        <div className={wide ? "min-w-0" : "mt-3"}>
          <p className="flex items-center gap-1 font-semibold">{p.name} {p.verified ? <Verified /> : null}</p>
          <p className="text-xs text-muted">{compact(p.followers)} followers {p.isDemo ? <DemoBadge className="ml-1" /> : null}</p>
          {!wide ? <p className="mt-2 line-clamp-2 text-sm text-muted">{p.description}</p> : null}
        </div>
      </Link>
      <Button size="sm" variant={p.following ? "outline" : "primary"} className={wide ? "" : "mt-3 w-full"} aria-pressed={p.following}
        onClick={() => actions.followPublisher({ id: p.id, handle: p.handle, name: p.name, logoText: p.logoText, logoColor: p.logoColor, verified: p.verified, isDemo: p.isDemo, following: p.following })}>
        {p.following ? "Following" : "Follow"}
      </Button>
    </div>
  );
}
