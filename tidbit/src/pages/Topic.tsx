import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";
import { useMe } from "../lib/session";
import type { Category, Post } from "../../shared/types";
import { CategoryIcon } from "../components/CategoryIcon";
import { PostListSkeleton, PostRow } from "../components/PostList";
import { Chip, EmptyState, ErrorState, PageHeader } from "../components/ui";

export default function Topic() {
  const { slug = "" } = useParams();
  const { me } = useMe();
  const [filter, setFilter] = useState<"all" | "video" | "explainer" | "quick_read" | "infographic">("all");
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["topic", slug], queryFn: () => api.get<{ category: Category; posts: Post[] }>(`/topics/${slug}`) });
  const posts = data?.posts.filter((p) => filter === "all" || p.contentType === filter || (filter === "quick_read" && p.contentType === "breaking")) ?? [];
  const following = data && me?.interests.includes(data.category.id);

  return (
    <div className="mx-auto w-full max-w-3xl pb-10">
      <PageHeader title={data?.category.name ?? "Topic"} />
      {isLoading ? <div className="px-4"><PostListSkeleton /></div> : error ? <ErrorState error={error} retry={() => refetch()} /> : data ? (
        <>
          <div className="flex items-center gap-4 px-4 pt-5">
            <span className="rounded-2xl bg-accent/12 p-3.5 text-accent-text"><CategoryIcon name={data.category.icon} size={28} /></span>
            <div>
              <h1 className="font-display text-2xl font-extrabold">{data.category.name}</h1>
              <p className="text-muted">{data.category.description}</p>
              {following ? <p className="mt-1 text-xs font-semibold text-accent-text">One of your interests</p> : null}
            </div>
          </div>
          <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto px-4">
            {([["all", "All"], ["video", "Motion"], ["quick_read", "Quick reads"], ["explainer", "Explainers"], ["infographic", "Data"]] as const).map(([id, label]) => (
              <Chip key={id} active={filter === id} onClick={() => setFilter(id)}>{label}</Chip>
            ))}
          </div>
          <div className="divide-y divide-line px-4">
            {posts.length ? posts.map((p) => <PostRow key={p.id} post={p} />) : <EmptyState title="No stories yet" body="Nothing in this format for this topic right now." />}
          </div>
        </>
      ) : null}
    </div>
  );
}
