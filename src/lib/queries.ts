// ─── Data access ─────────────────────────────────────────────────────────────
// Shared by server components (initial render) and API routes (client refetch /
// month switching / polling). All IST derivation lives here so the DB only ever
// holds UTC instants + a precomputed IST dateKey.

import "server-only";
import { prisma } from "./db";
import {
  type DaySummary,
  type LiveStatus,
  type ReportDTO,
  type ReportKind,
  computeDaySummary,
  groupByDay,
  liveStatusFromToday,
} from "./reports";
import { daysInMonthKeys, dateKeyIST } from "./time";

type Row = {
  id: string;
  kind: ReportKind;
  imageData: string;
  imageMime: string;
  imageBytes: number;
  note: string | null;
  dateKey: string;
  createdAt: Date;
};

function toDTO(row: Row): ReportDTO {
  return {
    id: row.id,
    kind: row.kind,
    imageData: row.imageData,
    imageMime: row.imageMime,
    imageBytes: row.imageBytes,
    note: row.note,
    dateKey: row.dateKey,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Per-day calendar summaries for a whole IST month (thumbs chosen at random). */
export async function getMonthSummaries(
  year: number,
  month1: number,
): Promise<DaySummary[]> {
  const prefix = `${year}-${String(month1).padStart(2, "0")}`;
  const rows = (await prisma.report.findMany({
    where: { dateKey: { startsWith: prefix } },
    orderBy: { createdAt: "asc" },
  })) as Row[];

  const byDay = groupByDay(rows.map(toDTO));
  return daysInMonthKeys(year, month1).map((key) =>
    computeDaySummary(key, byDay.get(key) ?? []),
  );
}

/** All reports across an inclusive IST date range, oldest first (for exports). */
export async function getRangeReports(
  fromKey: string,
  toKey: string,
): Promise<ReportDTO[]> {
  const [lo, hi] = fromKey <= toKey ? [fromKey, toKey] : [toKey, fromKey];
  const rows = (await prisma.report.findMany({
    where: { dateKey: { gte: lo, lte: hi } },
    orderBy: { createdAt: "asc" },
  })) as Row[];
  return rows.map(toDTO);
}

/** All reports for one IST day, newest first (for the timeline). */
export async function getDayReports(dateKey: string): Promise<ReportDTO[]> {
  const rows = (await prisma.report.findMany({
    where: { dateKey },
    orderBy: { createdAt: "desc" },
  })) as Row[];
  return rows.map(toDTO);
}

/** Today's live status for the hero. */
export async function getTodayLive(): Promise<LiveStatus> {
  const today = dateKeyIST();
  const rows = (await prisma.report.findMany({
    where: { dateKey: today },
  })) as Row[];
  return liveStatusFromToday(rows.map(toDTO));
}

export type CreateReportInput = {
  kind: ReportKind;
  imageData: string;
  imageMime: string;
  imageBytes: number;
  note?: string | null;
};

/** File a new report. Server stamps the IST dateKey and the UTC instant. */
export async function createReport(
  input: CreateReportInput,
): Promise<ReportDTO> {
  const now = new Date();
  const row = (await prisma.report.create({
    data: {
      kind: input.kind,
      imageData: input.imageData,
      imageMime: input.imageMime,
      imageBytes: input.imageBytes,
      note: input.note?.trim() ? input.note.trim() : null,
      dateKey: dateKeyIST(now),
      createdAt: now,
    },
  })) as Row;
  return toDTO(row);
}
