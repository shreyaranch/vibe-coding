import { useEffect } from "react";
import { Link } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AtSign, BarChart3, Bell, Heart, Megaphone, Newspaper, Repeat2, Settings, Sparkles, UserPlus } from "lucide-react";
import clsx from "clsx";
import { api } from "../lib/api";
import { timeAgo } from "../lib/format";
import { useMe, useSignUpPrompt } from "../lib/session";
import type { Me, NotificationItem } from "../../shared/types";
import { Button, EmptyState, ErrorState, PageHeader, Spinner } from "../components/ui";

const ICON: Record<string, React.ReactNode> = {
  breaking: <Megaphone size={18} className="text-coral-text" />,
  publisher_post: <Newspaper size={18} className="text-accent-text" />,
  comment_reply: <AtSign size={18} />,
  comment_like: <Heart size={18} className="text-coral-text" />,
  new_follower: <UserPlus size={18} />,
  repost: <Repeat2 size={18} />,
  poll_results: <BarChart3 size={18} />,
  welcome: <Sparkles size={18} className="text-accent-text" />,
};

export default function Inbox() {
  const { me } = useMe();
  const { open } = useSignUpPrompt();
  const qc = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["notifications"], queryFn: () => api.get<NotificationItem[]>("/notifications"), enabled: !!me });

  // Mark everything read once the inbox has been seen.
  useEffect(() => {
    if (!me || !data || !data.some((n) => !n.isRead)) return;
    const t = window.setTimeout(async () => {
      await api.post("/notifications/read").catch(() => {});
      qc.setQueryData<Me | null>(["me"], (m) => (m ? { ...m, unreadNotifications: 0 } : m));
    }, 1200);
    return () => window.clearTimeout(t);
  }, [data, me, qc]);

  if (!me) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Inbox" back={false} />
        <EmptyState icon={<Bell />} title="Your activity lives here" body="Sign up to get replies, new posts from publishers you follow and breaking-news alerts you choose."
          action={<Button onClick={() => open("Sign up to get notifications.")}>Create an account</Button>} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl pb-12">
      <PageHeader title="Inbox" back={false} right={<Link to="/settings#notifications" className="rounded-full p-2 hover:bg-surface-2" aria-label="Notification settings"><Settings size={22} /></Link>} />
      {isLoading ? <div className="flex justify-center py-16"><Spinner /></div> : error ? <ErrorState error={error} retry={() => refetch()} /> : data?.length ? (
        <ul className="divide-y divide-line">
          {data.map((n) => {
            const body = (
              <div className={clsx("flex gap-3 px-4 py-3.5 transition hover:bg-surface-2", !n.isRead && "bg-accent/6")}>
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2">{ICON[n.type] ?? <Bell size={18} />}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-snug">{n.text}</p>
                  <p className="mt-0.5 text-xs text-muted">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead ? <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Unread" /> : null}
              </div>
            );
            return (
              <li key={n.id}>
                {n.postId ? <Link to={`/post/${n.postId}`}>{body}</Link> : n.actorUsername ? <Link to={`/u/${n.actorUsername}`}>{body}</Link> : body}
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={<Bell />} title="You're all caught up" body="Replies, new followers and posts from publishers you follow will appear here." />
      )}
      <p className="px-4 pt-6 text-xs text-muted">This local version shows in-app notifications. Push and email delivery need a hosted service and come later.</p>
    </div>
  );
}
