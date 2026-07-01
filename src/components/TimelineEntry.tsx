"use client";

import { motion } from "motion/react";
import type { ReportDTO } from "@/lib/reports";
import { formatISTTime } from "@/lib/time";
import { Stamp } from "./Stamp";
import { Badge } from "./ui/Badge";
import { useImageViewer } from "./ImageViewer";
import { useMotionPrefs } from "./MotionPrefsProvider";

// One field observation on the day's timeline. Rises + fades in, staggered,
// like a security log printing itself out line by line.
export function TimelineEntry({
  report,
  index,
  ordinal,
  last,
}: {
  report: ReportDTO;
  index: number; // display position (0 = top / newest)
  ordinal: number; // chronological id, 1 = first report of the day
  last: boolean;
}) {
  const { reduced } = useMotionPrefs();
  const openImage = useImageViewer();
  const down = report.kind === "DOWN";
  const when = new Date(report.createdAt);

  return (
    <motion.li
      className="relative flex gap-3 pl-1"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: reduced ? 0.15 : 0.28,
        delay: reduced ? 0 : Math.min(index, 8) * 0.04,
        ease: [0.2, 0.9, 0.25, 1],
      }}
    >
      {/* rail */}
      <div className="relative flex w-3 shrink-0 flex-col items-center">
        <span
          className="mt-1.5 size-2 shrink-0 rounded-full"
          style={{
            background: down ? "var(--color-danger)" : "var(--color-success)",
          }}
        />
        {!last ? <span className="w-px flex-1 bg-border" /> : null}
      </div>

      {/* module */}
      <div className="mb-3 flex-1 overflow-hidden rounded-[var(--radius)] border border-border bg-panel">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="font-tele text-[12px] tracking-[0.12em] text-text-2">
            REPORT #{String(ordinal).padStart(2, "0")}
          </span>
          <span className="font-tele text-[11px] tracking-[0.06em] text-text-muted tabular-nums">
            {formatISTTime(when)}
          </span>
        </div>

        <div className="flex gap-3 p-3">
          <button
            type="button"
            onClick={() =>
              openImage(
                report.imageData,
                `REPORT #${String(ordinal).padStart(2, "0")} · ${formatISTTime(when)}`,
              )
            }
            aria-label="View full photo"
            className="relative aspect-square w-24 shrink-0 cursor-zoom-in overflow-hidden rounded-[6px] border border-border"
          >
            <Stamp
              status={down ? "DOWN" : "RESTORED"}
              photo={report.imageData}
              size="sm"
              alt={`Report ${ordinal}`}
            />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone={down ? "down" : "restored"} dot>
                {down ? "DOWN → REPORTED" : "RESTORED"}
              </Badge>
            </div>

            {report.note ? (
              <p className="mt-2 font-body text-[13px] leading-snug text-text-2">
                {report.note}
              </p>
            ) : (
              <p className="mt-2 font-tele text-[11px] tracking-[0.06em] text-text-disabled">
                NO NOTE ATTACHED
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.li>
  );
}
