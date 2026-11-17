import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Me } from "../../shared/types";

export function useMe() {
  const q = useQuery({ queryKey: ["me"], queryFn: () => api.get<Me | null>("/auth/me"), staleTime: 60_000 });
  return { me: q.data ?? null, loading: q.isLoading, error: q.error };
}

export function useSetMe() {
  const qc = useQueryClient();
  return useCallback((me: Me | null) => qc.setQueryData(["me"], me), [qc]);
}

/** Clears every cached query (feeds include per-user state) and refetches the session. */
export function useResetSession() {
  const qc = useQueryClient();
  return useCallback(async (me: Me | null) => {
    qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "me" });
    qc.setQueryData(["me"], me);
  }, [qc]);
}

// ---------- Guest mode ----------

const GUEST_KEY = "tidbit.guest";
export const isGuestMode = () => {
  try {
    return sessionStorage.getItem(GUEST_KEY) === "1";
  } catch {
    return false;
  }
};
export const setGuestMode = (on: boolean) => {
  try {
    if (on) sessionStorage.setItem(GUEST_KEY, "1");
    else sessionStorage.removeItem(GUEST_KEY);
  } catch {
    /* storage unavailable: guest mode lasts for this page only */
  }
};

// ---------- Sign-up prompt for restricted actions ----------

interface PromptCtx {
  reason: string | null;
  open: (reason: string) => void;
  close: () => void;
}
const SignUpPromptContext = createContext<PromptCtx>({ reason: null, open: () => {}, close: () => {} });

export function SignUpPromptProvider({ children }: { children: ReactNode }) {
  const [reason, setReason] = useState<string | null>(null);
  return (
    <SignUpPromptContext.Provider value={{ reason, open: setReason, close: () => setReason(null) }}>
      {children}
    </SignUpPromptContext.Provider>
  );
}
export const useSignUpPrompt = () => useContext(SignUpPromptContext);

/** Returns a guard: call it before a member-only action. Returns true if the user may proceed. */
export function useRequireAuth() {
  const { me } = useMe();
  const { open } = useSignUpPrompt();
  return useCallback(
    (reason: string) => {
      if (me) return true;
      open(reason);
      return false;
    },
    [me, open],
  );
}

// ---------- Appearance ----------

export type Appearance = "dark" | "light" | "system";
const THEME_KEY = "tidbit.appearance";

export function getAppearance(): Appearance {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "dark" || v === "light" || v === "system") return v;
  } catch {
    /* ignore */
  }
  return "dark";
}

export function applyAppearance(a: Appearance) {
  const dark = a === "dark" || (a === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#101827" : "#F7F9FC");
}

export function useAppearance() {
  const [appearance, setAppearanceState] = useState<Appearance>(getAppearance);
  useEffect(() => {
    applyAppearance(appearance);
    if (appearance !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const fn = () => applyAppearance("system");
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [appearance]);
  const setAppearance = (a: Appearance) => {
    try {
      localStorage.setItem(THEME_KEY, a);
    } catch {
      /* ignore */
    }
    setAppearanceState(a);
  };
  return { appearance, setAppearance };
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}
