import { daysInMonthKeys, weekdayOfKey } from "@/lib/time";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

// Placeholder grid shown while a month's data loads — matches the real month's
// cell count and leading offset so the layout doesn't jump when data arrives.
export function CalendarSkeleton({
  year,
  month1,
}: {
  year: number;
  month1: number;
}) {
  const keys = daysInMonthKeys(year, month1);
  const leading = keys.length > 0 ? weekdayOfKey(keys[0]) : 0;

  return (
    <div aria-hidden>
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
          <div key={`b${i}`} />
        ))}
        {keys.map((k) => (
          <div
            key={k}
            className="aspect-square min-h-11 animate-pulse rounded-md border border-border bg-border-muted/50 motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}
