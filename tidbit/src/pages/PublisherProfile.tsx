import { useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Globe, Mail, MapPin } from "lucide-react";
import { api } from "../lib/api";
import { usePostActions } from "../lib/actions";
import { compact } from "../lib/format";
import type { Post } from "../../shared/types";
import { PostListSkeleton, PostRow, PostTile } from "../components/PostList";
import { Button, Chip, DemoBadge, EmptyState, ErrorState, PageHeader, PublisherLogo, Spinner, Verified } from "../components/ui";

interface Publisher {
  id: number; handle: string; name: string; logoText: string; logoColor: string; description: string; website: string; location: string;
  verificationStatus: string; verificationDate: string | null; editorialContact: string; ownership: string; correctionPolicyUrl: string;
  followers: number; postCount: number; following: boolean; verified: boolean; isDemo: boolean;
}

type Tab = "latest" | "videos" | "articles" | "popular" | "polls" | "about";

export default function PublisherProfile() {
  const { handle = "" } = useParams();
  const actions = usePostActions();
  const [tab, setTab] = useState<Tab>("latest");
  const pub = useQuery({ queryKey: ["publisher", handle], queryFn: () => api.get<Publisher>(`/publishers/${handle}`) });
  const posts = useQuery({ queryKey: ["publisher-posts", handle, tab], queryFn: () => api.get<Post[]>(`/publishers/${handle}/posts?tab=${tab}`), enabled: tab !== "about" });

  if (pub.isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (pub.error || !pub.data) return <><PageHeader title="Publisher" /><ErrorState error={pub.error} retry={() => pub.refetch()} /></>;
  const p = pub.data;
  const lite = { id: p.id, handle: p.handle, name: p.name, logoText: p.logoText, logoColor: p.logoColor, verified: p.verified, isDemo: p.isDemo, following: p.following };

  return (
    <div className="mx-auto w-full max-w-3xl pb-12">
      <PageHeader title={p.name} />
      <div className="relative h-28 overflow-hidden" style={{ background: `linear-gradient(120deg, ${p.logoColor}55, transparent 70%)` }} aria-hidden />
      <div className="-mt-12 px-5">
        <PublisherLogo text={p.logoText} color={p.logoColor} size={88} className="rounded-3xl border-4 border-bg" />
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold">{p.name} {p.verified ? <Verified className="h-5 w-5" /> : null}</h1>
            <p className="flex items-center gap-2 text-sm text-muted">
              @{p.handle} · {p.verified ? "Verified news publisher" : "Unverified"} {p.isDemo ? <DemoBadge /> : null}
            </p>
          </div>
          <Button variant={p.following ? "outline" : "primary"} onClick={async () => { await actions.followPublisher(lite); void pub.refetch(); }} aria-pressed={p.following}>
            {p.following ? "Following" : "Follow"}
          </Button>
        </div>
        <p className="mt-3 text-[15px]">{p.description}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1"><MapPin size={14} />{p.location}</span>
          <span className="inline-flex items-center gap-1"><Globe size={14} />{p.website.replace(/^https?:\/\//, "")}</span>
        </div>
        <div className="mt-4 flex gap-6 text-sm">
          <span><b className="text-base">{compact(p.followers)}</b> <span className="text-muted">followers</span></span>
          <span><b className="text-base">{p.postCount}</b> <span className="text-muted">posts</span></span>
        </div>
      </div>

      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto border-b border-line px-4 pb-3">
        {(["latest", "videos", "articles", "popular", "polls", "about"] as Tab[]).map((t) => (
          <Chip key={t} active={tab === t} onClick={() => setTab(t)}>{t === "videos" ? "Motion" : t[0].toUpperCase() + t.slice(1)}</Chip>
        ))}
      </div>

      {tab === "about" ? (
        <dl className="mx-4 mt-4 divide-y divide-line rounded-2xl border border-line bg-surface text-sm">
          {[
            ["Registered name", p.name],
            ["Website", p.website],
            ["Location", p.location],
            ["Ownership", p.ownership || "Not provided"],
            ["Editorial contact", <span key="c" className="inline-flex items-center gap-1"><Mail size={14} />{p.editorialContact}</span>],
            ["Verification", <span key="v" className="inline-flex items-center gap-1">{p.verified ? <BadgeCheck size={15} className="text-accent-text" /> : null}{p.verified ? "Verified by Tidbit moderators" : p.verificationStatus}</span>],
            ["Verified on", p.verificationDate ? new Date(p.verificationDate).toLocaleDateString(undefined, { dateStyle: "long" }) : "—"],
            ["Correction policy", p.correctionPolicyUrl],
          ].map(([k, v]) => (
            <div key={String(k)} className="grid grid-cols-[130px_1fr] gap-3 px-4 py-3"><dt className="text-muted">{k}</dt><dd className="min-w-0 break-words">{v}</dd></div>
          ))}
          {p.isDemo ? <p className="px-4 py-3 text-xs text-muted">This is a fictional demo publisher. Its website and contact addresses use reserved example domains and don't go anywhere.</p> : null}
        </dl>
      ) : posts.isLoading ? <div className="px-4"><PostListSkeleton /></div> : posts.data?.length ? (
        tab === "latest" || tab === "popular" || tab === "videos" ? (
          <div className="grid grid-cols-2 gap-2 px-4 pt-4 sm:grid-cols-3">
            {posts.data.map((post) => <PostTile key={post.id} post={post} meta={tab === "popular" ? `${compact(post.counts.likes)} likes` : undefined} />)}
          </div>
        ) : (
          <div className="divide-y divide-line px-4">{posts.data.map((post) => <PostRow key={post.id} post={post} />)}</div>
        )
      ) : (
        <EmptyState title="Nothing here yet" body="This publisher hasn't posted anything in this format." />
      )}
    </div>
  );
}
