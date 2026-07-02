"use client";

import { DatePicker } from "@ark-ui/react/date-picker";
import { Portal } from "@ark-ui/react/portal";
import { type DateValue, parseDate } from "@internationalized/date";
import { useState } from "react";
import { formatDateKey } from "@/lib/time";

// A dark, monospace date-range picker built on Ark UI's DatePicker (range
// mode) — accessible + keyboard-navigable out of the box, styled to match the
// calendar. One field selects the whole FROM→TO range in a single popover.
export function RangeDatePicker({
  from,
  to,
  max,
  onChange,
}: {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  max: string; // latest selectable day (today)
  onChange: (from: string, to: string) => void;
}) {
  // Track the in-progress selection locally. A range needs two clicks, so the
  // controlled value must reflect the intermediate one-date state — otherwise
  // the first click is discarded and a range can never be picked. Open state is
  // left to Ark (uncontrolled) so its Presence sequences the enter/exit
  // animations correctly; closeOnSelect handles closing on a complete range.
  const [value, setValue] = useState<DateValue[]>(() => [
    parseDate(from),
    parseDate(to),
  ]);

  return (
    <DatePicker.Root
      onOpenChange={(e) => {
        // Discard a half-finished pick when closing without completing it.
        if (!e.open && value.length !== 2) {
          setValue([parseDate(from), parseDate(to)]);
        }
      }}
      selectionMode="range"
      fixedWeeks
      startOfWeek={0}
      value={value}
      max={parseDate(max)}
      onValueChange={(d) => {
        setValue(d.value);
        if (d.value.length === 2) {
          // Use the CalendarDate's ISO toString() ("YYYY-MM-DD") — valueAsString
          // is locale-formatted and won't parse. Sorting ISO strings is
          // chronological.
          const [a, b] = d.value.map((v) => v.toString()).sort();
          onChange(a, b);
        }
      }}
      positioning={{ placement: "bottom-start", gutter: 6 }}
    >
      <DatePicker.Control>
        <DatePicker.Trigger asChild>
          <button
            type="button"
            className="flex min-h-12 w-full items-center justify-between gap-2 rounded-md border border-border bg-bg-2 px-3 font-tele text-[13px] text-text transition-colors duration-120 hover:border-text-muted data-[state=open]:border-border-active"
          >
            <span className="flex items-center gap-2">
              <CalendarGlyph />
              <span className="tabular-nums">{formatDateKey(from)}</span>
              <span className="text-text-muted">→</span>
              <span className="tabular-nums">{formatDateKey(to)}</span>
            </span>
            <ChevronDown />
          </button>
        </DatePicker.Trigger>
      </DatePicker.Control>

      <Portal>
        <DatePicker.Positioner>
          <DatePicker.Content className="z-60 rounded-lg border border-border bg-panel-2 p-3 shadow-none focus:outline-none data-[state=open]:animate-[viewer-in_180ms_cubic-bezier(0.2,0.9,0.25,1)] data-[state=closed]:animate-[viewer-out_140ms_ease-in]">
            <DatePicker.View view="day">
              <DatePicker.Context>
                {(api) => (
                  <>
                    <div className="mb-2 flex items-center justify-between">
                      <DatePicker.PrevTrigger className="grid size-8 place-items-center rounded-md border border-border text-text-2 transition-colors hover:border-text-muted">
                        <Chevron dir="left" />
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger className="rounded-md px-2 py-1 font-ui text-[13px] font-semibold tracking-widest text-text transition-colors hover:bg-panel">
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger className="grid size-8 place-items-center rounded-md border border-border text-text-2 transition-colors hover:border-text-muted">
                        <Chevron dir="right" />
                      </DatePicker.NextTrigger>
                    </div>

                    <DatePicker.Table className="w-full border-separate border-spacing-0">
                      <DatePicker.TableHead>
                        <DatePicker.TableRow>
                          {api.weekDays.map((wd, i) => (
                            <DatePicker.TableHeader
                              key={i}
                              className="pb-1.5 text-center font-tele text-[11px] font-normal text-text-muted"
                            >
                              {wd.narrow}
                            </DatePicker.TableHeader>
                          ))}
                        </DatePicker.TableRow>
                      </DatePicker.TableHead>
                      <DatePicker.TableBody>
                        {api.weeks.map((week, i) => (
                          <DatePicker.TableRow key={i}>
                            {week.map((day, j) => (
                              <DatePicker.TableCell key={j} value={day} className="p-0">
                                <DatePicker.TableCellTrigger className="dp-cell">
                                  {day.day}
                                </DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal>
    </DatePicker.Root>
  );
}

function CalendarGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-text-muted">
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 9h17M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}
function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-text-muted">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}
function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}
