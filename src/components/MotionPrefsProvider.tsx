"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

type MotionPrefs = {
  /** True when animations should be suppressed (system pref OR user toggle). */
  reduced: boolean;
  /** User's explicit override; null = follow the system. */
  override: boolean | null;
  setOverride: (v: boolean | null) => void;
};

const Ctx = createContext<MotionPrefs>({
  reduced: false,
  override: null,
  setOverride: () => {},
});

const STORAGE_KEY = "bld:reduce-motion";

// ── system preference (prefers-reduced-motion) ───────────────────────────────
function subscribeSystem(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const getSystem = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ── user override (in-memory, persisted to localStorage) ─────────────────────
const overrideListeners = new Set<() => void>();
let override: boolean | null = null;
let hydrated = false;

function hydrateOverride() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const stored = localStorage.getItem(STORAGE_KEY);
  override = stored === "true" ? true : stored === "false" ? false : null;
}
function subscribeOverride(onChange: () => void) {
  overrideListeners.add(onChange);
  return () => {
    overrideListeners.delete(onChange);
  };
}
function getOverride(): boolean | null {
  hydrateOverride();
  return override;
}
function setOverrideValue(v: boolean | null) {
  override = v;
  if (typeof window !== "undefined") {
    if (v === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, String(v));
  }
  overrideListeners.forEach((l) => l());
}

export function MotionPrefsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const systemReduced = useSyncExternalStore(
    subscribeSystem,
    getSystem,
    () => false,
  );
  const overrideValue = useSyncExternalStore(
    subscribeOverride,
    getOverride,
    () => null,
  );
  const reduced = overrideValue ?? systemReduced;

  // Reflect onto <html> so pure-CSS ambient animations honor it too.
  useEffect(() => {
    document.documentElement.dataset.reduceMotion = reduced ? "true" : "false";
  }, [reduced]);

  const setOverride = useCallback((v: boolean | null) => setOverrideValue(v), []);

  return (
    <Ctx.Provider value={{ reduced, override: overrideValue, setOverride }}>
      {children}
    </Ctx.Provider>
  );
}

export const useMotionPrefs = () => useContext(Ctx);
