import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, X } from "lucide-react";
import { api } from "../lib/api";
import type { Post } from "../../shared/types";
import { PostListSkeleton, PostRow } from "../components/PostList";
import { Avatar, Chip, EmptyState, ErrorState, PageHeader } from "../components/ui";
import { PublisherCardView, type PublisherCard } from "./Discover";

interface Results {
  posts: Post[];
  publishers: PublisherCard[];
  people: { username: string; displayName: string; profilePhoto: string | null; bio: string }[];
  topics: { name: string; slug: string }[];
}

const SORTS = [["relevant", "Most relevant"], ["latest", "Latest"], ["popular", "Most popular"]] as const;
const TYPES = [["all", "All"], ["videos", "Videos"], ["articles", "Articles"], ["publishers", "Publishers"], ["people", "People"]] as const;
const DATES = [["any", "Any time"], ["24h", "Past 24 hours"], ["7d", "Past week"], ["30d", "Past month"]] as const;
const REGIONS = ["", "Canada", "United States", "United Kingdom", "India", "Global"];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const sort = params.get("sort") ?? "relevant";
  const type = params.get("type") ?? "all";
  const from = params.get("from") ?? "any";
  const region = params.get("region") ?? "";
  const [input, setInput] = useState(q);
  useEffect(() => setInput(q), [q]);

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v && !(k === "sort" && v === "relevant") && !(k === "type" && v === "all") && !(k === "from" && v === "any")) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["search", q, sort, type, from, region],
    queryFn: () => api.get<Results>(`/search?${new URLSearchParams({ q, sort, type, from, region })}`),
    enabled: q.trim().length > 0,
  });
  const nothing = data && !data.posts.length && !data.publishers.length && !data.people.length && !data.topics.length;

  return (
    <div className="mx-auto w-full max-w-3xl pb-10">
      <PageHeader title="Search" />
      <div className="px-4 pt-3">
        <form onSubmit={(e) => { e.preventDefault(); set("q", input.trim()); }} role="search">
          <label className="relative block">
            <SearchIcon className="absolute top-1/2 left-4 -translate-y-1/2 text-muted" size={20} />
            <input autoFocus={!q} value={input} onChange={(e) => setInput(e.target.value)} type="search" placeholder="Search news, topics, or publishers." aria-label="Search"
              className="h-12 w-full rounded-full border border-line bg-surface pr-10 pl-12 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25" />
            {input ? <button type="button" onClick={() => { setInput(""); set("q", ""); }} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-muted" aria-label="Clear"><X size={18} /></button> : null}
          </label>
        </form>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {TYPES.map(([id, label]) => <Chip key={id} active={type === id} onClick={() => set("type", id)}>{label}</Chip>)}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <select aria-label="Sort" value={sort} onChange={(e) => set("sort", e.target.value)} className="h-9 rounded-full border border-line bg-surface px-3">
            {SORTS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
          <select aria-label="Date range" value={from} onChange={(e) => set("from", e.target.value)} className="h-9 rounded-full border border-line bg-surface px-3">
            {DATES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
          <select aria-label="Country or region" value={region} onChange={(e) => set("region", e.target.value)} className="h-9 rounded-full border border-line bg-surface px-3">
            {REGIONS.map((r) => <option key={r} value={r}>{r || "Anywhere"}</option>)}
          </select>
        </div>
      </div>

      <div className="px-4">
        {!q ? (
          <EmptyState icon={<SearchIcon />} title="Search Tidbit" body="Try a topic like “transit”, a place like “Cedarbrook”, a publisher, or a hashtag like #explainer." />
        ) : isLoading ? <PostListSkeleton /> : error ? <ErrorState error={error} retry={() => refetch()} /> : nothing ? (
          <EmptyState icon={<SearchIcon />} title={`No results for “${q}”`} body="Try fewer words, a broader topic, or remove filters." />
        ) : data ? (
          <div className="mt-4 space-y-6">
            {data.topics.length ? (
              <div className="flex flex-wrap gap-2">
                {data.topics.map((t) => <Link key={t.slug} to={`/topic/${t.slug}`} className="rounded-full bg-accent/12 px-3.5 py-1.5 text-sm font-semibold text-accent-text">Topic: {t.name}</Link>)}
              </div>
            ) : null}
            {data.publishers.length ? (
              <section>
                <h2 className="mb-2 text-sm font-bold text-muted uppercase">Publishers</h2>
                <div className="space-y-2">{data.publishers.map((p) => <PublisherCardView key={p.id} p={p} wide />)}</div>
              </section>
            ) : null}
            {data.people.length ? (
              <section>
                <h2 className="mb-2 text-sm font-bold text-muted uppercase">People</h2>
                <div className="space-y-1">
                  {data.people.map((u) => (
                    <Link key={u.username} to={`/u/${u.username}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2">
                      <Avatar name={u.displayName} src={u.profilePhoto} size={40} />
                      <span className="min-w-0"><span className="block font-semibold">{u.displayName}</span><span className="block truncate text-sm text-muted">@{u.username} · {u.bio}</span></span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
            {data.posts.length ? (
              <section>
                <h2 className="mb-1 text-sm font-bold text-muted uppercase">Stories · {data.posts.length}</h2>
                <div className="divide-y divide-line">{data.posts.map((p) => <PostRow key={p.id} post={p} />)}</div>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
