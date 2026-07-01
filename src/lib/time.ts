// ─── IST time utilities ──────────────────────────────────────────────────────
// The whole app speaks IST (Asia/Kolkata, UTC+5:30). Instants are stored as UTC
// in the DB; every human-facing value is derived here in IST. We lean on the
// Intl engine's timezone database rather than hand-rolling a +5:30 offset so
// there's a single, correct source of truth.

export const IST_TZ = "Asia/Kolkata";

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
] as const;

type ISTParts = {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number;
  second: number;
  weekday: number; // 0 = Sunday .. 6 = Saturday
};

const partsFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: IST_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  weekday: "short",
  hour12: false,
});

const WEEKDAYS: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

/** Break an instant into its IST wall-clock components. */
export function istParts(date: Date = new Date()): ISTParts {
  const map: Record<string, string> = {};
  for (const p of partsFmt.formatToParts(date)) map[p.type] = p.value;
  // Intl emits "24" for midnight under hour12:false on some engines.
  const hour = map.hour === "24" ? 0 : Number(map.hour);
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour,
    minute: Number(map.minute),
    second: Number(map.second),
    weekday: WEEKDAYS[map.weekday] ?? 0,
  };
}

/** IST calendar day as "YYYY-MM-DD" — the grouping key used across the app. */
export function dateKeyIST(date: Date = new Date()): string {
  const { year, month, day } = istParts(date);
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** "01 JUL 2026" */
export function formatISTDate(date: Date): string {
  const { year, month, day } = istParts(date);
  return `${pad(day)} ${MONTHS[month - 1]} ${year}`;
}

/** "04:12:08 IST" (seconds optional) */
export function formatISTTime(date: Date, withSeconds = true): string {
  const { hour, minute, second } = istParts(date);
  const core = withSeconds
    ? `${pad(hour)}:${pad(minute)}:${pad(second)}`
    : `${pad(hour)}:${pad(minute)}`;
  return `${core} IST`;
}

/** "04:12" — no unit, for compact readouts. */
export function formatISTHM(date: Date): string {
  const { hour, minute } = istParts(date);
  return `${pad(hour)}:${pad(minute)}`;
}

/** Full stamp line: "01 JUL 2026 · 04:12:08 IST" */
export function formatISTStamp(date: Date): string {
  return `${formatISTDate(date)} · ${formatISTTime(date)}`;
}

/** Month label for headers: "JULY 2026" */
export function formatMonthLabel(year: number, month1: number): string {
  const long = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
  ];
  return `${long[month1 - 1]} ${year}`;
}

/** Parse a "YYYY-MM-DD" key into numeric parts. */
export function parseDateKey(key: string): { year: number; month: number; day: number } {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month, day };
}

/** Pretty a date key without needing a Date: "01 JUL 2026". */
export function formatDateKey(key: string): string {
  const { year, month, day } = parseDateKey(key);
  return `${pad(day)} ${MONTHS[month - 1]} ${year}`;
}

/** IST weekday (0=Sun) for a "YYYY-MM-DD" key. */
export function weekdayOfKey(key: string): number {
  const { year, month, day } = parseDateKey(key);
  // Noon IST → subtract offset to land on the correct UTC instant, then read
  // the weekday. Using noon avoids any DST/boundary edge (India has none, but
  // this keeps the helper robust regardless).
  const utc = Date.UTC(year, month - 1, day, 12 - 5, -30);
  return new Date(utc).getUTCDay();
}

/** All day-keys ("YYYY-MM-DD") in a given IST month, in order. */
export function daysInMonthKeys(year: number, month1: number): string[] {
  const count = new Date(year, month1, 0).getDate(); // month1 is 1-based
  const keys: string[] = [];
  for (let d = 1; d <= count; d++) keys.push(`${year}-${pad(month1)}-${pad(d)}`);
  return keys;
}

/** Current IST year/month, e.g. for the calendar's initial page. */
export function currentMonthIST(): { year: number; month: number } {
  const { year, month } = istParts();
  return { year, month };
}

/** Shift a year/month by n months. */
export function shiftMonth(year: number, month1: number, delta: number): { year: number; month: number } {
  const zero = year * 12 + (month1 - 1) + delta;
  return { year: Math.floor(zero / 12), month: (zero % 12) + 1 };
}

/** Inclusive list of day-keys from `from` to `to` (order-normalized). */
export function dayKeysBetween(from: string, to: string): string[] {
  const [lo, hi] = from <= to ? [from, to] : [to, from];
  const start = parseDateKey(lo);
  const end = parseDateKey(hi);
  const keys: string[] = [];
  const d = new Date(Date.UTC(start.year, start.month - 1, start.day));
  const endUtc = Date.UTC(end.year, end.month - 1, end.day);
  // Cap to avoid pathological ranges.
  let guard = 0;
  while (d.getTime() <= endUtc && guard < 3660) {
    keys.push(
      `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    );
    d.setUTCDate(d.getUTCDate() + 1);
    guard++;
  }
  return keys;
}

/** Is this key today (IST)? */
export function isTodayKey(key: string): boolean {
  return key === dateKeyIST();
}

/** Is this key in the future relative to now (IST)? */
export function isFutureKey(key: string): boolean {
  return key > dateKeyIST();
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
