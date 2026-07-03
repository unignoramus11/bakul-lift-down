"use client";

import { useAnimate } from "motion/react";
import { useLayoutEffect } from "react";
import { getSlotOrigin, markSkeletonOpened } from "@/lib/slotOrigin";
import { useMotionPrefs } from "./MotionPrefsProvider";

const EASE_OUT: [number, number, number, number] = [0.2, 0.9, 0.25, 1];

// Wraps a route's loading skeleton and grows it from the tapped cell/button —
// the same open motion the page would play — then flags that the open was
// handled, so the real page takes the skeleton's place without re-animating.
export function SlotOpen({ children }: { children: React.ReactNode }) {
  const { reduced } = useMotionPrefs();
  const [scope, animate] = useAnimate();

  useLayoutEffect(() => {
    const el = scope.current as HTMLElement | null;
    if (!el) return;
    const rect = getSlotOrigin();
    // Nothing to grow from (direct visit) or motion off → appear in place, but
    // still mark so the page doesn't animate on top of us.
    if (reduced || !rect) {
      markSkeletonOpened();
      return;
    }
    const final = el.getBoundingClientRect();
    if (final.width === 0 || final.height === 0) {
      markSkeletonOpened();
      return;
    }
    animate(
      el,
      {
        x: [rect.left + rect.width / 2 - (final.left + final.width / 2), 0],
        y: [rect.top + rect.height / 2 - (final.top + final.height / 2), 0],
        scaleX: [rect.width / final.width, 1],
        scaleY: [rect.height / final.height, 1],
        opacity: [0.35, 1],
      },
      { duration: 0.36, ease: EASE_OUT },
    );
    markSkeletonOpened();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={scope} className="flex flex-1 flex-col">
      {children}
    </div>
  );
}
