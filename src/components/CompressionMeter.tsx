"use client";

import { Progress } from "@ark-ui/react/progress";
import { clsx } from "@/lib/clsx";
import { formatKB } from "@/lib/compress";

// Telemetry-style compression readout: the KB number ticks down toward the
// target as compression runs — tied to the real value, not a fake spinner.
// e.g.  COMPRESSING…  41.0 KB → 18.2 KB
export function CompressionMeter({
  percent,
  originalBytes,
  currentBytes,
  done,
  tone = "down",
}: {
  percent: number;
  originalBytes: number;
  currentBytes: number | null;
  done: boolean;
  tone?: "down" | "restored";
}) {
  const accent =
    tone === "down" ? "var(--color-stamp-down)" : "var(--color-stamp-op)";

  return (
    <div className="rounded-[6px] border border-border bg-bg-2 p-3">
      <div className="mb-2 flex items-center justify-between font-tele text-[11px] tracking-[0.1em] text-text-muted">
        <span>{done ? "COMPRESSED" : "COMPRESSING…"}</span>
        <span className="text-text-2">
          {formatKB(originalBytes)}
          <span className="mx-1 text-text-muted">→</span>
          <span style={{ color: accent }}>
            {currentBytes != null ? formatKB(currentBytes) : "—"}
          </span>
        </span>
      </div>

      <Progress.Root
        value={Math.round(percent)}
        min={0}
        max={100}
        className="w-full"
      >
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
