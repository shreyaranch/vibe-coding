import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import clsx from "clsx";
import type { BreakingUpdate, ChartData, MotionScene, Post, Slide } from "../../shared/types";

// ---------- Motion story (video-style post made of timed scenes) ----------

export interface PlaybackReport {
  progress: number;
}

export function MotionPlayer({
  scenes, active, autoplay, accent, onProgress, onEnded,
}: {
  scenes: MotionScene[]; active: boolean; autoplay: boolean; accent: string;
  onProgress?: (p: number) => void; onEnded?: () => void;
}) {
  const total = scenes.reduce((s, x) => s + x.duration, 0);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [flash, setFlash] = useState<"play" | "pause" | null>(null);
  const raf = useRef(0);
  const last = useRef(0);
  const ended = t >= total;

  // Start (or stop) when the card becomes active. Offscreen stories always pause.
  useEffect(() => {
    if (active) setPlaying(autoplay);
    else setPlaying(false);
  }, [active, autoplay]);

  useEffect(() => {
    if (!playing) return;
    last.current = performance.now();
    const tick = (now: number) => {
      const dt = ((now - last.current) / 1000) * speed;
      last.current = now;
      setT((prev) => {
        const next = Math.min(total, prev + dt);
        return next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, speed, total]);

  useEffect(() => {
    onProgress?.(t / total);
    if (t >= total && playing) {
      setPlaying(false);
      onEnded?.();
    }
  }, [t, total, playing, onProgress, onEnded]);

  let acc = 0;
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (t < acc + scenes[i].duration) { idx = i; break; }
    acc += scenes[i].duration;
    idx = i;
  }
  const scene = scenes[idx];

  const toggle = () => {
    if (ended) {
      setT(0);
      setPlaying(true);
      return;
    }
    setFlash(playing ? "pause" : "play");
    setPlaying((p) => !p);
    window.setTimeout(() => setFlash(null), 500);
  };

  return (
    <div className="relative flex h-full w-full flex-col">
      {/* Segment progress bar */}
      <div className="flex gap-1 px-4" role="progressbar" aria-label="Story progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((t / total) * 100)}>
        {scenes.map((s, i) => {
          const start = scenes.slice(0, i).reduce((a, x) => a + x.duration, 0);
          const pct = Math.max(0, Math.min(1, (t - start) / s.duration)) * 100;
          return (
            <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
              <span className="block h-full bg-white" style={{ width: `${pct}%` }} />
            </span>
          );
        })}
      </div>

      <button
        type="button"
        onClick={toggle}
        className="relative flex flex-1 flex-col items-start justify-center px-6 text-left outline-none"
        aria-label={ended ? "Replay story" : playing ? "Pause story" : "Play story"}
      >
        <div key={idx} className="animate-rise w-full">
          {scene.kicker ? (
            <p className="mb-3 text-xs font-bold tracking-[0.2em]" style={{ color: accent }}>{scene.kicker}</p>
          ) : null}
          {scene.stat ? (
            <p className="mb-3 font-display text-6xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-7xl">{scene.stat}</p>
          ) : null}
          <p className="max-w-md font-display text-[26px] leading-tight font-bold text-white drop-shadow sm:text-3xl" aria-live={playing ? "off" : "polite"}>
            {scene.text}
          </p>
        </div>
        {flash || (!playing && !ended && active) ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className={clsx("rounded-full bg-black/40 p-5 backdrop-blur-sm", flash && "animate-pop")}>
              {flash === "pause" ? <Pause size={34} className="text-white" fill="white" /> : <Play size={34} className="text-white" fill="white" />}
            </span>
          </span>
        ) : null}
        {ended ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex items-center gap-2 rounded-full bg-black/45 px-5 py-3 font-semibold text-white backdrop-blur-sm">
              <RotateCcw size={18} /> Replay
            </span>
          </span>
        ) : null}
      </button>

      <div className="flex items-center gap-2 px-4">
        <span className="rounded-md bg-black/35 px-2 py-1 text-[11px] font-semibold text-white/85">Silent motion story · on-screen text</span>
        <button
          type="button"
          onClick={() => setSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}
          className="rounded-md bg-black/35 px-2 py-1 text-[11px] font-bold text-white hover:bg-black/50"
          aria-label={`Playback speed ${speed}x. Change speed`}
        >
          {speed}×
        </button>
      </div>
    </div>
  );
}

// ---------- Explainer slides (swipe horizontally) ----------

export function Slides({ slides, accent, extra, onSlideChange }: { slides: Slide[]; accent: string; extra?: React.ReactNode; onSlideChange?: (i: number, of: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const count = slides.length + (extra ? 1 : 0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const n = Math.round(el.scrollLeft / el.clientWidth);
      setI(n);
      onSlideChange?.(n, count);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [count, onSlideChange]);

  const go = (n: number) => ref.current?.scrollTo({ left: n * ref.current.clientWidth, behavior: "smooth" });

  return (
    <div className="relative flex h-full w-full flex-col">
      <div
        ref={ref}
        className="no-scrollbar flex flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        aria-roledescription="carousel"
        aria-label="Explainer slides"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.stopPropagation(); go(Math.min(count - 1, i + 1)); }
          if (e.key === "ArrowLeft") { e.stopPropagation(); go(Math.max(0, i - 1)); }
        }}
      >
        {slides.map((s, n) => (
          <section key={n} className="flex w-full shrink-0 snap-center flex-col justify-center px-7" aria-roledescription="slide" aria-label={`${n + 1} of ${count}`}>
            <p className="mb-3 text-xs font-bold tracking-[0.2em]" style={{ color: accent }}>{String(n + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</p>
            {s.stat ? <p className="mb-2 font-display text-5xl font-extrabold text-white">{s.stat}</p> : null}
            <h3 className="font-display text-[28px] leading-tight font-extrabold text-white">{s.title}</h3>
            <p className="mt-3 max-w-md text-[17px] leading-relaxed text-white/85">{s.body}</p>
          </section>
        ))}
        {extra ? (
          <section className="flex w-full shrink-0 snap-center flex-col justify-center overflow-y-auto px-6" aria-roledescription="slide" aria-label={`${count} of ${count}`}>
            {extra}
          </section>
        ) : null}
      </div>
      <div className="flex items-center justify-center gap-3 py-1">
        <button onClick={() => go(Math.max(0, i - 1))} disabled={i === 0} className="rounded-full p-1.5 text-white/80 disabled:opacity-30" aria-label="Previous slide">
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-1.5" aria-hidden>
          {Array.from({ length: count }, (_, n) => (
            <span key={n} className={clsx("h-1.5 rounded-full transition-all", n === i ? "w-5 bg-white" : "w-1.5 bg-white/40")} />
          ))}
        </div>
        <button onClick={() => go(Math.min(count - 1, i + 1))} disabled={i === count - 1} className="rounded-full p-1.5 text-white/80 disabled:opacity-30" aria-label="Next slide">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

// ---------- Charts ----------

const DONUT = ["#35D5B1", "#4F8CFF", "#FBBF24", "#FF786B", "#A78BFA", "#A7B2C2"];

export function Chart({ chart, dark = true }: { chart: ChartData; dark?: boolean }) {
  const max = Math.max(...chart.points.map((p) => p.value));
  const fmt = (v: number) => (chart.unit === "$" ? `$${v.toLocaleString()}` : `${v.toLocaleString()}${chart.unit && chart.unit !== "$" ? (chart.unit === "%" ? "%" : ` ${chart.unit}`) : ""}`);
  const text = dark ? "text-white" : "text-fg";
  const sub = dark ? "text-white/65" : "text-muted";

  if (chart.kind === "donut") {
    const sum = chart.points.reduce((s, p) => s + p.value, 0);
    let acc = 0;
    return (
      <figure className={text}>
        <figcaption className="mb-3 font-display text-lg font-bold">{chart.title}</figcaption>
        <div className="flex items-center gap-5">
          <svg viewBox="0 0 42 42" className="h-36 w-36 shrink-0 -rotate-90" role="img" aria-label={chart.points.map((p) => `${p.label} ${fmt(p.value)}`).join(", ")}>
            {chart.points.map((p, i) => {
              const len = (p.value / sum) * 100;
              const el = <circle key={i} cx="21" cy="21" r="15.9" fill="none" stroke={DONUT[i % DONUT.length]} strokeWidth="6" strokeDasharray={`${len} ${100 - len}`} strokeDashoffset={-acc} />;
              acc += len;
              return el;
            })}
          </svg>
          <ul className="space-y-1.5 text-sm">
            {chart.points.map((p, i) => (
              <li key={p.label} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: DONUT[i % DONUT.length] }} />
                <span className={sub}>{p.label}</span>
                <span className="font-semibold tabular-nums">{fmt(p.value)}</span>
              </li>
            ))}
          </ul>
        </div>
        {chart.note ? <p className={clsx("mt-3 text-xs", sub)}>{chart.note}</p> : null}
      </figure>
    );
  }

  return (
    <figure className={text}>
      <figcaption className="mb-4 font-display text-lg font-bold">{chart.title}</figcaption>
      <ul className="space-y-3" role="list">
        {chart.points.map((p, i) => (
          <li key={p.label} className="grid grid-cols-[minmax(64px,auto)_1fr_auto] items-center gap-3 text-sm">
            <span className={sub}>{p.label}</span>
            <span className={clsx("h-3 overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-surface-2")}>
              <span className="animate-grow-x block h-full rounded-full" style={{ width: `${(p.value / max) * 100}%`, background: i === chart.points.length - 1 ? "#35D5B1" : dark ? "rgba(255,255,255,.55)" : "#A7B2C2", animationDelay: `${i * 80}ms` }} />
            </span>
            <span className="font-semibold tabular-nums">{fmt(p.value)}</span>
          </li>
        ))}
      </ul>
      {chart.note ? <p className={clsx("mt-3 text-xs", sub)}>{chart.note}</p> : null}
    </figure>
  );
}

// ---------- Breaking updates ----------

export function BreakingUpdates({ updates, publishedAt }: { updates: BreakingUpdate[]; publishedAt: string }) {
  // The first update lands at publication time; later ones follow at the recorded intervals. Newest first.
  const base = new Date(publishedAt).getTime();
  const first = Math.max(...updates.map((u) => u.minutesAgo));
  const sorted = [...updates].sort((a, b) => a.minutesAgo - b.minutesAgo);
  return (
    <ol className="relative space-y-4 border-l border-white/20 pl-5">
      {sorted.map((u, i) => {
        const at = new Date(Math.min(Date.now(), base + (first - u.minutesAgo) * 60_000));
        return (
          <li key={i} className="relative">
            <span className={clsx("absolute top-1.5 -left-[25px] h-2.5 w-2.5 rounded-full ring-4 ring-[#101827]", i === 0 ? "bg-[#FF786B]" : "bg-white/50")} aria-hidden />
            <p className="text-xs font-semibold text-white/60">
              <time dateTime={at.toISOString()}>{at.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>
              {!u.confirmed ? <span className="ml-2 rounded bg-[#FF786B]/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[#FF786B] uppercase">Unconfirmed</span> : null}
            </p>
            <p className="mt-0.5 text-[15px] leading-snug text-white">{u.text}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function KeyPoints({ points }: { points: string[] }) {
  return (
    <ul className="mt-4 space-y-1.5">
      {points.map((p) => (
        <li key={p} className="flex gap-2 text-sm text-white/85"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#35D5B1]" />{p}</li>
      ))}
    </ul>
  );
}

export const accentFor = (post: Pick<Post, "publisher">) => post.publisher.logoColor;
