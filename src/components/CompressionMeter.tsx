"use client";

import { clsx } from "@/lib/clsx";
import { Progress } from "@ark-ui/react/progress";

// Simple processing readout while the photo is prepared — a progress bar, no
// engineering internals.
export function CompressionMeter({
  percent,
  done,
  tone = "down",
}: {
  percent: number;
  done: boolean;
  tone?: "down" | "restored";
}) {
  const accent =
    tone === "down" ? "var(--color-stamp-down)" : "var(--color-stamp-restored)";

  return (
    <div className="rounded-md border border-border bg-bg-2 p-3">
      <div className="mb-2 flex items-center justify-between font-tele text-[11px] tracking-widest text-text-muted">
        <span>{done ? "PHOTO READY" : "PROCESSING PHOTO…"}</span>
        {done ? <span style={{ color: accent }}>OK</span> : null}
      </div>

      <Progress.Root value={Math.round(percent)} min={0} max={100} className="w-full">
        <Progress.Track className="h-1.5 w-full overflow-hidden rounded-full bg-border-muted">
          <Progress.Range
            className={clsx("h-full transition-[width] duration-150 ease-linear")}
            style={{ width: `${Math.max(0, Math.min(100, percent))}%`, background: accent }}
          />
        </Progress.Track>
      </Progress.Root>
    </div>
  );
}
