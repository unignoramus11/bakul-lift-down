// ─── Domain types + status logic ─────────────────────────────────────────────
// The lift is the asset. Each report is an observation. A day's status is
// decided by its *latest* observation; a day with no observations is treated
// as OPERATIONAL (green functional stamp), and a day that hasn't happened yet
// is EMPTY (muted placeholder, no stamp).

import { dateKeyIST, isFutureKey } from "./time";

export type ReportKind = "DOWN" | "RESTORED";

export type ReportDTO = {
  id: string;
  kind: ReportKind;
  imageData: string; // full data URL, e.g. "data:image/webp;base64,..."
  imageMime: string;
  imageBytes: number;
  note: string | null;
  dateKey: string;
  createdAt: string; // ISO instant (UTC)
};

export type DayStatus = "DOWN" | "OPERATIONAL" | "EMPTY";

export type DaySummary = {
  dateKey: string;
  status: DayStatus;
  reportCount: number;
  downCount: number;
  restoredCount: number;
  /** A randomly chosen report image for the day, or null if there were none. */
  thumb: string | null;
  /** ISO instant of the most recent report that day, or null. */
  lastReportAt: string | null;
};

/** Latest-observation-wins status for a set of reports on one day. */
export function statusFromReports(reports: ReportDTO[]): DayStatus {
  if (reports.length === 0) return "OPERATIONAL";
  const latest = latestReport(reports);
  return latest.kind === "DOWN" ? "DOWN" : "OPERATIONAL";
}

/** Most recent report by wall-clock instant. Assumes non-empty. */
export function latestReport(reports: ReportDTO[]): ReportDTO {
  return reports.reduce((a, b) =>
    new Date(b.createdAt) > new Date(a.createdAt) ? b : a,
  );
}

/**
 * Build the calendar summary for a single day.
 * `pickThumb` lets the server choose a random image; defaults to random.
 */
export function computeDaySummary(
  dateKey: string,
  reports: ReportDTO[],
  pickThumb: (rs: ReportDTO[]) => ReportDTO | null = randomThumb,
): DaySummary {
  if (reports.length === 0) {
    return {
      dateKey,
      status: isFutureKey(dateKey) ? "EMPTY" : "OPERATIONAL",
      reportCount: 0,
      downCount: 0,
      restoredCount: 0,
      thumb: null,
      lastReportAt: null,
    };
  }
  const downCount = reports.filter((r) => r.kind === "DOWN").length;
  const chosen = pickThumb(reports);
  return {
    dateKey,
    status: statusFromReports(reports),
    reportCount: reports.length,
    downCount,
    restoredCount: reports.length - downCount,
    thumb: chosen?.imageData ?? null,
    lastReportAt: latestReport(reports).createdAt,
  };
}

function randomThumb(rs: ReportDTO[]): ReportDTO | null {
  if (rs.length === 0) return null;
  return rs[Math.floor(Math.random() * rs.length)];
}

/** Group a flat list of reports by their dateKey. */
export function groupByDay(reports: ReportDTO[]): Map<string, ReportDTO[]> {
  const map = new Map<string, ReportDTO[]>();
  for (const r of reports) {
    const arr = map.get(r.dateKey);
    if (arr) arr.push(r);
    else map.set(r.dateKey, [r]);
  }
  return map;
}

export type LiveStatus = {
  status: "DOWN" | "OPERATIONAL";
  /** ISO instant the current state began (the latest report today), or null. */
  since: string | null;
  isDown: boolean;
  /** Reports filed today. */
  todayCount: number;
};

/** Today's live status for the hero module. */
export function liveStatusFromToday(todayReports: ReportDTO[]): LiveStatus {
  const status = statusFromReports(todayReports);
  const since =
    todayReports.length > 0 ? latestReport(todayReports).createdAt : null;
  return {
    status: status === "DOWN" ? "DOWN" : "OPERATIONAL",
    since,
    isDown: status === "DOWN",
    todayCount: todayReports.length,
  };
}

export const todayKey = () => dateKeyIST();
