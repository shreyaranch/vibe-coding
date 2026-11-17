import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { api, errorMessage } from "../lib/api";
import { timeAgo } from "../lib/format";
import { useMe } from "../lib/session";
import { Button, Chip, EmptyState, ErrorState, PageHeader, Spinner } from "../components/ui";

interface Report { id: number; content_type: string; content_id: number; reason: string; details: string; status: string; created_at: string; reporter: string; preview: string }
interface Tip { id: number; text: string; link: string; location: string; createdAt: string; username: string }

export default function Admin() {
  const { me } = useMe();
  const [tab, setTab] = useState<"reports" | "tips">("reports");
  const reports = useQuery({ queryKey: ["admin-reports"], queryFn: () => api.get<Report[]>("/admin/reports"), enabled: me?.accountType === "admin" });
  const tips = useQuery({ queryKey: ["admin-tips"], queryFn: () => api.get<Tip[]>("/admin/tips"), enabled: me?.accountType === "admin" && tab === "tips" });

  if (me?.accountType !== "admin") {
    return <><PageHeader title="Moderation" /><EmptyState icon={<Shield />} title="Moderators only" body="This area is limited to Tidbit moderators. Access is checked by the server, not just hidden here." /></>;
  }

  const act = async (id: number, action: "dismiss" | "remove") => {
    try {
      await api.post(`/admin/reports/${id}`, { action });
      toast.success(action === "remove" ? "Content removed and logged" : "Report dismissed");
      void reports.refetch();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl pb-12">
      <PageHeader title="Moderation" />
      <div className="flex gap-2 px-4 pt-4">
        <Chip active={tab === "reports"} onClick={() => setTab("reports")}>Reports {reports.data ? `· ${reports.data.filter((r) => r.status === "open").length} open` : ""}</Chip>
        <Chip active={tab === "tips"} onClick={() => setTab("tips")}>News tips</Chip>
      </div>
      <p className="px-4 pt-3 text-xs text-muted">Phase 1 queue. Every action is recorded in the moderation log. Publisher verification review, appeals and trending policy tools come in later phases.</p>
      {tab === "reports" ? (
        reports.isLoading ? <div className="flex justify-center py-16"><Spinner /></div> : reports.error ? <ErrorState error={reports.error} retry={() => reports.refetch()} /> : reports.data?.length ? (
          <ul className="mt-3 space-y-3 px-4">
            {reports.data.map((r) => (
              <li key={r.id} className={clsx("rounded-2xl border border-line bg-surface p-4", r.status !== "open" && "opacity-60")}>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md bg-coral/15 px-2 py-0.5 font-bold text-coral-text">{r.reason.replace(/_/g, " ")}</span>
                  <span className="rounded-md bg-surface-2 px-2 py-0.5 font-semibold">{r.content_type} #{r.content_id}</span>
                  <span className="text-muted">by @{r.reporter} · {timeAgo(r.created_at)}</span>
                  <span className="ml-auto font-semibold capitalize">{r.status}</span>
                </div>
                <p className="mt-2 font-medium">{r.preview}</p>
                {r.details ? <p className="mt-1 text-sm text-muted">“{r.details}”</p> : null}
                {r.status === "open" ? (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => act(r.id, "dismiss")}>Dismiss</Button>
                    {r.content_type !== "user" ? <Button size="sm" variant="danger" onClick={() => act(r.id, "remove")}>Remove {r.content_type}</Button> : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : <EmptyState icon={<Shield />} title="No reports" body="Reports from readers will appear here." />
      ) : tips.isLoading ? <div className="flex justify-center py-16"><Spinner /></div> : tips.data?.length ? (
        <ul className="mt-3 space-y-3 px-4">
          {tips.data.map((t) => (
            <li key={t.id} className="rounded-2xl border border-line bg-surface p-4 text-sm">
              <p className="text-xs text-muted">@{t.username} · {timeAgo(t.createdAt)}{t.location ? ` · ${t.location}` : ""}</p>
              <p className="mt-1 text-[15px] whitespace-pre-wrap">{t.text}</p>
              {t.link ? <a href={t.link} target="_blank" rel="noopener noreferrer nofollow" className="mt-1 block truncate text-accent-text">{t.link}</a> : null}
            </li>
          ))}
        </ul>
      ) : <EmptyState title="No tips yet" />}
    </div>
  );
}
