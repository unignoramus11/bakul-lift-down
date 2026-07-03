// Single source of truth for how each day-status looks and reads. Keeps the
// stamp, badges, calendar, hero, timeline and PDF perfectly in sync.
import type { DayStatus } from "./reports";

type Tone = "down" | "restored" | "operational" | "offline";

export const STATUS_LABEL: Record<DayStatus, string> = {
  DOWN: "DOWN",
  RESTORED: "RESTORED",
  CLEAR: "CLEAR",
  EMPTY: "NO DATA",
};

export const STATUS_INK: Record<DayStatus, string> = {
  DOWN: "var(--color-stamp-down)",
  RESTORED: "var(--color-stamp-restored)",
  CLEAR: "var(--color-stamp-clear)",
  EMPTY: "var(--color-offline)",
};

export const STATUS_HALO: Record<DayStatus, string> = {
  DOWN: "rgba(255,77,103,0.15)",
  RESTORED: "rgba(255,200,87,0.15)",
  CLEAR: "rgba(68,209,122,0.15)",
  EMPTY: "rgba(95,107,122,0.12)",
};

export const STATUS_TONE: Record<DayStatus, Tone> = {
  DOWN: "down",
  RESTORED: "restored",
  CLEAR: "operational",
  EMPTY: "offline",
};
