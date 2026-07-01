"use client";

import { useAnimate } from "motion/react";
import { useRouter } from "next/navigation";
import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { getSlotOrigin } from "@/lib/slotOrigin";
import { useMotionPrefs } from "./MotionPrefsProvider";

// Wraps the date view and animates it expanding from the tapped calendar cell
// on open, and collapsing back into it on close (FLIP from the stored slot
// rect to the view's natural box). Provides a close() that plays the reverse
// animation before navigating back to the calendar.
const CloseCtx = createContext<null | (() => void)>(null);
export const useSlotClose = () => useContext(CloseCtx);

const EASE_OUT: [number, number, number, number] = [0.2, 0.9, 0.25, 1];
const EASE_IN: [number, number, number, number] = [0.4, 0, 0.7, 1];

export function SlotReveal({
  children,
  fallbackHref = "/",
}: {
  children: React.ReactNode;
  /** Where to go if there's no in-app history to pop back to (direct visit). */
  fallbackHref?: string;
}) {
  const router = useRouter();
  const { reduced } = useMotionPrefs();
  const [scope, animate] = useAnimate();
  const closing = useRef(false);

  // Warm the target month route while the user is on the date page, so the
  // navigation after the collapse animation is instant instead of freezing on
  // the last frame while home re-queries the DB.
  useEffect(() => {
    router.prefetch(fallbackHref);
  }, [router, fallbackHref]);

  // Transform that maps the view's current box onto the slot rect.
  const slotTransform = useCallback((): string | null => {
    const rect = getSlotOrigin();
    const el = scope.current as HTMLElement | null;
    if (!rect || !el) return null;
    const final = el.getBoundingClientRect();
    if (final.width === 0 || final.height === 0) return null;
    const sx = rect.width / final.width;
    const sy = rect.height / final.height;
    const dx = rect.left + rect.width / 2 - (final.left + final.width / 2);
    const dy = rect.top + rect.height / 2 - (final.top + final.height / 2);
    return `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
  }, [scope]);

  useLayoutEffect(() => {
    const el = scope.current as HTMLElement | null;
    if (!el) return;
    if (reduced) {
      el.style.opacity = "1";
      return;
    }
    const t = slotTransform();
    if (!t) {
      animate(el, { opacity: [0, 1] }, { duration: 0.18 });
      return;
    }
    el.style.transformOrigin = "center center";
    el.style.willChange = "transform, opacity";
    el.style.transform = t;
    el.style.opacity = "0.35";
    animate(
      el,
      { transform: "translate(0px, 0px) scale(1, 1)", opacity: 1 },
      { duration: 0.36, ease: EASE_OUT },
    ).then(() => {
      el.style.willChange = "auto";
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const el = scope.current as HTMLElement | null;

    // Kick the navigation up front so home's DB query runs *during* the
    // collapse animation, not after it — otherwise the last animation frame
    // freezes on screen until the fetch resolves. Always return to this date's
    // month explicitly: the calendar switches months as client state (swiping)
    // without touching the URL, so a plain history pop would land on whatever
    // month home first rendered, not the one the tapped cell lived in.
    startTransition(() => router.replace(fallbackHref));

    if (reduced || !el) return;
    const t = slotTransform();
    if (!t) {
      animate(el, { opacity: 0 }, { duration: 0.16 });
      return;
    }
    el.style.transformOrigin = "center center";
    el.style.willChange = "transform, opacity";
    animate(el, { transform: t, opacity: 0.15 }, { duration: 0.3, ease: EASE_IN });
  }, [animate, fallbackHref, reduced, router, scope, slotTransform]);

  return (
    <CloseCtx.Provider value={close}>
      <div ref={scope} className="flex flex-1 flex-col">
        {children}
      </div>
    </CloseCtx.Provider>
  );
}
