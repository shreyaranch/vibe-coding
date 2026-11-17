import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, Bookmark, Check, ChevronLeft, Hand, Layers, Plus, X } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { api, errorMessage } from "../lib/api";
import { useMe, useSetMe } from "../lib/session";
import { COUNTRIES, DEMO_CITIES, REGIONS } from "../lib/places";
import { PREFERENCE_OPTIONS, type Category, type Me } from "../../shared/types";
import { Button, DemoBadge, Field, PublisherLogo, Verified, inputClass } from "../components/ui";
import { CategoryIcon } from "../components/CategoryIcon";

interface PublisherSummary { id: number; handle: string; name: string; logoText: string; logoColor: string; description: string; followers: number; following: boolean; verified: boolean; isDemo: boolean }


const STEPS = ["interests", "location", "publishers", "preferences", "tutorial"] as const;

export default function Onboarding() {
  const { me } = useMe();
  const setMe = useSetMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [interests, setInterests] = useState<number[]>(me?.interests ?? []);
  const [country, setCountry] = useState(me?.country ?? "");
  const [region, setRegion] = useState(me?.region ?? "");
  const [city, setCity] = useState(me?.city ?? "");
  const [extra, setExtra] = useState<string[]>(me?.extraLocations ?? []);
  const [extraInput, setExtraInput] = useState("");
  const [prefs, setPrefs] = useState<string[]>(me?.preferences ?? []);
  const cats = useQuery({ queryKey: ["categories"], queryFn: () => api.get<Category[]>("/categories") });
  const pubs = useQuery({ queryKey: ["publishers"], queryFn: () => api.get<PublisherSummary[]>("/publishers"), enabled: step >= 2 });

  const save = async (fn: () => Promise<Me | unknown>) => {
    setBusy(true);
    try {
      const r = await fn();
      if (r && typeof r === "object" && "username" in r) setMe(r as Me);
      setStep((s) => s + 1);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    setBusy(true);
    try {
      const updated = await api.post<Me>("/me/onboarded");
      qc.removeQueries({ queryKey: ["feed"] });
      setMe(updated);
      navigate("/", { replace: true });
    } catch (e) {
      toast.error(errorMessage(e));
      setBusy(false);
    }
  };

  const toggleFollow = async (p: PublisherSummary) => {
    const follow = !p.following;
    qc.setQueryData<PublisherSummary[]>(["publishers"], (old) => old?.map((x) => (x.id === p.id ? { ...x, following: follow } : x)));
    try {
      await (follow ? api.post(`/follow/publisher/${p.id}`) : api.del(`/follow/publisher/${p.id}`));
    } catch (e) {
      toast.error(errorMessage(e));
      void pubs.refetch();
    }
  };

  const current = STEPS[step];
  const regionOptions = REGIONS[country] ?? [];
  const citySuggestions = DEMO_CITIES.filter((c) => !country || c.country === country);

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-6 pt-5 pb-6">
        <div className="flex items-center gap-3">
          {step > 0 ? (
            <button onClick={() => setStep((s) => s - 1)} className="-ml-2 rounded-full p-2 hover:bg-surface-2" aria-label="Back"><ChevronLeft /></button>
          ) : <span className="w-8" />}
          <div className="flex flex-1 gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((s, i) => <span key={s} className={clsx("h-1.5 flex-1 rounded-full transition", i <= step ? "bg-accent" : "bg-line")} />)}
          </div>
          {current !== "tutorial" ? (
            <button className="text-sm font-semibold text-muted hover:text-fg" onClick={() => setStep((s) => s + 1)}>Skip</button>
          ) : <span className="w-8" />}
        </div>

        {current === "interests" && (
          <Step title="What do you want to follow?" subtitle="Pick at least three. Your choices shape your first feed right away.">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {cats.data?.map((c) => {
                const on = interests.includes(c.id);
                return (
                  <button key={c.id} type="button" aria-pressed={on} onClick={() => setInterests((x) => (on ? x.filter((i) => i !== c.id) : [...x, c.id]))}
                    className={clsx("relative flex flex-col items-start gap-3 rounded-2xl border p-3.5 text-left transition", on ? "border-accent bg-accent/12" : "border-line bg-surface hover:bg-surface-2")}>
                    <span className={clsx("rounded-xl p-2", on ? "bg-accent text-accent-ink" : "bg-surface-2 text-fg")}><CategoryIcon name={c.icon} size={20} /></span>
                    <span className="text-[15px] font-semibold leading-tight">{c.name}</span>
                    {on ? <Check size={16} className="absolute top-3 right-3 text-accent-text" /> : null}
                  </button>
                );
              })}
            </div>
            <Footer>
              <Button size="lg" className="w-full" disabled={interests.length < 3} loading={busy} onClick={() => save(() => api.put("/me/interests", { categoryIds: interests }))}>
                {interests.length < 3 ? `Choose ${3 - interests.length} more` : "Continue"}
              </Button>
            </Footer>
          </Step>
        )}

        {current === "location" && (
          <Step title="Where's home?" subtitle="We use this for Local and nearby trending stories. No GPS needed: just pick from the lists.">
            <div className="flex flex-col gap-4">
              <Field label="Country">
                <select className={inputClass} value={country} onChange={(e) => { setCountry(e.target.value); setRegion(""); setCity(""); }}>
                  <option value="">Choose a country</option>
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Province, state or region">
                {regionOptions.length ? (
                  <select className={inputClass} value={region} onChange={(e) => setRegion(e.target.value)} disabled={!country}>
                    <option value="">Choose a region</option>
                    {regionOptions.map((r) => <option key={r}>{r}</option>)}
                  </select>
                ) : (
                  <input className={inputClass} value={region} onChange={(e) => setRegion(e.target.value)} disabled={!country} placeholder="Region" maxLength={80} />
                )}
              </Field>
              <Field label="City" hint="Demo stories use fictional towns. Pick one from the suggestions to see the Local feed in action.">
                <input className={inputClass} list="demo-cities" value={city} maxLength={80}
                  onChange={(e) => {
                    setCity(e.target.value);
                    const m = DEMO_CITIES.find((c) => c.city.toLowerCase() === e.target.value.toLowerCase());
                    if (m) { setCountry(m.country); setRegion(m.region); }
                  }} placeholder="City" />
                <datalist id="demo-cities">{citySuggestions.map((c) => <option key={c.city} value={c.city}>{`${c.region} (demo town)`}</option>)}</datalist>
              </Field>
              <div>
                <p className="mb-1.5 text-sm font-semibold">Also follow news from <span className="font-normal text-muted">(optional)</span></p>
                <div className="flex flex-wrap gap-2">
                  {extra.map((x) => (
                    <span key={x} className="inline-flex items-center gap-1 rounded-full bg-surface-2 py-1 pr-1.5 pl-3 text-sm">
                      {x}<button onClick={() => setExtra((e) => e.filter((y) => y !== x))} aria-label={`Remove ${x}`} className="rounded-full p-0.5 hover:bg-line"><X size={14} /></button>
                    </span>
                  ))}
                </div>
                <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = extraInput.trim(); if (v && !extra.includes(v) && extra.length < 10) setExtra((x) => [...x, v]); setExtraInput(""); }}>
                  <input className={inputClass} value={extraInput} onChange={(e) => setExtraInput(e.target.value)} placeholder="Another city or country" list="demo-cities" maxLength={80} />
                  <Button type="submit" variant="secondary" aria-label="Add location"><Plus size={18} /></Button>
                </form>
              </div>
            </div>
            <Footer>
              <Button size="lg" className="w-full" loading={busy} disabled={!country} onClick={() => save(() => api.put("/me/location", { country, region, city, extraLocations: extra }))}>Continue</Button>
            </Footer>
          </Step>
        )}

        {current === "publishers" && (
          <Step title="Follow some publishers" subtitle="Their stories appear in your Following feed. We never follow anyone for you.">
            <ul className="flex flex-col gap-2.5">
              {pubs.data?.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
                  <PublisherLogo text={p.logoText} color={p.logoColor} size={46} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 font-semibold">{p.name} {p.verified ? <Verified /> : null} {p.isDemo ? <DemoBadge className="text-muted" /> : null}</p>
                    <p className="line-clamp-2 text-sm text-muted">{p.description}</p>
                  </div>
                  <Button size="sm" variant={p.following ? "outline" : "primary"} onClick={() => toggleFollow(p)} aria-pressed={p.following}>
                    {p.following ? "Following" : "Follow"}
                  </Button>
                </li>
              ))}
            </ul>
            <Footer>
              <Button size="lg" className="w-full" onClick={() => setStep((s) => s + 1)}>Continue</Button>
            </Footer>
          </Step>
        )}

        {current === "preferences" && (
          <Step title="What matters most to you?" subtitle="Choose any. These gently nudge your feed, and you can change them in Settings.">
            <div className="flex flex-wrap gap-2.5">
              {PREFERENCE_OPTIONS.map((o) => {
                const on = prefs.includes(o.id);
                return (
                  <button key={o.id} aria-pressed={on} onClick={() => setPrefs((p) => (on ? p.filter((x) => x !== o.id) : [...p, o.id]))}
                    className={clsx("inline-flex h-12 items-center gap-2 rounded-full border px-5 text-[15px] font-semibold transition", on ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2")}>
                    {on ? <Check size={16} /> : null}{o.label}
                  </button>
                );
              })}
            </div>
            <Footer>
              <Button size="lg" className="w-full" loading={busy} onClick={() => save(() => api.put("/me/preferences", { preferences: prefs }))}>Continue</Button>
            </Footer>
          </Step>
        )}

        {current === "tutorial" && (
          <Step title="You're ready" subtitle="A few gestures to know. Every gesture also has a button or keyboard shortcut.">
            <ul className="flex flex-col gap-3">
              {[
                { icon: <ArrowUp />, title: "Swipe up for the next story", body: "Or scroll, or press ↓ / J on a keyboard." },
                { icon: <Hand />, title: "Tap to pause", body: "Tap a motion story to pause or replay it." },
                { icon: <Layers />, title: "Swipe left or tap for more context", body: "Explainers swipe sideways. Related coverage shows other publishers' takes." },
                { icon: <Bookmark />, title: "Save the stories worth revisiting", body: "Find them later in your profile, organised into collections." },
              ].map((g) => (
                <li key={g.title} className="flex gap-4 rounded-2xl border border-line bg-surface p-4">
                  <span className="h-fit rounded-xl bg-accent/15 p-2.5 text-accent-text">{g.icon}</span>
                  <span><span className="block font-semibold">{g.title}</span><span className="text-sm text-muted">{g.body}</span></span>
                </li>
              ))}
            </ul>
            <Footer>
              <Button size="lg" className="w-full" loading={busy} onClick={finish}>Start exploring</Button>
            </Footer>
          </Step>
        )}
      </div>
    </div>
  );
}

function Step({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="animate-rise mt-8 flex flex-1 flex-col">
      <h1 className="font-display text-[28px] leading-tight font-extrabold">{title}</h1>
      <p className="mt-2 mb-6 text-muted">{subtitle}</p>
      {children}
    </section>
  );
}

function Footer({ children }: { children: React.ReactNode }) {
  return <div className="sticky bottom-0 mt-auto bg-gradient-to-t from-bg via-bg to-transparent pt-6 pb-2">{children}</div>;
}
