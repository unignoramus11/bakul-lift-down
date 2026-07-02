"use client";

import Link from "next/link";
import { clsx } from "@/lib/clsx";
import type { DaySummary } from "@/lib/reports";
import { setSlotOrigin } from "@/lib/slotOrigin";
import { parseDateKey } from "@/lib/time";
import { Stamp } from "./Stamp";

// One day on the mission timeline. Whole cell is the tap target (min 44px);
// today gets the active border + slow breathing glow.

/** Stable per-day rotation in the design's 5–10° range (both signs). */
function seededRotation(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  const mag = 5 + (Math.abs(h) % 6); // 5..10
  return h % 2 === 0 ? mag : -mag;
}

export function DayCell({
  summary,
  today,
  animate,
}: {
  summary: DaySummary;
  today?: boolean;
  animate?: boolean;
}) {
  const { day } = parseDateKey(summary.dateKey);
  const isEmpty = summary.status === "EMPTY";

  return (
    <Link
      href={`/date/${summary.dateKey}`}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setSlotOrigin({ left: r.left, top: r.top, width: r.width, height: r.height });
      }}
      aria-label={`${summary.dateKey}: ${summary.status.toLowerCase()}, ${summary.reportCount} report${
        summary.reportCount === 1 ? "" : "s"
      }`}
      className={clsx(
        "group relative block aspect-square min-h-11 overflow-hidden rounded-md border",
        "transition-[border-color] duration-120",
        today
          ? "border-border-active breathe z-10"
          : "border-border hover:border-text-muted",
      )}
    >
      <Stamp
        status={summary.status}
        photo={summary.thumb}
        size="sm"
        // Only today's stamp "lands" with animation; other days appear settled.
        animate={animate && !!today && !isEmpty}
        rotation={seededRotation(summary.dateKey)}
        alt={`Lift on ${summary.dateKey}`}
      />

      {/* day number — burnt-in top-left, CCTV overlay style */}
      <span
        className={clsx(
          "absolute left-1 top-0.5 z-10 font-tele text-[10px] leading-none",
          "px-1 py-0.5 rounded-[3px]",
          isEmpty ? "text-text-disabled" : "bg-black/45 text-text-2",
        )}
      >
        {String(day).padStart(2, "0")}
      </span>

      {/* per-kind counts — bottom-right telemetry */}
      {summary.reportCount > 0 ? (
        <span className="absolute bottom-0.5 right-1 z-10 flex items-center gap-1 rounded-[3px] bg-black/60 px-1 py-0.5 font-tele text-[9px] leading-none">
          {summary.downCount > 0 ? (
            <span className="text-danger">{summary.downCount}↓</span>
          ) : null}
          {summary.restoredCount > 0 ? (
            <span className="text-warning">{summary.restoredCount}↺</span>
          ) : null}
        </span>
      ) : null}
    </Link>
  );
}
