import { NavLink, Outlet, useLocation } from "react-router";
import { Bell, Compass, House, Plus, Settings, Shield, User } from "lucide-react";
import clsx from "clsx";
import { useMe } from "../lib/session";
import { Avatar } from "./ui";

const NAV = [
  { to: "/", label: "Home", icon: House, end: true },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/create", label: "Create", icon: Plus },
  { to: "/inbox", label: "Inbox", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppShell() {
  const { me } = useMe();
  const loc = useLocation();
  const isFeed = loc.pathname === "/";
  const unread = me?.unreadNotifications ?? 0;

  return (
    <div className="flex h-dvh w-full flex-col md:flex-row">
      {/* Desktop side rail */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-bg px-3 py-5 md:flex lg:w-64">
        <NavLink to="/" className="mb-6 px-3 font-display text-2xl font-extrabold tracking-tight">
          tidbit<span className="text-accent">.</span>
          <span className="mt-0.5 block text-xs font-medium tracking-normal text-muted">Big stories. Small bites.</span>
        </NavLink>
        <nav className="flex flex-col gap-1" aria-label="Main">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                clsx("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition", isActive ? "bg-accent/15 text-accent-text" : "text-fg hover:bg-surface-2")
              }
            >
              <span className="relative">
                {n.to === "/profile" && me ? <Avatar name={me.displayName} src={me.profilePhoto} size={24} /> : <n.icon size={22} />}
                {n.to === "/inbox" && unread > 0 ? <Dot n={unread} /> : null}
              </span>
              {n.label}
            </NavLink>
          ))}
          <NavLink to="/settings" className={({ isActive }) => clsx("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold", isActive ? "bg-accent/15 text-accent-text" : "text-fg hover:bg-surface-2")}>
            <Settings size={22} /> Settings
          </NavLink>
          {me?.accountType === "admin" ? (
            <NavLink to="/admin" className={({ isActive }) => clsx("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold", isActive ? "bg-accent/15 text-accent-text" : "text-fg hover:bg-surface-2")}>
              <Shield size={22} /> Moderation
            </NavLink>
          ) : null}
        </nav>
        <p className="mt-auto px-3 text-xs leading-relaxed text-muted">
          All stories in this build are fictional demo content from demo publishers.
        </p>
      </aside>

      <main className={clsx("relative min-h-0 flex-1", isFeed ? "overflow-hidden" : "overflow-y-auto")} id="main">
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <nav
        className={clsx("pb-safe flex shrink-0 border-t md:hidden", isFeed ? "border-white/10 bg-[#101827] text-white" : "border-line bg-bg text-fg")}
        aria-label="Main"
      >
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            aria-label={n.label}
            className={({ isActive }) =>
              clsx("flex h-16 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold", isActive ? (isFeed ? "text-white" : "text-accent-text") : "opacity-60")
            }
          >
            {({ isActive }) => (
              <>
                {n.to === "/create" ? (
                  <span className="flex h-8 w-11 items-center justify-center rounded-xl bg-accent text-accent-ink"><Plus size={22} strokeWidth={2.5} /></span>
                ) : (
                  <span className="relative">
                    <n.icon size={24} strokeWidth={isActive ? 2.4 : 2} />
                    {n.to === "/inbox" && unread > 0 ? <Dot n={unread} /> : null}
                  </span>
                )}
                {n.to !== "/create" ? n.label : null}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function Dot({ n }: { n: number }) {
  return (
    <span className="absolute -top-1.5 -right-2 min-w-4 rounded-full bg-coral px-1 text-center text-[10px] leading-4 font-bold text-navy" aria-label={`${n} unread`}>
      {n > 9 ? "9+" : n}
    </span>
  );
}
