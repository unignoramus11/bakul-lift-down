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
import { consumeSkeletonOpened, getSlotOrigin } from "@/lib/slotOrigin";
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

  // Delta that maps the view's current box onto the slot rect, as separate
  // transform components so Motion interpolates them smoothly (and we never
  // mutate the element's style directly).
  const slotDelta = useCallback(():
    | { x: number; y: number; scaleX: number; scaleY: number }
    | null => {
    const rect = getSlotOrigin();
    const el = scope.current as HTMLElement | null;
    if (!rect || !el) return null;
    const final = el.getBoundingClientRect();
    if (final.width === 0 || final.height === 0) return null;
    return {
      x: rect.left + rect.width / 2 - (final.left + final.width / 2),
      y: rect.top + rect.height / 2 - (final.top + final.height / 2),
      scaleX: rect.width / final.width,
      scaleY: rect.height / final.height,
    };
  }, [scope]);

  useLayoutEffect(() => {
    const el = scope.current as HTMLElement | null;
    if (!el || reduced) return; // element defaults to visible when not animated

    // If a loading skeleton already grew from the tapped cell, the content just
    // takes its place — re-animating would look like a shrink-then-grow.
    if (consumeSkeletonOpened()) return;

    const d = slotDelta();
    if (!d) {
      animate(el, { opacity: [0, 1] }, { duration: 0.18 });
      return;
    }
    // Grow from the tapped cell (fast/prefetched load — no skeleton shown).
    animate(
      el,
      {
        x: [d.x, 0],
        y: [d.y, 0],
        scaleX: [d.scaleX, 1],
        scaleY: [d.scaleY, 1],
        opacity: [0.35, 1],
      },
      { duration: 0.36, ease: EASE_OUT },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const el = scope.current as HTMLElement | null;

    // Always return to this date's month explicitly: the calendar switches
    // months as client state (swiping) without touching the URL, so a plain
    // history pop would land on whatever month home first rendered.
    const done = () => startTransition(() => router.replace(fallbackHref));

    // Play the collapse-into-the-cell fully, THEN navigate. (Navigating up
    // front would let a prefetched home commit and unmount this view before the
    // animation is seen; home's loading skeleton covers any load delay now.)
    if (reduced || !el) {
      done();
      return;
    }
    const d = slotDelta();
    if (!d) {
      animate(el, { opacity: 0 }, { duration: 0.16 }).then(done);
      return;
    }
    animate(
      el,
      { x: d.x, y: d.y, scaleX: d.scaleX, scaleY: d.scaleY, opacity: 0.15 },
      { duration: 0.3, ease: EASE_IN },
    ).then(done);
  }, [animate, fallbackHref, reduced, router, scope, slotDelta]);

  return (
    <CloseCtx.Provider value={close}>
      <div ref={scope} className="flex flex-1 flex-col">
        {children}
      </div>
    </CloseCtx.Provider>
  );
}
