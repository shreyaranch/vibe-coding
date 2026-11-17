import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Download, LogOut, Monitor, Moon, Sun, X } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { api, errorMessage } from "../lib/api";
import { COUNTRIES, DEMO_CITIES, REGIONS } from "../lib/places";
import { setGuestMode, useAppearance, useMe, useResetSession, useSetMe } from "../lib/session";
import { PREFERENCE_OPTIONS, type Category, type FeedTab, type Me } from "../../shared/types";
import { Button, Chip, Field, PageHeader, Sheet, Switch, inputClass } from "../components/ui";

export default function SettingsPage() {
  const { me } = useMe();
  const { appearance, setAppearance } = useAppearance();
  const loc = useLocation();
  useEffect(() => {
    if (loc.hash) window.setTimeout(() => document.getElementById(loc.hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [loc.hash]);

  return (
    <div className="mx-auto w-full max-w-2xl pb-16">
      <PageHeader title="Settings" />
      {me ? (
        <>
          <AccountSection me={me} />
          <PersonalizationSection me={me} />
          <FeedSection me={me} />
          <NotificationSection me={me} />
          <PrivacySection me={me} />
        </>
      ) : (
        <div className="px-5 pt-6">
          <p className="text-muted">Sign in to manage your account, interests, notifications and privacy.</p>
          <div className="mt-3 flex gap-2"><Link to="/login"><Button>Log in</Button></Link><Link to="/signup"><Button variant="secondary">Sign up</Button></Link></div>
        </div>
      )}
      <Section id="appearance" title="Appearance">
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Theme">
          {([["dark", "Dark", Moon], ["light", "Light", Sun], ["system", "System", Monitor]] as const).map(([id, label, Icon]) => (
            <button key={id} role="radio" aria-checked={appearance === id} onClick={() => setAppearance(id)}
              className={clsx("flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-semibold", appearance === id ? "border-accent bg-accent/10" : "border-line bg-surface hover:bg-surface-2")}>
              <Icon size={22} />{label}
            </button>
          ))}
        </div>
      </Section>
      <p className="px-5 pt-8 text-center text-xs text-muted">Tidbit · Phase 1 local build · All stories are fictional demo content.</p>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-16 px-5 pt-8">
      <h2 className="mb-2 text-xs font-bold tracking-wider text-muted uppercase">{title}</h2>
      <div className="rounded-2xl border border-line bg-surface px-4 py-1">{children}</div>
    </section>
  );
}

function Row({ label, value, onClick, danger }: { label: string; value?: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={clsx("flex w-full items-center justify-between gap-3 border-b border-line py-3.5 text-left text-[15px] font-medium last:border-0", danger && "text-coral-text")}>
      {label}
      <span className="flex min-w-0 items-center gap-1 text-sm text-muted"><span className="truncate">{value}</span><ChevronRight size={18} /></span>
    </button>
  );
}

function useSaveSettings() {
  const setMe = useSetMe();
  const qc = useQueryClient();
  return async (body: Partial<Pick<Me, "privacy" | "feed" | "notifications">>) => {
    try {
      setMe(await api.put<Me>("/me/settings", body));
      if (body.feed || body.privacy) qc.removeQueries({ queryKey: ["feed"] });
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };
}

// ---------- Account ----------

function AccountSection({ me }: { me: Me }) {
  const navigate = useNavigate();
  const reset = useResetSession();
  const setMe = useSetMe();
  const [sheet, setSheet] = useState<"email" | "password" | "delete" | null>(null);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [busy, setBusy] = useState(false);
  const close = () => { setSheet(null); setA(""); setB(""); };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); close(); } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
  };
  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    setGuestMode(false);
    await reset(null);
    navigate("/welcome", { replace: true });
  };

  return (
    <Section id="account" title="Account">
      <Row label="Edit profile" value={`@${me.username}`} onClick={() => navigate("/profile/edit")} />
      <Row label="Email" value={me.email} onClick={() => setSheet("email")} />
      <Row label="Password" value="Change" onClick={() => setSheet("password")} />
      <Row label="Sign-in methods" value="Email and password" onClick={() => toast("Google and Apple sign-in arrive with the hosted version.")} />
      {me.accountType === "admin" ? <Row label="Moderation dashboard" onClick={() => navigate("/admin")} /> : null}
      <button onClick={logout} className="flex w-full items-center gap-2 border-b border-line py-3.5 text-[15px] font-medium"><LogOut size={18} /> Log out</button>
      <Row label="Delete account" danger onClick={() => setSheet("delete")} />

      <Sheet open={sheet === "email"} onOpenChange={(o) => !o && close()} title="Change email">
        <div className="flex flex-col gap-3">
          <Field label="New email"><input className={inputClass} type="email" value={a} onChange={(e) => setA(e.target.value)} autoComplete="email" /></Field>
          <Field label="Current password"><input className={inputClass} type="password" value={b} onChange={(e) => setB(e.target.value)} autoComplete="current-password" /></Field>
          <Button loading={busy} onClick={() => run(async () => { setMe(await api.post<Me>("/me/email", { email: a, password: b })); toast.success("Email updated"); })}>Update email</Button>
        </div>
      </Sheet>
      <Sheet open={sheet === "password"} onOpenChange={(o) => !o && close()} title="Change password">
        <div className="flex flex-col gap-3">
          <Field label="Current password"><input className={inputClass} type="password" value={a} onChange={(e) => setA(e.target.value)} autoComplete="current-password" /></Field>
          <Field label="New password" hint="At least 8 characters. Other devices will be signed out."><input className={inputClass} type="password" value={b} onChange={(e) => setB(e.target.value)} autoComplete="new-password" /></Field>
          <Button loading={busy} onClick={() => run(async () => { await api.post("/me/password", { current: a, next: b }); toast.success("Password changed"); })}>Change password</Button>
        </div>
      </Sheet>
      <Sheet open={sheet === "delete"} onOpenChange={(o) => !o && close()} title="Delete your account?" description="This permanently deletes your profile, comments, likes, saves and votes. It can't be undone.">
        <div className="flex flex-col gap-3">
          <Field label="Enter your password to confirm"><input className={inputClass} type="password" value={a} onChange={(e) => setA(e.target.value)} autoComplete="current-password" /></Field>
          <Button variant="danger" loading={busy} disabled={!a} onClick={() => run(async () => { await api.del("/me", { password: a }); await reset(null); toast.success("Account deleted"); navigate("/welcome", { replace: true }); })}>
            Permanently delete account
          </Button>
        </div>
      </Sheet>
    </Section>
  );
}

// ---------- Personalization ----------

function PersonalizationSection({ me }: { me: Me }) {
  const setMe = useSetMe();
  const qc = useQueryClient();
  const cats = useQuery({ queryKey: ["categories"], queryFn: () => api.get<Category[]>("/categories") });
  const hidden = useQuery({ queryKey: ["hidden"], queryFn: () => api.get<{ publishers: { id: number; name: string }[]; topics: { id: number; name: string }[]; blocked: { id: number; username: string; displayName: string; kind: string }[] }>("/me/hidden") });
  const [country, setCountry] = useState(me.country);
  const [region, setRegion] = useState(me.region);
  const [city, setCity] = useState(me.city);
  const refreshFeeds = () => qc.removeQueries({ queryKey: ["feed"] });

  const toggleInterest = async (id: number) => {
    const next = me.interests.includes(id) ? me.interests.filter((x) => x !== id) : [...me.interests, id];
    try { setMe(await api.put<Me>("/me/interests", { categoryIds: next })); refreshFeeds(); } catch (e) { toast.error(errorMessage(e)); }
  };
  const togglePref = async (id: string) => {
    const next = me.preferences.includes(id) ? me.preferences.filter((x) => x !== id) : [...me.preferences, id];
    try { setMe(await api.put<Me>("/me/preferences", { preferences: next })); refreshFeeds(); } catch (e) { toast.error(errorMessage(e)); }
  };
  const saveLocation = async () => {
    try { setMe(await api.put<Me>("/me/location", { country, region, city, extraLocations: me.extraLocations })); refreshFeeds(); toast.success("Location saved"); } catch (e) { toast.error(errorMessage(e)); }
  };
  const unhide = async (kind: "publisher" | "topic", id: number) => {
    await api.del(`/me/hidden/${kind}/${id}`);
    void hidden.refetch();
    refreshFeeds();
  };

  return (
    <Section id="personalization" title="Personalization">
      <div className="py-3">
        <p className="mb-2 text-[15px] font-medium">News topics</p>
        <div className="flex flex-wrap gap-2">
          {cats.data?.map((c) => <Chip key={c.id} active={me.interests.includes(c.id)} onClick={() => toggleInterest(c.id)}>{c.name}</Chip>)}
        </div>
      </div>
      <div className="border-t border-line py-3">
        <p className="mb-2 text-[15px] font-medium">What matters most</p>
        <div className="flex flex-wrap gap-2">
          {PREFERENCE_OPTIONS.map((o) => <Chip key={o.id} active={me.preferences.includes(o.id)} onClick={() => togglePref(o.id)}>{o.label}</Chip>)}
        </div>
      </div>
      <div className="border-t border-line py-3">
        <p className="mb-2 text-[15px] font-medium">Location</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <select aria-label="Country" className={inputClass} value={country} onChange={(e) => { setCountry(e.target.value); setRegion(""); }}>
            <option value="">Country</option>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          {REGIONS[country] ? (
            <select aria-label="Region" className={inputClass} value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">Region</option>{REGIONS[country].map((r) => <option key={r}>{r}</option>)}
            </select>
          ) : <input aria-label="Region" className={inputClass} value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Region" />}
          <input aria-label="City" className={inputClass} value={city} list="settings-cities" placeholder="City" onChange={(e) => {
            setCity(e.target.value);
            const m = DEMO_CITIES.find((c) => c.city.toLowerCase() === e.target.value.toLowerCase());
            if (m) { setCountry(m.country); setRegion(m.region); }
          }} />
          <datalist id="settings-cities">{DEMO_CITIES.map((c) => <option key={c.city} value={c.city}>{`${c.region} (demo town)`}</option>)}</datalist>
        </div>
        <Button size="sm" className="mt-2" onClick={saveLocation} disabled={country === me.country && region === me.region && city === me.city}>Save location</Button>
      </div>
      <div className="border-t border-line py-3">
        <p className="text-[15px] font-medium">Preferred language</p>
        <p className="text-sm text-muted">English. More languages will follow when publishers post in them.</p>
      </div>
      {hidden.data && (hidden.data.publishers.length || hidden.data.topics.length) ? (
        <div className="border-t border-line py-3">
          <p className="mb-2 text-[15px] font-medium">Hidden publishers and topics</p>
          <div className="flex flex-wrap gap-2">
            {hidden.data.publishers.map((p) => <HiddenChip key={`p${p.id}`} label={p.name} onRemove={() => unhide("publisher", p.id)} />)}
            {hidden.data.topics.map((t) => <HiddenChip key={`t${t.id}`} label={t.name} onRemove={() => unhide("topic", t.id)} />)}
          </div>
        </div>
      ) : null}
      <div className="border-t border-line py-3">
        <p className="text-[15px] font-medium">Reset recommendations</p>
        <p className="mb-2 text-sm text-muted">Clears your viewing history, “show more/less” feedback and hidden publishers. Your interests and follows stay.</p>
        <Button size="sm" variant="outline" onClick={async () => {
          if (!window.confirm("Reset your recommendations?")) return;
          await api.post("/me/reset-recommendations");
          void hidden.refetch();
          refreshFeeds();
          toast.success("Recommendations reset");
        }}>Reset</Button>
      </div>
    </Section>
  );
}

function HiddenChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 py-1 pr-1.5 pl-3 text-sm">
      {label}<button onClick={onRemove} aria-label={`Unhide ${label}`} className="rounded-full p-0.5 hover:bg-line"><X size={14} /></button>
    </span>
  );
}

// ---------- Feed ----------

function FeedSection({ me }: { me: Me }) {
  const save = useSaveSettings();
  const f = me.feed;
  return (
    <Section id="feed" title="Feed preferences">
      <Switch label="Autoplay motion stories" description="Turned off automatically if your device asks for reduced motion." checked={f.autoplay} onChange={(v) => save({ feed: { ...f, autoplay: v } })} />
      <Switch label="Data saver" description="Don't autoplay. Useful on cellular data." checked={f.dataSaver} onChange={(v) => save({ feed: { ...f, dataSaver: v } })} />
      <Switch label="Captions on videos" description="Applies to publisher videos with audio (coming with media uploads)." checked={f.captions} onChange={(v) => save({ feed: { ...f, captions: v } })} />
      <Switch label="Fewer distressing stories" description="Spaces out and down-ranks upsetting news in For You." checked={f.reduceDistressing} onChange={(v) => save({ feed: { ...f, reduceDistressing: v } })} />
      <label className="flex items-center justify-between gap-4 py-3">
        <span className="text-[15px] font-medium">Default feed tab</span>
        <select value={f.defaultTab} onChange={(e) => save({ feed: { ...f, defaultTab: e.target.value as FeedTab } })} className="h-10 rounded-xl border border-line bg-surface px-3">
          <option value="foryou">For You</option><option value="following">Following</option><option value="trending">Trending</option><option value="local">Local</option>
        </select>
      </label>
    </Section>
  );
}

// ---------- Notifications ----------

function NotificationSection({ me }: { me: Me }) {
  const save = useSaveSettings();
  const n = me.notifications;
  return (
    <Section id="notifications" title="Notifications">
      <Switch label="Breaking news" checked={n.breaking} onChange={(v) => save({ notifications: { ...n, breaking: v } })} />
      <Switch label="Publisher updates" description="New posts from publishers you follow" checked={n.publisherUpdates} onChange={(v) => save({ notifications: { ...n, publisherUpdates: v } })} />
      <Switch label="Social activity" description="Replies, comment likes, new followers and reposts" checked={n.social} onChange={(v) => save({ notifications: { ...n, social: v } })} />
      <Switch label="Poll results" checked={n.pollResults} onChange={(v) => save({ notifications: { ...n, pollResults: v } })} />
      <div className="flex items-center justify-between gap-3 py-3">
        <span>
          <span className="block text-[15px] font-medium">Quiet hours</span>
          <span className="block text-sm text-muted">Saved for push alerts, which arrive with the hosted version.</span>
        </span>
        <span className="flex items-center gap-1.5 text-sm">
          <input type="time" aria-label="Quiet hours start" value={n.quietHoursStart} onChange={(e) => save({ notifications: { ...n, quietHoursStart: e.target.value } })} className="h-10 rounded-xl border border-line bg-surface px-2" />
          –
          <input type="time" aria-label="Quiet hours end" value={n.quietHoursEnd} onChange={(e) => save({ notifications: { ...n, quietHoursEnd: e.target.value } })} className="h-10 rounded-xl border border-line bg-surface px-2" />
        </span>
      </div>
    </Section>
  );
}

// ---------- Privacy ----------

function PrivacySection({ me }: { me: Me }) {
  const save = useSaveSettings();
  const hidden = useQuery({ queryKey: ["hidden"], queryFn: () => api.get<{ blocked: { id: number; username: string; displayName: string; kind: string }[] }>("/me/hidden") });
  const p = me.privacy;
  return (
    <Section id="privacy" title="Privacy">
      <Switch label="Private profile" description="Only followers can see your reposts and activity." checked={p.privateProfile} onChange={(v) => save({ privacy: { ...p, privateProfile: v } })} />
      <Switch label="Show my likes on my profile" checked={p.likesPublic} onChange={(v) => save({ privacy: { ...p, likesPublic: v } })} />
      <Switch label="Show who I follow" checked={p.followingPublic} onChange={(v) => save({ privacy: { ...p, followingPublic: v } })} />
      <Switch label="Public reposts" description="Your reposts appear in followers' feeds and on your profile." checked={p.repostsPublic} onChange={(v) => save({ privacy: { ...p, repostsPublic: v } })} />
      <Switch label="Personalized recommendations" description="Use my interests and activity to rank For You. Off = freshness, quality and variety only." checked={p.personalization} onChange={(v) => save({ privacy: { ...p, personalization: v } })} />
      {hidden.data?.blocked.length ? (
        <div className="border-t border-line py-3">
          <p className="mb-2 text-[15px] font-medium">Blocked and muted</p>
          <ul className="space-y-1 text-sm">
            {hidden.data.blocked.map((b) => (
              <li key={`${b.id}${b.kind}`} className="flex items-center justify-between">
                <Link to={`/u/${b.username}`} className="hover:underline">{b.displayName} <span className="text-muted">({b.kind === "block" ? "blocked" : "muted"})</span></Link>
                <button className="text-accent-text" onClick={async () => { await api.del(`/users/${b.id}/block?kind=${b.kind}`); void hidden.refetch(); }}>Undo</button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <a href="/api/me/export" download className="flex items-center gap-2 border-t border-line py-3.5 text-[15px] font-medium">
        <Download size={18} /> Download my data (JSON)
      </a>
    </Section>
  );
}
