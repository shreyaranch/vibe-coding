import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban, Copy, EyeOff, Flag, Heart, Info, Link2, Mail, MessageCircle, Minus, Plus, Repeat2, Send, Share, ThumbsDown, Trash2, X as XIcon,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { api, errorMessage } from "../lib/api";
import { useMe, useRequireAuth, useSignUpPrompt } from "../lib/session";
import { patchPosts, postUrl, usePostActions } from "../lib/actions";
import { timeAgo } from "../lib/format";
import type { CommentItem, Post } from "../../shared/types";
import { Avatar, Button, Chip, Sheet, Spinner, Verified, inputClass } from "./ui";
import { PollCard } from "./Poll";

// ---------- Comments ----------

export function CommentsSheet({ post, open, onOpenChange }: { post: Post; open: boolean; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient();
  const { me } = useMe();
  const requireAuth = useRequireAuth();
  const [sort, setSort] = useState<"top" | "newest">("top");
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<CommentItem | null>(null);
  const [reporting, setReporting] = useState<CommentItem | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const key = ["comments", post.id, sort];
  const { data, isLoading, error, refetch } = useQuery({ queryKey: key, queryFn: () => api.get<CommentItem[]>(`/posts/${post.id}/comments?sort=${sort}`), enabled: open });

  const send = useMutation({
    mutationFn: () => api.post(`/posts/${post.id}/comments`, { text, parentId: replyTo?.id ?? null }),
    onSuccess: () => {
      setText("");
      setReplyTo(null);
      void qc.invalidateQueries({ queryKey: ["comments", post.id] });
      patchPosts(qc, (p) => p.id === post.id, (p) => ({ ...p, counts: { ...p.counts, comments: p.counts.comments + 1 } }));
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const likeComment = async (c: CommentItem) => {
    if (!requireAuth("Sign up to like comments.")) return;
    const liked = !c.likedByMe;
    const flip = (list?: CommentItem[]): CommentItem[] | undefined =>
      list?.map((x) => (x.id === c.id ? { ...x, likedByMe: liked, likes: x.likes + (liked ? 1 : -1) } : { ...x, replies: flip(x.replies) ?? [] }));
    qc.setQueryData<CommentItem[]>(key, flip);
    try {
      await (liked ? api.post(`/comments/${c.id}/like`) : api.del(`/comments/${c.id}/like`));
    } catch (e) {
      toast.error(errorMessage(e));
      void refetch();
    }
  };

  const remove = async (c: CommentItem) => {
    if (!window.confirm("Delete this comment? This can't be undone.")) return;
    try {
      await api.del(`/comments/${c.id}`);
      void qc.invalidateQueries({ queryKey: ["comments", post.id] });
      patchPosts(qc, (p) => p.id === post.id, (p) => ({ ...p, counts: { ...p.counts, comments: Math.max(0, p.counts.comments - 1) } }));
      toast.success("Comment deleted");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const renderComment = (c: CommentItem, isReply = false) => (
    <li key={c.id} className={clsx("flex gap-3", isReply ? "mt-3" : "py-3")}>
      {c.removed ? (
        <p className="text-sm text-muted italic">This comment was deleted.</p>
      ) : (
        <>
          <Link to={`/u/${c.author.username}`} onClick={() => onOpenChange(false)}>
            <Avatar name={c.author.displayName} src={c.author.profilePhoto} size={isReply ? 28 : 36} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-x-1.5 text-sm">
              <Link to={`/u/${c.author.username}`} onClick={() => onOpenChange(false)} className="font-semibold hover:underline">{c.author.displayName}</Link>
              {c.author.publisherName ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-accent/15 px-1.5 text-xs font-semibold text-accent-text">
                  <Verified className="h-3 w-3" /> {c.author.publisherName}
                </span>
              ) : null}
              <span className="text-muted">· {timeAgo(c.createdAt)}</span>
            </p>
            <p className="mt-0.5 text-[15px] leading-snug break-words whitespace-pre-wrap">{c.text}</p>
            <div className="mt-1.5 flex items-center gap-4 text-xs font-semibold text-muted">
              <button onClick={() => likeComment(c)} className={clsx("inline-flex items-center gap-1 hover:text-fg", c.likedByMe && "text-coral-text")} aria-pressed={c.likedByMe} aria-label={`Like comment (${c.likes})`}>
                <Heart size={14} fill={c.likedByMe ? "currentColor" : "none"} /> {c.likes || ""}
              </button>
              <button onClick={() => { if (requireAuth("Sign up to join the conversation.")) { setReplyTo(c); inputRef.current?.focus(); } }} className="hover:text-fg">Reply</button>
              {c.isMine ? (
                <button onClick={() => remove(c)} className="inline-flex items-center gap-1 hover:text-coral-text"><Trash2 size={13} /> Delete</button>
              ) : (
                <button onClick={() => { if (requireAuth("Sign up to report comments.")) setReporting(c); }} className="inline-flex items-center gap-1 hover:text-fg"><Flag size={13} /> Report</button>
              )}
            </div>
            {c.replies.length ? <ul>{c.replies.map((r) => renderComment(r, true))}</ul> : null}
          </div>
        </>
      )}
    </li>
  );

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        title={`${post.counts.comments} comment${post.counts.comments === 1 ? "" : "s"}`}
        tall
        footer={
          me ? (
            <form
              onSubmit={(e) => { e.preventDefault(); if (text.trim()) send.mutate(); }}
              className="flex flex-col gap-2"
            >
              {replyTo ? (
                <div className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-1.5 text-xs">
                  <span>Replying to <b>{replyTo.author.displayName}</b></span>
                  <button type="button" onClick={() => setReplyTo(null)} aria-label="Cancel reply"><XIcon size={14} /></button>
                </div>
              ) : null}
              <div className="flex items-end gap-2">
                <Avatar name={me.displayName} src={me.profilePhoto} size={36} />
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 500))}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (text.trim()) send.mutate(); } }}
                  rows={1}
                  placeholder="Add a thoughtful comment…"
                  aria-label="Write a comment"
                  className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-line bg-surface-2 px-4 py-2.5 text-[15px] outline-none focus:border-accent"
                />
                <button type="submit" disabled={!text.trim() || send.isPending} aria-label="Post comment"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink transition hover:brightness-105 disabled:opacity-50">
                  {send.isPending ? <Spinner className="h-5 w-5 text-accent-ink" /> : <Send size={18} />}
                </button>
              </div>
            </form>
          ) : (
            <SignUpInline reason="Sign up to join the conversation." />
          )
        }
      >
        <div className="sticky top-0 z-10 -mx-5 flex gap-2 bg-surface px-5 pb-2">
          <Chip active={sort === "top"} onClick={() => setSort("top")}>Top</Chip>
          <Chip active={sort === "newest"} onClick={() => setSort("newest")}>Newest</Chip>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : error ? (
          <p className="py-8 text-center text-sm text-muted">Comments couldn't load. <button className="underline" onClick={() => refetch()}>Try again</button></p>
        ) : data && data.length ? (
          <ul className="divide-y divide-line">{data.map((c) => renderComment(c))}</ul>
        ) : (
          <div className="py-12 text-center">
            <MessageCircle className="mx-auto mb-2 text-muted" />
            <p className="font-semibold">No comments yet</p>
            <p className="text-sm text-muted">Start the conversation.</p>
          </div>
        )}
      </Sheet>
      {reporting ? <ReportSheet open onOpenChange={() => setReporting(null)} contentType="comment" contentId={reporting.id} /> : null}
    </>
  );
}

function SignUpInline({ reason }: { reason: string }) {
  const { open } = useSignUpPrompt();
  return (
    <button onClick={() => open(reason)} className="h-11 w-full rounded-2xl bg-surface-2 px-4 text-left text-[15px] text-muted">
      Sign up to comment…
    </button>
  );
}

// ---------- Share ----------

export function ShareSheet({ post, open, onOpenChange }: { post: Post; open: boolean; onOpenChange: (o: boolean) => void }) {
  const actions = usePostActions();
  const [reposting, setReposting] = useState(false);
  const url = postUrl(post.id);
  const enc = encodeURIComponent;
  const text = `${post.headline} (via ${post.publisher.name} on Tidbit)`;
  const targets = [
    { type: "x", label: "X", href: `https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}` },
    { type: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { type: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { type: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${enc(`${text} ${url}`)}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
      actions.recordShare(post, "copy_link");
    } catch {
      toast.error("Couldn't copy. Long-press the link to copy it instead.");
    }
  };
  const native = async () => {
    try {
      await navigator.share({ title: post.headline, text, url });
      actions.recordShare(post, "native");
    } catch {
      /* cancelled */
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange} title="Share this story" description={post.headline}>
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2.5">
          <Link2 size={16} className="shrink-0 text-muted" />
          <span className="min-w-0 flex-1 truncate text-sm select-all">{url}</span>
          <Button size="sm" onClick={copy}><Copy size={14} /> Copy</Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {"share" in navigator ? (
            <ShareTile icon={<Share size={20} />} label="More…" onClick={native} />
          ) : null}
          <ShareTile
            icon={<Repeat2 size={20} />}
            label={post.viewer.reposted ? "Reposted" : "Repost"}
            active={post.viewer.reposted}
            onClick={() => setReposting(true)}
          />
          {targets.map((t) => (
            <a
              key={t.type}
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => actions.recordShare(post, t.type)}
              className="flex flex-col items-center gap-1.5 rounded-xl p-2 text-xs font-medium hover:bg-surface-2"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-sm font-bold">{t.label.slice(0, 2)}</span>
              {t.label}
            </a>
          ))}
          <a
            href={`mailto:?subject=${enc(post.headline)}&body=${enc(`${text}\n\n${url}`)}`}
            onClick={() => actions.recordShare(post, "email")}
            className="flex flex-col items-center gap-1.5 rounded-xl p-2 text-xs font-medium hover:bg-surface-2"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2"><Mail size={20} /></span>
            Email
          </a>
        </div>
        <p className="mt-4 text-xs text-muted">Shared links always credit {post.publisher.name}.</p>
      </Sheet>
      {reposting ? <RepostSheet post={post} open onOpenChange={(o) => { setReposting(o); if (!o) onOpenChange(false); }} /> : null}
    </>
  );
}

function ShareTile({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 rounded-xl p-2 text-xs font-medium hover:bg-surface-2">
      <span className={clsx("flex h-12 w-12 items-center justify-center rounded-full", active ? "bg-accent text-accent-ink" : "bg-surface-2")}>{icon}</span>
      {label}
    </button>
  );
}

export function RepostSheet({ post, open, onOpenChange }: { post: Post; open: boolean; onOpenChange: (o: boolean) => void }) {
  const actions = usePostActions();
  const requireAuth = useRequireAuth();
  const [commentary, setCommentary] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open && !requireAuth("Sign up to repost stories to your followers.")) onOpenChange(false);
  }, [open, requireAuth, onOpenChange]);
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={post.viewer.reposted ? "Update your repost" : "Repost to your followers"}>
      <div className="rounded-xl border border-line p-3">
        <p className="text-xs text-muted">Original by <b className="text-fg">{post.publisher.name}</b></p>
        <p className="mt-1 font-semibold">{post.headline}</p>
      </div>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-semibold">Add your take (optional)</span>
        <textarea value={commentary} onChange={(e) => setCommentary(e.target.value.slice(0, 280))} rows={3} className={clsx(inputClass, "h-auto py-3")} placeholder="Why is this worth reading?" />
        <span className="mt-1 block text-right text-xs text-muted">{commentary.length}/280</span>
      </label>
      <div className="mt-2 flex gap-2">
        {post.viewer.reposted ? (
          <Button variant="outline" className="flex-1" onClick={async () => { await actions.undoRepost(post); onOpenChange(false); }}>Remove repost</Button>
        ) : null}
        <Button className="flex-1" loading={busy} onClick={async () => { setBusy(true); const ok = await actions.repost(post, commentary); setBusy(false); if (ok) onOpenChange(false); }}>
          <Repeat2 size={18} /> {post.viewer.reposted ? "Update" : "Repost"}
        </Button>
      </div>
    </Sheet>
  );
}

// ---------- Post options ----------

export function PostMenuSheet({ post, open, onOpenChange }: { post: Post; open: boolean; onOpenChange: (o: boolean) => void }) {
  const actions = usePostActions();
  const requireAuth = useRequireAuth();
  const [view, setView] = useState<"menu" | "why" | "report">("menu");
  useEffect(() => { if (open) setView("menu"); }, [open]);
  const run = async (type: Parameters<typeof actions.feedback>[1]) => {
    if (await actions.feedback(post, type)) onOpenChange(false);
  };
  const item = (icon: React.ReactNode, label: string, onClick: () => void, danger = false) => (
    <button onClick={onClick} className={clsx("flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-medium hover:bg-surface-2", danger && "text-coral-text")}>
      <span className="text-muted">{icon}</span>{label}
    </button>
  );

  if (view === "why") return <WhySheet post={post} open={open} onOpenChange={onOpenChange} />;
  if (view === "report") return <ReportSheet open={open} onOpenChange={onOpenChange} contentType="post" contentId={post.id} />;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Story options">
      <div className="-mx-2">
        {item(<ThumbsDown size={20} />, "Not interested", () => run("not_interested"))}
        {item(<Plus size={20} />, "Show me more like this", () => run("more_like_this"))}
        {item(<Minus size={20} />, `Show me less about ${post.category.name}`, () => run("less_topic"))}
        {item(<EyeOff size={20} />, `Hide ${post.publisher.name}`, () => run("hide_publisher"))}
        {item(<Info size={20} />, "Why am I seeing this?", () => setView("why"))}
        {item(<Flag size={20} />, "Report content", () => { if (requireAuth("Sign up to report content.")) setView("report"); }, true)}
      </div>
    </Sheet>
  );
}

export function WhySheet({ post, open, onOpenChange }: { post: Post; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { data, isLoading } = useQuery({ queryKey: ["why", post.id], queryFn: () => api.get<{ reasons: string[]; note: string }>(`/posts/${post.id}/why`), enabled: open });
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Why am I seeing this?">
      {isLoading ? <div className="flex justify-center py-6"><Spinner /></div> : (
        <>
          <ul className="space-y-2">
            {(post.reasons ?? data?.reasons ?? []).map((r) => (
              <li key={r} className="flex gap-3 rounded-xl bg-surface-2 px-3.5 py-3 text-[15px]"><Info size={18} className="mt-0.5 shrink-0 text-accent-text" />{r}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">{data?.note}</p>
          <p className="mt-2 text-sm text-muted">Change your topics, publishers and location any time in <Link to="/settings" className="font-semibold text-accent-text underline" onClick={() => onOpenChange(false)}>Settings</Link>.</p>
        </>
      )}
    </Sheet>
  );
}

const REPORT_REASONS = [
  ["misinformation", "Potential misinformation"],
  ["manipulated_media", "Misleading or manipulated media"],
  ["harassment", "Harassment"],
  ["hate_speech", "Hate speech"],
  ["spam", "Spam"],
  ["copyright", "Copyright concern"],
  ["impersonation", "Impersonation"],
  ["other", "Something else"],
] as const;

export function ReportSheet({ open, onOpenChange, contentType, contentId }: { open: boolean; onOpenChange: (o: boolean) => void; contentType: "post" | "comment" | "user"; contentId: number }) {
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await api.post("/reports", { contentType, contentId, reason, details });
      toast.success("Thanks. Our moderators will review this report.");
      onOpenChange(false);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={`Report this ${contentType}`} description="Reports are reviewed by people. Automated tools only help flag things."
      footer={<Button className="w-full" disabled={!reason} loading={busy} onClick={submit}>Submit report</Button>}>
      <div className="space-y-1" role="radiogroup" aria-label="Reason">
        {REPORT_REASONS.map(([id, label]) => (
          <button key={id} role="radio" aria-checked={reason === id} onClick={() => setReason(id)}
            className={clsx("flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-left text-[15px]", reason === id ? "border-accent bg-accent/10" : "border-transparent hover:bg-surface-2")}>
            {label}
            <span className={clsx("h-4 w-4 rounded-full border-2", reason === id ? "border-accent bg-accent" : "border-line")} />
          </button>
        ))}
      </div>
      <textarea value={details} onChange={(e) => setDetails(e.target.value.slice(0, 1000))} rows={3} placeholder="Add details (optional)" className={clsx(inputClass, "mt-3 h-auto py-3")} />
    </Sheet>
  );
}

// ---------- Poll ----------

export function PollSheet({ pollId, open, onOpenChange }: { pollId: number; open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Audience poll">
      <PollCard pollId={pollId} />
    </Sheet>
  );
}

// ---------- Save to collection ----------

export function SaveSheet({ post, open, onOpenChange }: { post: Post; open: boolean; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient();
  const actions = usePostActions();
  const [name, setName] = useState("");
  const { data } = useQuery({
    queryKey: ["saved", "collections"],
    queryFn: () => api.get<{ collections: { id: number; name: string; count: number }[] }>("/me/saved?collection=none"),
    enabled: open,
  });
  const create = async () => {
    try {
      const c = await api.post<{ id: number }>("/me/collections", { name });
      setName("");
      void qc.invalidateQueries({ queryKey: ["saved"] });
      actions.toggleSave(post, c.id);
      toast.success(`Saved to ${name}`);
      onOpenChange(false);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Save to a collection">
      <div className="-mx-2">
        <button className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-surface-2" onClick={() => { actions.toggleSave(post, null); toast.success("Saved"); onOpenChange(false); }}>
          All saved (no collection)
        </button>
        {data?.collections.map((c) => (
          <button key={c.id} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-surface-2" onClick={() => { actions.toggleSave(post, c.id); toast.success(`Saved to ${c.name}`); onOpenChange(false); }}>
            {c.name} <span className="text-sm text-muted">{c.count}</span>
          </button>
        ))}
      </div>
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (name.trim()) void create(); }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New collection name" className={inputClass} maxLength={40} aria-label="New collection name" />
        <Button type="submit" disabled={!name.trim()}>Create</Button>
      </form>
    </Sheet>
  );
}

// ---------- Sign-up prompt ----------

export function SignUpPromptSheet() {
  const { reason, close } = useSignUpPrompt();
  const navigate = useNavigate();
  return (
    <Sheet open={!!reason} onOpenChange={(o) => !o && close()} title="Join Tidbit" description={reason ?? undefined}>
      <ul className="mb-5 space-y-2 text-[15px]">
        {["A feed tuned to the topics and places you care about", "Like, comment, save and repost stories", "Vote in polls and follow publishers"].map((t) => (
          <li key={t} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{t}</li>
        ))}
      </ul>
      <div className="flex flex-col gap-2">
        <Button size="lg" onClick={() => { close(); navigate("/signup"); }}>Create a free account</Button>
        <Button size="lg" variant="ghost" onClick={() => { close(); navigate("/login"); }}>I already have an account</Button>
      </div>
    </Sheet>
  );
}

export function BlockButton({ userId, kind, active, onDone }: { userId: number; kind: "block" | "mute"; active: boolean; onDone: () => void }) {
  return (
    <button
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-medium hover:bg-surface-2"
      onClick={async () => {
        try {
          if (active) await api.del(`/users/${userId}/block?kind=${kind}`);
          else await api.post(`/users/${userId}/block`, { kind });
          toast.success(active ? `${kind === "block" ? "Unblocked" : "Unmuted"}` : `${kind === "block" ? "Blocked" : "Muted"}. You won't see their comments or reposts.`);
          onDone();
        } catch (e) {
          toast.error(errorMessage(e));
        }
      }}
    >
      <Ban size={20} className="text-muted" /> {active ? (kind === "block" ? "Unblock" : "Unmute") : kind === "block" ? "Block" : "Mute"}
    </button>
  );
}
