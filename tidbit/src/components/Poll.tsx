import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Share2 } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { api, errorMessage } from "../lib/api";
import { useRequireAuth } from "../lib/session";
import { patchPosts, postUrl } from "../lib/actions";
import type { Poll } from "../../shared/types";
import { Button, Spinner } from "./ui";

export function PollCard({ pollId, dark, compact }: { pollId: number; dark?: boolean; compact?: boolean }) {
  const qc = useQueryClient();
  const requireAuth = useRequireAuth();
  const { data: poll, isLoading, error } = useQuery({ queryKey: ["poll", pollId], queryFn: () => api.get<Poll>(`/polls/${pollId}`) });
  const [picked, setPicked] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return <div className="flex justify-center py-6"><Spinner /></div>;
  if (error || !poll) return <p className="py-4 text-sm opacity-70">This poll couldn't be loaded.</p>;

  const multi = poll.type === "multiple";
  const voted = poll.myVotes.length > 0;
  const toggle = (id: number) => setPicked((p) => (multi ? (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]) : [id]));

  async function submit() {
    if (!requireAuth("Sign up to vote in polls and see how others responded.")) return;
    setSubmitting(true);
    try {
      const updated = await api.post<Poll>(`/polls/${pollId}/vote`, { optionIds: picked });
      qc.setQueryData(["poll", pollId], updated);
      patchPosts(qc, (p) => p.poll?.id === pollId, (p) => ({ ...p, poll: p.poll ? { ...p.poll, voted: true } : null }));
      void qc.invalidateQueries({ queryKey: ["user-posts"] });
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  const sharePoll = async () => {
    const url = postUrl(poll.postId);
    try {
      const native = "share" in navigator;
      if (native) await navigator.share({ title: poll.question, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
      void api.post(`/posts/${poll.postId}/share`, { type: native ? "native" : "copy_link" }).catch(() => {});
    } catch {
      /* share cancelled */
    }
  };

  const muted = dark ? "text-white/65" : "text-muted";
  const optionBase = dark ? "border-white/20 bg-white/8 hover:bg-white/14" : "border-line bg-surface-2/60 hover:bg-surface-2";

  return (
    <div className={clsx("w-full", dark && "text-white")}>
      <p className={clsx("text-[11px] font-bold tracking-wider uppercase", dark ? "text-[#35D5B1]" : "text-accent-text")}>
        {poll.type === "scale" ? "Opinion scale" : multi ? "Poll · choose any" : "Poll"}
      </p>
      <h3 className={clsx("mt-1 font-display font-bold leading-snug", compact ? "text-lg" : "text-xl")}>{poll.question}</h3>
      {poll.context && !compact ? <p className={clsx("mt-1 text-sm", muted)}>{poll.context}</p> : null}

      {poll.showResults ? (
        <ul className="mt-4 space-y-2.5" aria-label="Poll results">
          {poll.options.map((o) => {
            const mine = poll.myVotes.includes(o.id);
            return (
              <li key={o.id} className={clsx("relative overflow-hidden rounded-xl border px-3.5 py-2.5", dark ? "border-white/15" : "border-line")}>
                <span
                  className={clsx("animate-grow-x absolute inset-y-0 left-0", mine ? "bg-[#35D5B1]/35" : dark ? "bg-white/15" : "bg-fg/10")}
                  style={{ width: `${o.pct}%` }}
                  aria-hidden
                />
                <span className="relative flex items-center justify-between gap-3 text-[15px]">
                  <span className="flex items-center gap-2 font-medium">
                    {mine ? <Check size={16} className="text-[#35D5B1]" aria-label="Your vote" /> : null}
                    {o.text}
                  </span>
                  <span className="font-semibold tabular-nums">{o.pct}%</span>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className={clsx("mt-4", poll.type === "scale" ? "flex gap-2" : "space-y-2")} role={multi ? "group" : "radiogroup"} aria-label={poll.question}>
          {poll.options.map((o) => {
            const on = picked.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                role={multi ? "checkbox" : "radio"}
                aria-checked={on}
                disabled={voted || poll.status === "closed"}
                onClick={() => toggle(o.id)}
                className={clsx(
                  "flex items-center gap-3 rounded-xl border text-left text-[15px] font-medium transition",
                  poll.type === "scale" ? "flex-1 flex-col justify-center px-1 py-3 text-center text-xs" : "w-full px-3.5 py-3",
                  on ? "border-[#35D5B1] bg-[#35D5B1]/15" : optionBase,
                )}
              >
                {poll.type !== "scale" ? (
                  <span className={clsx("flex h-5 w-5 shrink-0 items-center justify-center border-2", multi ? "rounded-md" : "rounded-full", on ? "border-[#35D5B1] bg-[#35D5B1]" : dark ? "border-white/40" : "border-line")}>
                    {on ? <Check size={13} className="text-navy" strokeWidth={3} /> : null}
                  </span>
                ) : null}
                <span>{poll.type === "scale" ? o.text.replace(" · ", "\n") : o.text}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className={clsx("text-xs", muted)}>
          {poll.showResults ? `${poll.totalVotes.toLocaleString()} responses · ` : ""}
          {poll.status === "closed" ? "Poll closed · " : ""}
          Voluntary, non-representative audience responses
        </p>
        {poll.showResults ? (
          <button onClick={sharePoll} className={clsx("inline-flex items-center gap-1.5 text-sm font-semibold", dark ? "text-white" : "text-fg")}>
            <Share2 size={15} /> Share poll
          </button>
        ) : (
          <Button size="sm" onClick={submit} disabled={picked.length === 0} loading={submitting}>
            Vote
          </Button>
        )}
      </div>
    </div>
  );
}
