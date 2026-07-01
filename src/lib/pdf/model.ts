// Pure report model for the PDF export — no rendering, no browser APIs.
import {
  type DayStatus,
  type ReportDTO,
  latestReport,
  statusFromReports,
} from "../reports";
import { dayKeysBetween, isFutureKey } from "../time";

export type DayGroup = {
  dateKey: string;
  status: DayStatus;
  reports: ReportDTO[]; // chronological (oldest first)
};

export type ReportStats = {
  from: string;
  to: string;
  totalDays: number;
  observedDays: number; // days that have actually occurred
  downDays: number;
  operationalDays: number;
  totalReports: number;
  downReports: number;
  restoreReports: number;
  uptimePct: number; // over observed days
  longestDownStreak: number; // consecutive down days
};

export type ReportModel = {
  stats: ReportStats;
  days: DayGroup[];
  incidentDays: DayGroup[]; // days that carry at least one report
};

export function buildReportModel(
  from: string,
  to: string,
  reports: ReportDTO[],
): ReportModel {
  const byDay = new Map<string, ReportDTO[]>();
  for (const r of reports) {
    const arr = byDay.get(r.dateKey);
    if (arr) arr.push(r);
    else byDay.set(r.dateKey, [r]);
  }

  const keys = dayKeysBetween(from, to);
  const days: DayGroup[] = keys.map((dateKey) => {
    const rs = (byDay.get(dateKey) ?? []).sort(
      (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
    );
    const status: DayStatus =
      rs.length > 0
        ? statusFromReports(rs)
        : isFutureKey(dateKey)
          ? "EMPTY"
          : "OPERATIONAL";
    return { dateKey, status, reports: rs };
  });

  const observed = days.filter((d) => d.status !== "EMPTY");
  const downDays = observed.filter((d) => d.status === "DOWN").length;
  const operationalDays = observed.length - downDays;
  const downReports = reports.filter((r) => r.kind === "DOWN").length;

  // longest run of consecutive DOWN days
  let streak = 0;
  let longest = 0;
  for (const d of days) {
    if (d.status === "DOWN") {
      streak += 1;
      longest = Math.max(longest, streak);
    } else {
      streak = 0;
    }
  }

  const stats: ReportStats = {
    from,
    to,
    totalDays: days.length,
    observedDays: observed.length,
    downDays,
    operationalDays,
    totalReports: reports.length,
    downReports,
    restoreReports: reports.length - downReports,
    uptimePct:
      observed.length > 0
        ? Math.round((operationalDays / observed.length) * 1000) / 10
        : 100,
    longestDownStreak: longest,
  };

  return {
    stats,
    days,
    incidentDays: days.filter((d) => d.reports.length > 0),
  };
}

export { latestReport };
