// Original generative artwork used as placeholder imagery for demo posts.
// Deterministic per post, with a palette per topic. No third-party media.

const PALETTES: Record<string, [string, string, string]> = {
  world: ["#1E3A5F", "#35D5B1", "#8FB8FF"],
  politics: ["#2B2350", "#A78BFA", "#FF786B"],
  business: ["#3A2E12", "#FBBF24", "#35D5B1"],
  finance: ["#14301F", "#34D399", "#FBBF24"],
  technology: ["#0E2A3B", "#22D3EE", "#A78BFA"],
  ai: ["#1A1840", "#8B5CF6", "#22D3EE"],
  healthcare: ["#3A1730", "#F472B6", "#35D5B1"],
  science: ["#10263F", "#60A5FA", "#F472B6"],
  startups: ["#2F1A12", "#FF786B", "#FBBF24"],
  sports: ["#331512", "#FF786B", "#FDE68A"],
  entertainment: ["#2A1238", "#E879F9", "#FBBF24"],
  environment: ["#0F2F22", "#34D399", "#A3E635"],
  climate: ["#2E1E0E", "#FB923C", "#35D5B1"],
  lifestyle: ["#2B2116", "#FDBA74", "#F472B6"],
  education: ["#162845", "#93C5FD", "#FBBF24"],
  local: ["#132B3A", "#35D5B1", "#4F8CFF"],
};

function rng(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function CoverArt({ seed, category, className, animated = false }: { seed: number; category: string; className?: string; animated?: boolean }) {
  const [base, a, b] = PALETTES[category] ?? PALETTES.world;
  const r = rng(seed);
  const motif = seed % 4;
  const id = `g${seed}-${category}`;
  const circles = Array.from({ length: 5 }, () => ({ x: r() * 400, y: r() * 700, rad: 60 + r() * 160, c: r() > 0.5 ? a : b, o: 0.18 + r() * 0.3 }));
  const bars = Array.from({ length: 9 }, (_, i) => ({ x: 20 + i * 42, h: 80 + r() * 320 }));
  return (
    <svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden role="presentation">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={base} />
          <stop offset="1" stopColor="#101827" />
        </linearGradient>
        <filter id={`${id}-blur`}><feGaussianBlur stdDeviation="40" /></filter>
      </defs>
      <rect width="400" height="700" fill={`url(#${id}-bg)`} />
      <g filter={`url(#${id}-blur)`} className={animated ? "animate-drift" : undefined}>
        {circles.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={c.rad} fill={c.c} opacity={c.o} />)}
      </g>
      {motif === 0 && (
        <g opacity="0.35" stroke={a} strokeWidth="2" fill="none">
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M -20 ${180 + i * 40} C 100 ${120 + i * 40 + r() * 60}, 260 ${240 + i * 40 - r() * 60}, 420 ${170 + i * 40}`} />
          ))}
        </g>
      )}
      {motif === 1 && (
        <g opacity="0.28">
          {bars.map((bar, i) => <rect key={i} x={bar.x} y={560 - bar.h} width="26" height={bar.h} rx="8" fill={i % 3 === 0 ? b : a} />)}
        </g>
      )}
      {motif === 2 && (
        <g opacity="0.32" stroke={b} fill="none">
          {Array.from({ length: 6 }, (_, i) => <circle key={i} cx="290" cy="220" r={30 + i * 34} strokeWidth={i % 2 ? 1 : 2.5} />)}
        </g>
      )}
      {motif === 3 && (
        <g opacity="0.22" fill={a}>
          {Array.from({ length: 70 }, (_, i) => <circle key={i} cx={(i % 10) * 42 + 10} cy={Math.floor(i / 10) * 42 + 120} r={2 + ((i * seed) % 5)} />)}
        </g>
      )}
    </svg>
  );
}
