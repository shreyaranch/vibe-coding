import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, FolderPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage } from "../lib/api";
import type { Post } from "../../shared/types";
import { PostListSkeleton, PostRow } from "../components/PostList";
import { Button, Chip, EmptyState, ErrorState, PageHeader, Sheet, inputClass } from "../components/ui";

interface SavedData {
  items: (Post & { collectionId: number | null })[];
  collections: { id: number; name: string; count: number }[];
  categories: { slug: string; name: string }[];
}

export default function Saved() {
  const qc = useQueryClient();
  const [collection, setCollection] = useState("all");
  const [category, setCategory] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["saved", collection, category],
    queryFn: () => api.get<SavedData>(`/me/saved?collection=${collection}&category=${category}`),
  });

  const create = async () => {
    try {
      await api.post("/me/collections", { name });
      setName("");
      setCreating(false);
      void qc.invalidateQueries({ queryKey: ["saved"] });
      toast.success("Collection created");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };
  const removeCollection = async (id: number) => {
    if (!window.confirm("Delete this collection? Saved stories stay in All saved.")) return;
    await api.del(`/me/collections/${id}`);
    setCollection("all");
    void qc.invalidateQueries({ queryKey: ["saved"] });
  };
  const move = async (post: Post, collectionId: number | null) => {
    try {
      await api.post(`/posts/${post.id}/bookmark`, { collectionId });
      void qc.invalidateQueries({ queryKey: ["saved"] });
      toast.success("Moved");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl pb-12">
      <PageHeader title="Saved" right={<Button size="sm" variant="secondary" onClick={() => setCreating(true)}><FolderPlus size={16} /> New collection</Button>} />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-4">
        <Chip active={collection === "all"} onClick={() => setCollection("all")}>All saved</Chip>
        {data?.collections.map((c) => (
          <Chip key={c.id} active={collection === String(c.id)} onClick={() => setCollection(String(c.id))}>{c.name} <span className="opacity-60">{c.count}</span></Chip>
        ))}
      </div>
      {data?.categories.length ? (
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto px-4">
          <select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)} className="h-9 rounded-full border border-line bg-surface px-3 text-sm">
            <option value="">All categories</option>
            {data.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          {collection !== "all" ? (
            <button onClick={() => removeCollection(Number(collection))} className="inline-flex items-center gap-1 text-sm text-muted hover:text-coral-text"><Trash2 size={14} /> Delete collection</button>
          ) : null}
        </div>
      ) : null}

      <div className="px-4">
        {isLoading ? <PostListSkeleton /> : error ? <ErrorState error={error} retry={() => refetch()} /> : data?.items.length ? (
          <div className="divide-y divide-line">
            {data.items.map((p) => (
              <div key={p.id}>
                <PostRow post={p} />
                {data.collections.length ? (
                  <div className="-mt-1 mb-3 flex items-center gap-2 pl-[94px] text-xs text-muted">
                    <span>Collection:</span>
                    <select aria-label="Move to collection" value={p.collectionId ?? ""} onChange={(e) => move(p, e.target.value ? Number(e.target.value) : null)} className="rounded-md border border-line bg-surface px-2 py-1">
                      <option value="">None</option>
                      {data.collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={<Bookmark />} title="Nothing saved here" body="Tap the bookmark on any story to save it. Long-press the bookmark in the feed to pick a collection." />
        )}
      </div>

      <Sheet open={creating} onOpenChange={setCreating} title="New collection">
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) void create(); }} className="flex gap-2">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Read this weekend" maxLength={40} autoFocus aria-label="Collection name" />
          <Button type="submit" disabled={!name.trim()}>Create</Button>
        </form>
      </Sheet>
    </div>
  );
}
