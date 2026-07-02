"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { clsx } from "@/lib/clsx";
import type { DaySummary } from "@/lib/reports";
import {
  currentMonthIST,
  formatMonthLabel,
  shiftMonth,
} from "@/lib/time";
import { CalendarModule } from "./CalendarModule";
import { CalendarSkeleton } from "./CalendarSkeleton";
import { useMotionPrefs } from "./MotionPrefsProvider";

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (y: number, m: number) => `${y}-${pad(m)}`;

export function MonthSwitcher({
  initialMonth,
  initialDays,
  refreshSignal = 0,
}: {
  initialMonth: { year: number; month: number };
  initialDays: DaySummary[];
  /** Bump to invalidate the visible month's cache and refetch (post-report). */
  refreshSignal?: number;
}) {
  const { reduced } = useMotionPrefs();
  const [{ year, month }, setYM] = useState(initialMonth);
  const [direction, setDirection] = useState(0);
  // null → the visible month's data isn't ready yet (show skeleton).
  const [days, setDays] = useState<DaySummary[] | null>(initialDays);

  // Month cache kept in state so it's a stable value we can read/mutate without
  // touching a ref during render. Seeded with the server-provided month so the
  // first paint shows real data.
  const [cache] = useState(
    () =>
      new Map<string, DaySummary[]>([
        [keyOf(initialMonth.year, initialMonth.month), initialDays],
      ]),
  );

  const current = currentMonthIST();
  const atCurrent = year === current.year && month === current.month;
  const loading = days === null;

  // A bumped refreshSignal invalidates the visible month so a freshly filed
  // report shows up without a full page reload.
  const lastSignal = useRef(refreshSignal);

  // Fetch when the visible month isn't cached, or a refresh was requested. The
  // skeleton/stale-data decision is made synchronously in `go` (and on refresh
  // we keep stale data visible), so this effect only performs the async fetch.
  useEffect(() => {
    const k = keyOf(year, month);
    const refreshed = refreshSignal !== lastSignal.current;
    if (refreshed) lastSignal.current = refreshSignal;
    if (cache.has(k) && !refreshed) return;

    let alive = true;
    fetch(`/api/reports?month=${k}`)
      .then((r) => r.json())
      .then((json: { days: DaySummary[] }) => {
        if (!alive) return;
        cache.set(k, json.days);
        setDays(json.days);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [year, month, refreshSignal, cache]);

  const go = useCallback(
    (delta: number) => {
      if (delta > 0 && atCurrent) return; // never scroll into the future
      const next = shiftMonth(year, month, delta);
      setDirection(delta);
      setYM(next);
      // Show cached data immediately, or a skeleton until the fetch lands —
      // never a frame of the previous month.
      setDays(cache.get(keyOf(next.year, next.month)) ?? null);
    },
    [year, month, atCurrent, cache],
  );

  const variants = {
    enter: (dir: number) => ({ x: reduced ? 0 : dir > 0 ? 64 : -64, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: reduced ? 0 : dir > 0 ? -64 : 64, opacity: 0 }),
  };

  return (
    <section className="rounded-(--radius) border border-border bg-panel">
      {/* header / controls */}
      <header className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <button
          type="button"
          onClick={() => go(-1)}
          className="grid size-9 place-items-center rounded-md border border-border text-text-2 transition-colors duration-120 hover:border-text-muted active:bg-panel-2"
          aria-label="Previous month"
        >
          <Chevron dir="left" />
        </button>

        <div className="flex flex-col items-center">
          <span className="font-ui text-[15px] font-semibold tracking-[0.14em] text-text">
            {formatMonthLabel(year, month)}
          </span>
          <span className="font-tele text-[10px] tracking-[0.12em] text-text-muted">
            {loading ? "SYNCING…" : "LOG"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          disabled={atCurrent}
          className="grid size-9 place-items-center rounded-md border border-border text-text-2 transition-colors duration-120 enabled:hover:border-text-muted enabled:active:bg-panel-2 disabled:text-text-disabled disabled:opacity-40"
          aria-label="Next month"
        >
          <Chevron dir="right" />
        </button>
      </header>

      {/* swipeable grid */}
      <div className="overflow-hidden px-3 py-3">
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={keyOf(year, month)}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduced ? 0 : 0.25, ease: [0.2, 0.9, 0.25, 1] }}
            drag={reduced ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(1);
              else if (info.offset.x > 60) go(-1);
            }}
            className="touch-pan-y"
          >
            {days ? (
              <CalendarModule days={days} animate />
            ) : (
              <CalendarSkeleton year={year} month1={month} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* affordance dots */}
      <div className="flex items-center justify-center gap-1.5 pb-3">
        <Dot />
        <Dot active />
        <Dot dim={atCurrent} />
      </div>
    </section>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

function Dot({ active, dim }: { active?: boolean; dim?: boolean }) {
  return (
    <span
      className={clsx(
        "size-1.5 rounded-full",
        active ? "bg-border-active" : dim ? "bg-border-muted" : "bg-border",
      )}
    />
  );
}
