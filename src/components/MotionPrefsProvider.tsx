"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
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

export function MotionPrefsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [systemReduced, setSystemReduced] = useState(false);
  const [override, setOverrideState] = useState<boolean | null>(null);

  // Read persisted override + system preference on mount.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setOverrideState(true);
    else if (stored === "false") setOverrideState(false);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const reduced = override ?? systemReduced;

  // Reflect onto <html> so pure-CSS ambient animations can honor it too.
  useEffect(() => {
    document.documentElement.dataset.reduceMotion = reduced ? "true" : "false";
  }, [reduced]);

  const setOverride = useCallback((v: boolean | null) => {
    setOverrideState(v);
    if (v === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, String(v));
  }, []);

  return (
    <Ctx.Provider value={{ reduced, override, setOverride }}>
      {children}
    </Ctx.Provider>
  );
}

export const useMotionPrefs = () => useContext(Ctx);
