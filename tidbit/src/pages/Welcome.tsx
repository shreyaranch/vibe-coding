import { Navigate, useNavigate } from "react-router";
import { useMe, setGuestMode } from "../lib/session";
import { Button, DemoBadge, Verified } from "../components/ui";

const PREVIEW = [
  { kicker: "TECHNOLOGY", title: "How your phone's battery actually ages", pub: "Circuit & Code", color: "#22D3EE", from: "#0E2A3B" },
  { kicker: "LOCAL", title: "Port Avalon weighs a 12-route transit expansion", pub: "Northline News", color: "#4F8CFF", from: "#132B3A" },
  { kicker: "CLIMATE", title: "Heat pumps, explained in five slides", pub: "Greenwire", color: "#34D399", from: "#0F2F22" },
];

export default function Welcome() {
  const { me } = useMe();
  const navigate = useNavigate();
  if (me) return <Navigate to="/" replace />;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-navy text-white md:flex-row">
      {/* Hero: a stack of swipeable cards cycling upward */}
      <div className="relative flex flex-1 items-center justify-center px-8 pt-10 md:pt-0">
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-[#35D5B1]/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#FF786B]/20 blur-3xl" />
        <div className="relative h-[360px] w-[220px] md:h-[460px] md:w-[280px]" aria-hidden>
          {PREVIEW.map((c, i) => (
            <div
              key={c.title}
              className="absolute inset-0 flex flex-col justify-end rounded-[28px] border border-white/10 p-5 shadow-2xl"
              style={{
                background: `linear-gradient(160deg, ${c.from}, #101827 70%)`,
                animation: `card-cycle 9s ${i * 3}s infinite cubic-bezier(.6,0,.2,1)`,
                opacity: i === 0 ? 1 : 0,
                zIndex: PREVIEW.length - i,
              }}
            >
              <div className="absolute top-5 right-5 h-24 w-24 rounded-full blur-2xl" style={{ background: c.color, opacity: 0.45 }} />
              <p className="text-[10px] font-bold tracking-[0.2em]" style={{ color: c.color }}>{c.kicker}</p>
              <p className="mt-2 font-display text-xl leading-tight font-extrabold">{c.title}</p>
              <p className="mt-3 flex items-center gap-1 text-xs text-white/70">{c.pub} <Verified className="h-3.5 w-3.5" /></p>
              <div className="mt-4 flex gap-1">
                <span className="h-1 flex-1 rounded-full bg-white" />
                <span className="h-1 flex-1 rounded-full bg-white/30" />
                <span className="h-1 flex-1 rounded-full bg-white/30" />
              </div>
            </div>
          ))}
          <div className="absolute inset-x-6 -bottom-3 -z-10 h-full rounded-[28px] bg-white/5" />
        </div>
      </div>

      <div className="flex flex-col px-7 pt-8 pb-10 md:w-[460px] md:justify-center md:px-12">
        <p className="font-display text-3xl font-extrabold tracking-tight">tidbit<span className="text-[#35D5B1]">.</span></p>
        <p className="mt-1 text-sm font-semibold text-[#35D5B1]">Big stories. Small bites.</p>
        <h1 className="mt-6 font-display text-[34px] leading-[1.1] font-extrabold text-balance">Stay informed without slowing down.</h1>
        <p className="mt-3 text-lg text-white/75">Discover the stories shaping your world, one swipe at a time.</p>
        <div className="mt-8 flex flex-col gap-2.5">
          <Button size="lg" onClick={() => navigate("/signup")}>Get started</Button>
          <Button size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10" onClick={() => navigate("/login")}>Log in</Button>
          <button
            className="mt-1 py-2 text-[15px] font-semibold text-white/75 hover:text-white"
            onClick={() => { setGuestMode(true); navigate("/"); }}
          >
            Explore as guest
          </button>
        </div>
        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-white/55">
          <DemoBadge className="mt-0.5 text-white" />
          This build uses fictional publishers and stories for demonstration. It is not real news.
        </p>
      </div>
    </div>
  );
}
