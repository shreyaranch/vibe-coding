import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Compass, MapPin, Radio, Search, Sparkles, UserPlus } from "lucide-react";
import clsx from "clsx";
import { api } from "../lib/api";
import { useMe, useSignUpPrompt } from "../lib/session";
import type { FeedTab, Post, TrendScope } from "../../shared/types";
import { FeedCard } from "../components/FeedCard";
import { Button, Spinner } from "../components/ui";

interface FeedPage {
  items: Post[];
  nextOffset: number | null;
  total: number;
  notice?: string;
}

const TABS: { id: FeedTab; label: string }[] = [
  { id: "foryou", label: "For You" },
  { id: "following", label: "Following" },
  { id: "trending", label: "Trending" },
  { id: "local", label: "Local" },
];

// Remember where the reader was in each feed, across navigation.
const positions = new Map<string, number>();

export default function Home() {
  const { me } = useMe();
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as FeedTab) || me?.feed.defaultTab || "foryou";
  const [scope, setScope] = useState<TrendScope>("global");
  const [explore, setExplore] = useState(false);
  const [visited, setVisited] = useState<Set<FeedTab>>(() => new Set([tab]));

  useEffect(() => setVisited((v) => (v.has(tab) ? v : new Set(v).add(tab))), [tab]);
  const switchTab = (t: FeedTab) => setParams(t === "foryou" ? {} : { tab: t }, { replace: true });

  return (
    <div className="relative h-full w-full bg-[#101827] md:flex md:justify-center">
      <div className="relative h-full w-full md:max-w-[480px] md:border-x md:border-white/10">
        <FeedHeader tab={tab} onTab={switchTab} scope={scope} onScope={setScope} explore={explore} onExplore={setExplore} />
        {TABS.filter((t) => visited.has(t.id)).map((t) => (
          <div key={t.id} className={clsx("absolute inset-0", t.id !== tab && "invisible")} aria-hidden={t.id !== tab}>
            <FeedList tab={t.id} scope={scope} explore={t.id === "foryou" && explore} visible={t.id === tab} onExplore={() => setExplore(true)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedHeader({ tab, onTab, scope, onScope, explore, onExplore }: {
  tab: FeedTab; onTab: (t: FeedTab) => void; scope: TrendScope; onScope: (s: TrendScope) => void; explore: boolean; onExplore: (e: boolean) => void;
}) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/60 to-transparent px-4 pt-3 pb-6 text-white">
      <div className="pointer-events-auto flex items-center justify-between md:hidden">
        <Link to="/" className="font-display text-xl font-extrabold tracking-tight" aria-label="Tidbit home">
          tidbit<span className="text-[#35D5B1]">.</span>
        </Link>
        <Link to="/search" className="rounded-full p-2 hover:bg-white/10" aria-label="Search"><Search size={22} /></Link>
      </div>
      <nav className="pointer-events-auto mt-1 flex justify-center gap-1" aria-label="Feeds">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            aria-current={t.id === tab ? "page" : undefined}
            className={clsx("relative px-2.5 py-2 text-[15px] font-semibold transition", t.id === tab ? "text-white" : "text-white/60 hover:text-white/85")}
          >
            {t.label}
            {t.id === tab ? <span className="absolute inset-x-3 -bottom-0.5 h-[3px] rounded-full bg-[#35D5B1]" /> : null}
          </button>
        ))}
      </nav>
      {tab === "trending" ? (
        <div className="pointer-events-auto mt-2 flex justify-center gap-1.5" role="radiogroup" aria-label="Trending area">
          {(["local", "national", "global"] as TrendScope[]).map((s) => (
            <button key={s} role="radio" aria-checked={scope === s} onClick={() => onScope(s)}
              className={clsx("rounded-full px-3 py-1 text-xs font-semibold capitalize", scope === s ? "bg-white text-[#101827]" : "bg-white/15 text-white")}>
              {s}
            </button>
          ))}
        </div>
      ) : null}
      {tab === "foryou" && explore ? (
        <div className="pointer-events-auto mt-2 flex justify-center">
          <button onClick={() => onExplore(false)} className="inline-flex items-center gap-1.5 rounded-full bg-[#35D5B1] px-3 py-1 text-xs font-bold text-[#062B23]">
            <Compass size={13} /> Exploring outside your bubble · Turn off
          </button>
        </div>
      ) : null}
    </header>
  );
}

function FeedList({ tab, scope, explore, visible, onExplore }: { tab: FeedTab; scope: TrendScope; explore: boolean; visible: boolean; onExplore: () => void }) {
  const { me } = useMe();
  const navigate = useNavigate();
  const { open: openSignUp } = useSignUpPrompt();
  const key = `${tab}:${tab === "trending" ? scope : ""}:${explore ? 1 : 0}:${me?.id ?? "guest"}`;
  const q = useInfiniteQuery({
    queryKey: ["feed", tab, tab === "trending" ? scope : null, explore, me?.id ?? null],
    queryFn: ({ pageParam }) =>
      api.get<FeedPage>(`/feed?tab=${tab}&offset=${pageParam}&limit=8${tab === "trending" ? `&scope=${scope}` : ""}${explore ? "&explore=1" : ""}`),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextOffset ?? undefined,
    staleTime: 5 * 60_000,
  });
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  const notice = q.data?.pages[0]?.notice;
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(() => positions.get(key) ?? 0);

  // Restore position after data arrives or the feed key changes.
  useEffect(() => {
    const el = scroller.current;
    const idx = positions.get(key) ?? 0;
    setActive(idx);
    if (el) el.scrollTo({ top: idx * el.clientHeight });
  }, [key, q.isSuccess]);

  // Track which card is in view.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollTop / Math.max(1, el.clientHeight));
      setActive(idx);
      positions.set(key, idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [key]);

  // Load more near the end.
  useEffect(() => {
    if (active >= items.length - 3 && q.hasNextPage && !q.isFetchingNextPage) void q.fetchNextPage();
  }, [active, items.length, q]);

  const goTo = useCallback((idx: number) => {
    const el = scroller.current;
    if (!el) return;
    const max = items.length; // includes the end card
    const n = Math.max(0, Math.min(max, idx));
    el.scrollTo({ top: n * el.clientHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [items.length]);

  // Keyboard navigation (ignored while typing or when a sheet is open).
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, [role=dialog], [contenteditable]") || document.querySelector("[role=dialog]")) return;
      if (["ArrowDown", "j", "PageDown"].includes(e.key)) { e.preventDefault(); goTo(active + 1); }
      if (["ArrowUp", "k", "PageUp"].includes(e.key)) { e.preventDefault(); goTo(active - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, active, goTo]);

  // Mouse wheel: one story per gesture, so a single flick doesn't skip several.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let lock = 0;
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const inner = (e.target as HTMLElement).closest("[data-inner-scroll]");
      if (inner && inner.scrollHeight > inner.clientHeight) return;
      e.preventDefault();
      if (Date.now() < lock) return;
      acc += e.deltaY;
      if (Math.abs(acc) > 30) {
        const cur = Math.round(el.scrollTop / el.clientHeight);
        goTo(cur + (acc > 0 ? 1 : -1));
        acc = 0;
        lock = Date.now() + 650;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [goTo]);

  if (q.isLoading) return <FeedSkeleton />;
  if (q.isError) {
    return (
      <Centered>
        <p className="font-display text-xl font-bold">Couldn't load your feed</p>
        <p className="mt-1 text-white/70">{q.error.message}</p>
        <Button className="mt-5" onClick={() => q.refetch()}>Try again</Button>
      </Centered>
    );
  }

  if (items.length === 0) {
    const empty: Record<string, { icon: React.ReactNode; title: string; body: string; action: React.ReactNode }> = {
      auth_required: {
        icon: <UserPlus size={28} />, title: "Sign up to unlock this feed",
        body: tab === "following" ? "Follow publishers, journalists and friends to build your Following feed." : "Choose your city or region to see local stories.",
        action: <Button onClick={() => openSignUp("Sign up to personalise Tidbit.")}>Create an account</Button>,
      },
      set_location: {
        icon: <MapPin size={28} />, title: "Where should we look?", body: "Pick your country, region and city to see stories near you. We never need your precise location.",
        action: <Button onClick={() => navigate("/settings#personalization")}>Choose a location</Button>,
      },
      follow_some: {
        icon: <UserPlus size={28} />, title: "Your Following feed is empty", body: "Follow publishers or people and their posts and reposts will show up here, newest first.",
        action: <Button onClick={() => navigate("/discover")}>Find publishers</Button>,
      },
    };
    const e = empty[notice ?? ""] ?? { icon: <Radio size={28} />, title: "Nothing here yet", body: "Check back soon, or explore other feeds.", action: <Button onClick={() => navigate("/discover")}>Go to Discover</Button> };
    return (
      <Centered>
        <div className="mb-4 rounded-2xl bg-white/10 p-4 text-[#35D5B1]">{e.icon}</div>
        <p className="font-display text-xl font-bold">{e.title}</p>
        <p className="mt-1 max-w-xs text-white/70">{e.body}</p>
        <div className="mt-5">{e.action}</div>
      </Centered>
    );
  }

  return (
    <div
      ref={scroller}
      className="no-scrollbar h-full snap-y snap-mandatory overflow-y-scroll overscroll-y-contain"
      role="feed"
      aria-busy={q.isFetchingNextPage}
      aria-label={`${TABS.find((t) => t.id === tab)?.label} feed`}
    >
      {items.map((p, i) => (
        <div key={`${p.id}-${p.repostedBy?.username ?? ""}`} className="h-full snap-start snap-always" aria-setsize={-1} aria-posinset={i + 1}>
          {Math.abs(i - active) <= 2 ? (
            <FeedCard post={p} active={visible && i === active} preload={Math.abs(i - active) === 1} />
          ) : (
            <div className="h-full bg-[#101827]" />
          )}
        </div>
      ))}
      <div className="h-full snap-start">
        {q.isFetchingNextPage || q.hasNextPage ? (
          <Centered><Spinner className="text-white" /></Centered>
        ) : (
          <EndCard tab={tab} guest={!me} notice={notice} explore={explore} onExplore={onExplore} onTop={() => goTo(0)} />
        )}
      </div>
    </div>
  );
}

function EndCard({ tab, guest, notice, explore, onExplore, onTop }: { tab: FeedTab; guest: boolean; notice?: string; explore: boolean; onExplore: () => void; onTop: () => void }) {
  const navigate = useNavigate();
  const { open } = useSignUpPrompt();
  return (
    <Centered>
      <div className="mb-4 rounded-2xl bg-white/10 p-4 text-[#35D5B1]"><Sparkles size={28} /></div>
      <p className="font-display text-2xl font-extrabold">You're all caught up</p>
      <p className="mt-2 max-w-xs text-white/70">
        {guest && notice === "guest_limit"
          ? "That's the end of the public preview. Sign up for a full feed built around your interests."
          : "You've seen every story in this feed. Tidbit doesn't recycle stories just to keep you scrolling."}
      </p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
        {guest ? <Button onClick={() => open("Sign up for the full Tidbit feed.")}>Create a free account</Button> : null}
        {tab === "foryou" && !explore && !guest ? <Button onClick={() => { onExplore(); onTop(); }}><Compass size={18} /> Explore outside my bubble</Button> : null}
        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => navigate("/discover")}>Browse Discover</Button>
        <button onClick={onTop} className="mt-1 text-sm font-semibold text-white/70 hover:text-white">Back to top</button>
      </div>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full flex-col items-center justify-center px-8 text-center text-white">{children}</div>;
}

function FeedSkeleton() {
  return (
    <div className="flex h-full flex-col justify-end gap-3 p-5 pr-20 pb-8" aria-label="Loading feed" role="status">
      <div className="h-6 w-40 rounded-full bg-white/10" />
      <div className="h-7 w-full rounded-lg bg-white/10" />
      <div className="h-7 w-4/5 rounded-lg bg-white/10" />
      <div className="h-4 w-3/5 rounded bg-white/10" />
      <div className="mt-2 h-9 w-36 rounded-full bg-white/10" />
    </div>
  );
}
