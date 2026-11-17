import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Lightbulb, Repeat2, Send } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage } from "../lib/api";
import { useMe, useSignUpPrompt } from "../lib/session";
import type { Post } from "../../shared/types";
import { PostRow } from "../components/PostList";
import { RepostSheet } from "../components/Sheets";
import { Button, EmptyState, Field, PageHeader, inputClass } from "../components/ui";

export default function Create() {
  const { me } = useMe();
  const { open } = useSignUpPrompt();
  const [mode, setMode] = useState<"menu" | "tip" | "share">("menu");

  if (!me) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Create" back={false} />
        <EmptyState icon={<Lightbulb />} title="Share stories and send tips" body="Sign up to repost stories to your followers or send a news tip to our editors."
          action={<Button onClick={() => open("Sign up to share stories and send tips.")}>Create an account</Button>} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl pb-12">
      <PageHeader title={mode === "tip" ? "Submit a news tip" : mode === "share" ? "Share a story" : "Create"} back={mode !== "menu"} />
      {mode === "menu" ? (
        <div className="space-y-3 px-4 pt-5">
          {me.accountType === "publisher" ? (
            <div className="rounded-2xl border border-accent/40 bg-accent/8 p-5">
              <p className="flex items-center gap-2 font-semibold"><BadgeCheck size={18} className="text-accent-text" /> Publisher studio</p>
              <p className="mt-1 text-sm text-muted">
                You manage {me.publisherHandle ? <Link className="font-semibold text-accent-text" to={`/p/${me.publisherHandle}`}>a verified publisher</Link> : "a publisher"}.
                The publishing studio (uploads, scheduling, polls, analytics and corrections) is Phase 2 and isn't in this build yet.
              </p>
            </div>
          ) : null}
          <Option icon={<Repeat2 />} title="Share a Tidbit story" body="Repost a story to your followers, with your own take. The original publisher is always credited." onClick={() => setMode("share")} />
          <Option icon={<Lightbulb />} title="Submit a news tip" body="Seen something worth reporting? Send it to Tidbit's editors. Tips are reviewed by people, not published automatically." onClick={() => setMode("tip")} />
          <p className="px-1 pt-2 text-xs text-muted">Readers can't publish as news organizations. Publisher accounts are verified by Tidbit moderators.</p>
        </div>
      ) : mode === "tip" ? <TipForm onDone={() => setMode("menu")} /> : <ShareStory />}
    </div>
  );
}

function Option({ icon, title, body, onClick }: { icon: React.ReactNode; title: string; body: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full gap-4 rounded-2xl border border-line bg-surface p-4 text-left transition hover:bg-surface-2">
      <span className="h-fit rounded-xl bg-accent/12 p-3 text-accent-text">{icon}</span>
      <span><span className="block font-semibold">{title}</span><span className="text-sm text-muted">{body}</span></span>
    </button>
  );
}

function TipForm({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/tips", { text, link: link.trim(), location });
      toast.success("Thanks! Your tip was sent to our editors.");
      onDone();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="flex flex-col gap-4 px-5 pt-5">
      <Field label="What's happening?" hint={`${text.length}/2000 · Don't include anyone's private information.`}>
        <textarea className={`${inputClass} h-36 py-3`} value={text} onChange={(e) => setText(e.target.value.slice(0, 2000))} required minLength={10} />
      </Field>
      <Field label="Link (optional)"><input className={inputClass} type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" /></Field>
      <Field label="Where (optional)"><input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or region" maxLength={100} /></Field>
      <Button type="submit" size="lg" loading={busy} disabled={text.trim().length < 10}><Send size={18} /> Send tip</Button>
    </form>
  );
}

function ShareStory() {
  const [post, setPost] = useState<Post | null>(null);
  const saved = useQuery({ queryKey: ["saved", "all", ""], queryFn: () => api.get<{ items: Post[] }>("/me/saved?collection=all") });
  const trending = useQuery({ queryKey: ["feed-trending-lite"], queryFn: () => api.get<{ items: Post[] }>("/feed?tab=trending&limit=8") });
  const list = [...(saved.data?.items ?? []), ...(trending.data?.items ?? [])].filter((p, i, a) => a.findIndex((x) => x.id === p.id) === i);
  return (
    <div className="px-4 pt-3">
      <p className="text-sm text-muted">Pick a story from your saved list or what's trending.</p>
      <div className="divide-y divide-line">
        {list.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <div className="min-w-0 flex-1"><PostRow post={p} showActions={false} /></div>
            <Button size="sm" variant={p.viewer.reposted ? "outline" : "primary"} onClick={() => setPost(p)}>{p.viewer.reposted ? "Reposted" : "Repost"}</Button>
          </div>
        ))}
      </div>
      {post ? <RepostSheet post={post} open onOpenChange={(o) => { if (!o) { setPost(null); void saved.refetch(); void trending.refetch(); } }} /> : null}
    </div>
  );
}
