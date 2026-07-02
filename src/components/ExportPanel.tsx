"use client";

import { useMemo, useState } from "react";
import { buildReportModel } from "@/lib/pdf/model";
import type { ReportDTO } from "@/lib/reports";
import { currentMonthIST, dateKeyIST, formatISTStamp } from "@/lib/time";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { CalendarBackLink } from "./CalendarBackLink";
import { Logo } from "./Logo";
import { RangeDatePicker } from "./RangeDatePicker";
import { SystemNotices, notify } from "./SystemNotice";

const pad = (n: number) => String(n).padStart(2, "0");

export function ExportPanel() {
  const { year, month } = useMemo(() => currentMonthIST(), []);
  const today = useMemo(() => dateKeyIST(), []);
  const [from, setFrom] = useState(`${year}-${pad(month)}-01`);
  const [to, setTo] = useState(today);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function generate() {
    if (busy) return;
    setBusy(true);
    setStatus("PREPARING…");
    try {
      const res = await fetch(`/api/reports?from=${from}&to=${to}`);
      const json = (await res.json()) as { reports?: ReportDTO[] };
      const reports: ReportDTO[] = json.reports ?? [];

      if (reports.length === 0) {
        notify({
          title: "No reports in range",
          description: "The report will show an empty log.",
          type: "info",
        });
      }

      setStatus("GENERATING…");
      const { buildThumbMap } = await import("@/lib/pdf/prepare");
      const [{ pdf }, { ReportPdf }, thumbs] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/lib/pdf/ReportPdf"),
        buildThumbMap(reports),
      ]);

      const model = buildReportModel(from, to, reports);
      const blob = await pdf(
        <ReportPdf
          model={model}
          thumbs={thumbs}
          generatedAt={formatISTStamp(new Date())}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bakul-lift-down_${from}_to_${to}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setStatus("REPORT DOWNLOADED");
      notify({ title: "Report ready", description: "Your PDF has downloaded.", type: "success" });
    } catch (err) {
      console.error(err);
      setStatus("SOMETHING WENT WRONG");
      notify({
        title: "Export failed",
        description: "Could not build the PDF. Try again.",
        type: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-3 pb-16">
      <div className="mb-3 flex items-center justify-between">
        <CalendarBackLink />
        <span className="font-tele text-[10px] tracking-[0.16em] text-text-disabled">
          EXPORT
        </span>
      </div>

      <section className="overflow-hidden rounded-(--radius) border border-border bg-panel">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Logo size={18} />
            <span className="font-ui text-[15px] font-semibold tracking-[0.12em] text-text">
              DOWNTIME REPORT
            </span>
          </div>
          <Badge tone="info" dot>
            PDF
          </Badge>
        </header>

        <div className="space-y-4 px-4 py-4">
          <p className="font-body text-[13px] leading-snug text-text-muted">
            Generate a PDF report of lift downtime over a date range — summary
            stats, a daily status map, and the full report log.
          </p>

          <div>
            <span className="mb-1.5 block font-ui text-[11px] font-medium tracking-[0.12em] text-text-2 uppercase">
              Date range
            </span>
            <RangeDatePicker
              from={from}
              to={to}
              max={today}
              onChange={(f, t) => {
                setFrom(f);
                setTo(t);
              }}
            />
          </div>

          <Button variant="action" full onClick={generate} disabled={busy}>
            {busy ? "Generating…" : "Generate PDF"}
          </Button>

          {status ? (
            <p className="text-center font-tele text-[11px] tracking-widest text-text-muted">
              {status}
            </p>
          ) : null}
        </div>
      </section>
      <SystemNotices />
    </main>
  );
}
