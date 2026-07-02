import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarBackLink } from "@/components/CalendarBackLink";
import { PhotoZoom } from "@/components/PhotoZoom";
import { SlotReveal } from "@/components/SlotReveal";
import { Stamp } from "@/components/Stamp";
import { StatusStrip } from "@/components/StatusStrip";
import { TimelineEntry } from "@/components/TimelineEntry";
import { Badge } from "@/components/ui/Badge";
import { getDayReports } from "@/lib/queries";
import {
  type DayStatus,
  latestReport,
  statusFromReports,
} from "@/lib/reports";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/status-style";
import { formatDateKey, isFutureKey } from "@/lib/time";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  if (!DATE_RE.test(date)) return { title: "Unknown date · BAKUL LIFT DOWN" };
  const pretty = formatDateKey(date);
  return {
    title: `${pretty} · BAKUL LIFT DOWN`,
    description: `Log of the Bakul Hostel lift on ${pretty}. Reports, photos and status changes.`,
    alternates: { canonical: `/date/${date}` },
  };
}

export default async function DateDetail({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!DATE_RE.test(date)) notFound();

  const reports = await getDayReports(date); // newest first
  const total = reports.length;
  const downCount = reports.filter((r) => r.kind === "DOWN").length;
  const restoredCount = total - downCount;
  const status: DayStatus =
    total > 0 ? statusFromReports(reports) : isFutureKey(date) ? "EMPTY" : "CLEAR";
  const heroPhoto = total > 0 ? latestReport(reports).imageData : null;
  const down = status === "DOWN";

  return (
    <>
      <StatusStrip />
      <SlotReveal fallbackHref={`/?m=${date.slice(0, 7)}`}>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-3 pb-16">
        {/* back + classification */}
        <div className="mb-3 flex items-center justify-between">
          <CalendarBackLink href={`/?m=${date.slice(0, 7)}`} />
          <span className="font-tele text-[10px] tracking-[0.16em] text-text-disabled">
            LOG
          </span>
        </div>

        {/* case-file header */}
        <section className="mb-4 overflow-hidden rounded-(--radius) border border-border bg-panel">
          <div className="relative aspect-16/7 w-full bg-black">
            {status === "EMPTY" ? (
              <div className="grid size-full place-items-center font-tele text-[12px] tracking-[0.12em] text-text-disabled">
                NO DATA — DATE NOT YET REACHED
              </div>
            ) : (
              <PhotoZoom src={heroPhoto} caption={formatDateKey(date)} className="size-full">
                <Stamp
                  status={status}
                  photo={heroPhoto}
                  size="lg"
                  rotation={-7}
                  alt={`Lift status on ${formatDateKey(date)}`}
                />
              </PhotoZoom>
            )}
            <span className="absolute left-2 top-2 z-10 rounded-[3px] bg-black/60 px-1.5 py-0.5 font-tele text-[10px] tracking-widest text-text-2">
              {formatDateKey(date)}
            </span>
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="font-ui text-[22px] font-semibold leading-none tracking-[0.02em] text-text">
                {formatDateKey(date)}
              </div>
              <div className="mt-1.5 flex items-center gap-2.5 font-tele text-[11px] tracking-[0.08em] text-text-muted">
                <span>
                  {total} REPORT{total === 1 ? "" : "S"}
                </span>
                {downCount > 0 ? (
                  <span className="text-danger">{downCount}↓ DOWN</span>
                ) : null}
                {restoredCount > 0 ? (
                  <span className="text-warning">{restoredCount}↺ RESTORED</span>
                ) : null}
              </div>
            </div>
            <Badge tone={STATUS_TONE[status]} dot pulse={down}>
              {STATUS_LABEL[status]}
            </Badge>
          </div>
        </section>

        {/* timeline */}
        {total === 0 ? (
          <div className="rounded-(--radius) border border-border bg-panel px-4 py-10 text-center font-body text-[14px] text-text-muted">
            No reports filed for this date.
          </div>
        ) : (
          <>
            <div className="mb-4 ml-2 flex items-center gap-2 font-tele text-[11px] tracking-[0.14em] text-text-muted">
              <span className="size-1.5 rounded-full bg-danger rec-dot" />
              TIMELINE · NEWEST FIRST
            </div>
            <ol className="list-none">
              {reports.map((report, i) => (
                <TimelineEntry
                  key={report.id}
                  report={report}
                  index={i}
                  ordinal={total - i}
                  last={i === reports.length - 1}
                />
              ))}
            </ol>
          </>
        )}
      </main>
      </SlotReveal>
    </>
  );
}
