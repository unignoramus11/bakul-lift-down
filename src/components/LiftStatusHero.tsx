import { clsx } from "@/lib/clsx";
import type { LiveStatus } from "@/lib/reports";
import { formatISTHM } from "@/lib/time";
import { Badge } from "./ui/Badge";

// The hero module: today's status as a large stamp-style badge, full width,
// with a subtle alert treatment when the lift is currently down.
export function LiftStatusHero({ live }: { live: LiveStatus }) {
  const down = live.isDown;
  const sinceHM = live.since ? formatISTHM(new Date(live.since)) : null;

  return (
    <section
      className={clsx(
        "rounded-[var(--radius)] border bg-panel",
        down ? "border-border-alert" : "border-border",
      )}
    >
      <header className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="font-ui text-[13px] font-semibold tracking-[0.14em] text-text-2 uppercase">
          Lift Status
        </span>
        <Badge tone={down ? "down" : "operational"} dot pulse={down}>
          {down ? "Live · Down" : "Live · Up"}
        </Badge>
      </header>

      <div className="flex items-center justify-between gap-4 px-4 py-5">
        <div className="min-w-0">
          <div
            className="font-ui text-[28px] font-semibold leading-none tracking-[0.02em]"
            style={{ color: down ? "var(--color-stamp-down)" : "var(--color-stamp-op)" }}
          >
            {down ? "DOWN" : "OPERATIONAL"}
          </div>
          <div className="mt-2 font-tele text-[12px] tracking-[0.04em] text-text-muted">
            {down
              ? sinceHM
                ? `REPORTED DOWN AS OF ${sinceHM} IST`
                : "REPORTED DOWN"
              : live.todayCount > 0
                ? sinceHM
                  ? `RESTORED · LAST OBSERVED ${sinceHM} IST`
                  : "NO OPEN INCIDENT"
                : "NO OPEN INCIDENT"}
          </div>
        </div>

        {/* standalone stamp-style mark */}
        <div
          className={clsx(
            "shrink-0 rotate-[-7deg] rounded-[3px] border-[3px] px-3 py-1.5",
            "font-tele text-[13px] font-medium uppercase tracking-[0.22em]",
          )}
          style={{
            color: down ? "var(--color-stamp-down)" : "var(--color-stamp-op)",
            borderColor: down ? "var(--color-stamp-down)" : "var(--color-stamp-op)",
            opacity: 0.82,
            filter: "url(#stamp-rough-sm)",
          }}
          aria-hidden
        >
          {down ? "DOWN" : "OK"}
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-border px-4 py-2.5 font-tele text-[11px] tracking-[0.08em] text-text-muted">
        <span>REPORTS TODAY</span>
        <span className="text-text-2">{String(live.todayCount).padStart(2, "0")}</span>
      </footer>
    </section>
  );
}
