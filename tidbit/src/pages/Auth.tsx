import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { Camera, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { resizeImage } from "../lib/format";
import { setGuestMode, useMe, useResetSession } from "../lib/session";
import type { Me } from "../../shared/types";
import { Avatar, Button, Field, inputClass } from "../components/ui";

export default function Auth({ mode }: { mode: "login" | "signup" }) {
  const { me } = useMe();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reset = useResetSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameState, setUsernameState] = useState<{ ok: boolean; msg?: string } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const next = params.get("next") || "/";

  // Suggest a username from the display name, and check availability as it changes.
  useEffect(() => {
    if (mode !== "signup" || !username) return setUsernameState(null);
    const t = window.setTimeout(async () => {
      try {
        const r = await api.get<{ available: boolean; message?: string }>(`/username-available?u=${encodeURIComponent(username)}`);
        setUsernameState({ ok: r.available, msg: r.available ? "Available" : r.message ?? "That username is taken." });
      } catch {
        setUsernameState(null);
      }
    }, 350);
    return () => window.clearTimeout(t);
  }, [username, mode]);

  if (me) return <Navigate to={me.onboarded ? next : "/onboarding"} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = mode === "login"
        ? await api.post<Me>("/auth/login", { email, password })
        : await api.post<Me>("/auth/signup", { email, password, displayName, username, profilePhoto: photo });
      setGuestMode(false);
      await reset(user);
      navigate(user.onboarded ? next : "/onboarding", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-6">
        <Link to="/welcome" className="-ml-2 inline-flex w-fit items-center rounded-full p-2 hover:bg-surface-2" aria-label="Back"><ChevronLeft /></Link>
        <h1 className="mt-4 font-display text-3xl font-extrabold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-1 text-muted">{mode === "login" ? "Log in to pick up where you left off." : "It takes less than a minute."}</p>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-4" noValidate>
          {mode === "signup" ? (
            <>
              <div className="flex items-center gap-4">
                <label className="relative cursor-pointer" aria-label="Add a profile photo (optional)">
                  <Avatar name={displayName || "?"} src={photo} size={72} />
                  <span className="absolute -right-1 -bottom-1 rounded-full bg-accent p-1.5 text-accent-ink"><Camera size={14} /></span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        try { setPhoto(await resizeImage(f)); } catch (err) { setError(errorMessage(err)); }
                      }
                    }}
                  />
                </label>
                <p className="text-sm text-muted">Profile photo <span className="block text-xs">Optional. You can add one later.</span></p>
              </div>
              <Field label="Display name">
                <input
                  className={inputClass}
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (!username || username === suggest(displayName)) setUsername(suggest(e.target.value));
                  }}
                  autoComplete="name"
                  maxLength={50}
                  required
                />
              </Field>
              <Field label="Username" error={usernameState && !usernameState.ok ? usernameState.msg : undefined} hint={usernameState?.ok ? "✓ Available" : "Letters, numbers, dots and underscores."}>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-muted">@</span>
                  <input className={`${inputClass} pl-8`} value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, 24))} autoComplete="username" required />
                </div>
              </Field>
            </>
          ) : null}
          <Field label="Email">
            <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </Field>
          <Field label="Password" hint={mode === "signup" ? "At least 8 characters." : undefined}>
            <div className="relative">
              <input className={`${inputClass} pr-12`} type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8} />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-muted" aria-label={showPw ? "Hide password" : "Show password"}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>

          {error ? <p className="rounded-xl bg-coral/15 px-4 py-3 text-sm text-coral-text" role="alert">{error}</p> : null}

          <Button type="submit" size="lg" loading={busy} className="mt-2" disabled={mode === "signup" && usernameState?.ok === false}>
            {mode === "login" ? "Log in" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {mode === "login" ? <>New to Tidbit? <Link to="/signup" className="font-semibold text-accent-text">Create an account</Link></> : <>Already have an account? <Link to="/login" className="font-semibold text-accent-text">Log in</Link></>}
        </p>

        <div className="mt-auto pt-8 text-xs leading-relaxed text-muted">
          <p>Google and Apple sign-in, email verification and password-reset emails need a hosted auth service, so they're planned for the hosted version and aren't offered here.</p>
          {mode === "login" ? <p className="mt-2">Testing? Demo accounts are listed in the project README.</p> : null}
        </div>
      </div>
    </div>
  );
}

const suggest = (name: string) => name.toLowerCase().trim().replace(/\s+/g, ".").replace(/[^a-z0-9._]/g, "").slice(0, 24);
