import { useState } from "react";
import { Link, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Globe, Lock, MapPin, MoreHorizontal, Settings } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage } from "../lib/api";
import { useRequireAuth } from "../lib/session";
import { compact } from "../lib/format";
import type { Post, UserProfile } from "../../shared/types";
import { PostListSkeleton, PostRow } from "../components/PostList";
import { BlockButton, ReportSheet } from "../components/Sheets";
import { Avatar, Button, Chip, DemoBadge, EmptyState, ErrorState, PageHeader, Sheet, Spinner } from "../components/ui";

type Tab = "reposts" | "likes" | "saved" | "polls";

export default function Profile() {
  const { username = "" } = useParams();
  const qc = useQueryClient();
  const requireAuth = useRequireAuth();
  const [tab, setTab] = useState<Tab>("reposts");
  const [menu, setMenu] = useState(false);
  const [report, setReport] = useState(false);
  const [connections, setConnections] = useState<"followers" | "following" | null>(null);
  const profile = useQuery({ queryKey: ["profile", username], queryFn: () => api.get<UserProfile>(`/users/${username}`) });
  const posts = useQuery({
    queryKey: ["user-posts", username, tab],
    queryFn: () => api.get<{ items: Post[]; hidden?: string }>(`/users/${username}/posts?tab=${tab}`),
    enabled: !!profile.data,
  });

  if (profile.isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (profile.error || !profile.data) return <><PageHeader title="Profile" /><ErrorState error={profile.error} retry={() => profile.refetch()} /></>;
  const p = profile.data;

  const follow = async () => {
    if (!requireAuth(`Sign up to follow ${p.displayName}.`)) return;
    const next = !p.iFollow;
    qc.setQueryData<UserProfile>(["profile", username], { ...p, iFollow: next, followers: p.followers + (next ? 1 : -1) });
    try {
      await (next ? api.post(`/follow/user/${p.id}`) : api.del(`/follow/user/${p.id}`));
      void qc.invalidateQueries({ queryKey: ["feed", "following"] });
    } catch (e) {
      toast.error(errorMessage(e));
      void profile.refetch();
    }
  };

  const tabs: { id: Tab; label: string; icon?: React.ReactNode }[] = [
    { id: "reposts", label: "Reposts" },
    { id: "likes", label: "Liked", icon: !p.isMe ? undefined : <Lock size={12} /> },
    ...(p.isMe ? [{ id: "saved" as Tab, label: "Saved", icon: <Lock size={12} /> }, { id: "polls" as Tab, label: "Polls", icon: <Lock size={12} /> }] : []),
  ];
  const hiddenMsg: Record<string, string> = {
    private: "This account is private. Follow them to see their activity.",
    reposts_private: "Reposts are hidden on this profile.",
    likes_private: "Likes are private on this profile.",
    owner_only: "Only the account owner can see this.",
  };

  return (
    <div className="mx-auto w-full max-w-3xl pb-12">
      <PageHeader
        title={`@${p.username}`}
        back={!p.isMe}
        right={p.isMe ? (
          <Link to="/settings" className="rounded-full p-2 hover:bg-surface-2" aria-label="Settings"><Settings size={22} /></Link>
        ) : (
          <button onClick={() => setMenu(true)} className="rounded-full p-2 hover:bg-surface-2" aria-label="More"><MoreHorizontal size={22} /></button>
        )}
      />
      <div className="flex flex-col items-center px-5 pt-6 text-center">
        <Avatar name={p.displayName} src={p.profilePhoto} size={96} />
        <h1 className="mt-3 flex items-center gap-2 font-display text-2xl font-extrabold">{p.displayName} {p.isDemo ? <DemoBadge className="text-muted" /> : null}</h1>
        <p className="text-muted">@{p.username}{p.isPrivate ? " · Private" : ""}</p>
        {p.publisherHandle ? <Link to={`/p/${p.publisherHandle}`} className="mt-1 text-sm font-semibold text-accent-text">Manages a verified publisher →</Link> : null}
        <div className="mt-4 flex gap-8">
          <button onClick={() => setConnections("following")} className="text-center"><b className="block text-lg">{compact(p.following)}</b><span className="text-sm text-muted">Following</span></button>
          <button onClick={() => setConnections("followers")} className="text-center"><b className="block text-lg">{compact(p.followers)}</b><span className="text-sm text-muted">Followers</span></button>
          <div className="text-center"><b className="block text-lg">{compact(p.likesReceived)}</b><span className="text-sm text-muted">Likes</span></div>
        </div>
        {p.bio ? <p className="mt-4 max-w-md text-[15px]">{p.bio}</p> : null}
        <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted">
          {p.location ? <span className="inline-flex items-center gap-1"><MapPin size={14} />{p.location}</span> : null}
          {p.website ? <a href={p.website} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-accent-text hover:underline"><Globe size={14} />{p.website.replace(/^https?:\/\//, "")}</a> : null}
        </div>
        {p.interests.length ? (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {p.interests.map((i) => <span key={i} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium">{i}</span>)}
          </div>
        ) : null}
        <div className="mt-5 flex gap-2">
          {p.isMe ? (
            <>
              <Link to="/profile/edit"><Button variant="secondary">Edit profile</Button></Link>
              <Link to="/saved"><Button variant="secondary"><Bookmark size={16} /> Saved & collections</Button></Link>
            </>
          ) : p.blocked ? (
            <Button variant="outline" disabled>Blocked</Button>
          ) : (
            <Button variant={p.iFollow ? "outline" : "primary"} onClick={follow} aria-pressed={p.iFollow}>{p.iFollow ? "Following" : "Follow"}</Button>
          )}
        </div>
      </div>

      <div className="no-scrollbar mt-7 flex gap-2 overflow-x-auto border-b border-line px-4 pb-3">
        {tabs.map((t) => <Chip key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>{t.icon}{t.label}</Chip>)}
      </div>
      {p.isMe && tab !== "reposts" ? <p className="px-4 pt-2 text-xs text-muted">{tab === "likes" ? "Your likes are private unless you make them public in Settings." : "Only you can see this tab."}</p> : null}

      <div className="px-4">
        {posts.isLoading ? <PostListSkeleton rows={3} /> : posts.data?.hidden ? (
          <EmptyState icon={<Lock />} title="Not visible" body={hiddenMsg[posts.data.hidden]} />
        ) : posts.data?.items.length ? (
          <div className="divide-y divide-line">{posts.data.items.map((post) => <PostRow key={`${post.id}-${tab}`} post={post} />)}</div>
        ) : (
          <EmptyState
            title={{ reposts: "No reposts yet", likes: "No liked stories yet", saved: "Nothing saved yet", polls: "No poll votes yet" }[tab]}
            body={p.isMe ? { reposts: "Repost a story from the share menu to recommend it to your followers.", likes: "Tap the heart on stories you like.", saved: "Tap the bookmark on any story to save it here.", polls: "Polls you vote in will show up here." }[tab] : undefined}
          />
        )}
      </div>

      {menu ? (
        <Sheet open onOpenChange={setMenu} title={p.displayName}>
          <div className="-mx-2">
            <BlockButton userId={p.id} kind="mute" active={p.muted} onDone={() => { setMenu(false); void profile.refetch(); }} />
            <BlockButton userId={p.id} kind="block" active={p.blocked} onDone={() => { setMenu(false); void profile.refetch(); }} />
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-medium text-coral-text hover:bg-surface-2"
              onClick={() => { setMenu(false); if (requireAuth("Sign up to report accounts.")) setReport(true); }}>Report account</button>
          </div>
        </Sheet>
      ) : null}
      {report ? <ReportSheet open onOpenChange={setReport} contentType="user" contentId={p.id} /> : null}
      {connections ? <ConnectionsSheet username={p.username} kind={connections} onClose={() => setConnections(null)} /> : null}
    </div>
  );
}

function ConnectionsSheet({ username, kind, onClose }: { username: string; kind: "followers" | "following"; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["connections", username, kind],
    queryFn: () => api.get<{ hidden: boolean; users: { username: string; displayName: string; profilePhoto: string | null }[]; publishers: { handle: string; name: string; logoText: string; logoColor: string }[] }>(`/users/${username}/connections?kind=${kind}`),
  });
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()} title={kind === "followers" ? "Followers" : "Following"}>
      {isLoading ? <div className="flex justify-center py-6"><Spinner /></div> : data?.hidden ? (
        <p className="py-6 text-center text-muted">This list is private.</p>
      ) : (
        <div className="-mx-2">
          {data?.publishers.map((p) => (
            <Link key={p.handle} to={`/p/${p.handle}`} onClick={onClose} className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold text-navy" style={{ background: p.logoColor }}>{p.logoText}</span>
              <span className="font-semibold">{p.name}</span><span className="text-xs text-muted">Publisher</span>
            </Link>
          ))}
          {data?.users.map((u) => (
            <Link key={u.username} to={`/u/${u.username}`} onClick={onClose} className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2">
              <Avatar name={u.displayName} src={u.profilePhoto} size={40} />
              <span><span className="block font-semibold">{u.displayName}</span><span className="text-sm text-muted">@{u.username}</span></span>
            </Link>
          ))}
          {!data?.users.length && !data?.publishers.length ? <p className="py-6 text-center text-muted">Nobody here yet.</p> : null}
        </div>
      )}
    </Sheet>
  );
}
