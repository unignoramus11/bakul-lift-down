import type { DaySummary } from "@/lib/reports";
import { dateKeyIST, weekdayOfKey } from "@/lib/time";
import { DayCell } from "./DayCell";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

// A single IST month as a 7-column grid. Weekday header, leading blanks to
// align the first day, then one DayCell per date. Visually identical across
// breakpoints — just given more room on desktop.

export function CalendarModule({
  days,
  animate,
}: {
  days: DaySummary[];
  animate?: boolean;
}) {
  const today = dateKeyIST();
  const leading = days.length > 0 ? weekdayOfKey(days[0].dateKey) : 0;

  return (
    <div>
      <div className="mb-1.5 grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            className="text-center font-tele text-[11px] tracking-widest text-text-muted"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: leading }).map((_, i) => (
          <div key={`b${i}`} aria-hidden />
        ))}
        {days.map((summary) => (
          <DayCell
            key={summary.dateKey}
            summary={summary}
            today={summary.dateKey === today}
            animate={animate}
          />
        ))}
      </div>
    </div>
  );
}
