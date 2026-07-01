"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MAX_IMAGE_KB } from "@/lib/config";
import { buildReportModel } from "@/lib/pdf/model";
import type { ReportDTO } from "@/lib/reports";
import {
  currentMonthIST,
  dateKeyIST,
  formatDateKey,
  formatISTStamp,
} from "@/lib/time";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Logo } from "./Logo";
import { SystemNotices, notify } from "./SystemNotice";

const pad = (n: number) => String(n).padStart(2, "0");

export function ExportPanel() {
  const { year, month } = useMemo(() => currentMonthIST(), []);
  const today = useMemo(() => dateKeyIST(), []);
  const [from, setFrom] = useState(`${year}-${pad(month)}-01`);
  const [to, setTo] = useState(today);
  const [sample, setSample] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const invalid = from > to;

  async function generate() {
    if (invalid || busy) return;
    setBusy(true);
    setStatus("QUERYING RANGE…");
    try {
      let reports: ReportDTO[] = [];
      let useSample = sample;

      if (sample) {
        const { makeMockReports } = await import("@/lib/pdf/prepare");
        reports = makeMockReports(from, to);
      } else {
        const res = await fetch(`/api/reports?from=${from}&to=${to}`);
        const json = (await res.json()) as { reports?: ReportDTO[] };
        reports = json.reports ?? [];
        if (reports.length === 0) {
          const { makeMockReports } = await import("@/lib/pdf/prepare");
          reports = makeMockReports(from, to);
          useSample = true;
          notify({
            title: "No data in range",
            description: "Generated a sample digest instead.",
            type: "info",
          });
        }
      }

      setStatus(`RENDERING ${reports.length} REPORTS…`);
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
          sample={useSample}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bakul-lift-down_${from}_to_${to}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setStatus("DIGEST DOWNLOADED");
      notify({ title: "Digest ready", description: "PDF downloaded.", type: "success" });
    } catch (err) {
      console.error(err);
      setStatus("RENDER FAILED");
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
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-tele text-[12px] tracking-[0.1em] text-text-muted transition-colors hover:text-text-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          </svg>
          CALENDAR
        </Link>
        <span className="font-tele text-[10px] tracking-[0.16em] text-text-disabled">
          EXPORT · OPS
        </span>
      </div>

      <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-panel">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Logo size={18} />
            <span className="font-ui text-[15px] font-semibold tracking-[0.12em] text-text">
              INCIDENT DIGEST
            </span>
          </div>
          <Badge tone="info" dot>
            PDF
          </Badge>
        </header>

        <div className="space-y-4 px-4 py-4">
          <p className="font-body text-[13px] leading-snug text-text-muted">
            Generate a surveillance-style PDF digest of lift downtime over a date
            range — summary stats, a daily status map, and the full field log.
            Rendered entirely on your device.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="FROM">
              <input
                type="date"
                value={from}
                max={to}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-[6px] border border-border bg-bg-2 px-3 py-2 font-tele text-[13px] text-text focus:border-border-active focus:outline-none"
              />
            </Field>
            <Field label="TO">
              <input
                type="date"
                value={to}
                min={from}
                max={today}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-[6px] border border-border bg-bg-2 px-3 py-2 font-tele text-[13px] text-text focus:border-border-active focus:outline-none"
              />
            </Field>
          </div>

          {invalid ? (
            <p className="font-tele text-[11px] tracking-[0.06em] text-danger">
              FROM must be on or before TO.
            </p>
          ) : (
            <p className="font-tele text-[11px] tracking-[0.06em] text-text-muted">
              RANGE · {formatDateKey(from)} → {formatDateKey(to)}
            </p>
          )}

          {/* sample toggle */}
          <button
            type="button"
            onClick={() => setSample((v) => !v)}
            className="flex w-full items-center justify-between rounded-[6px] border border-border bg-bg-2 px-3 py-2.5 text-left"
          >
            <span>
              <span className="block font-ui text-[13px] font-medium text-text-2">
                Sample data
              </span>
              <span className="block font-tele text-[10px] tracking-[0.06em] text-text-muted">
                preview the layout with mock incidents
              </span>
            </span>
            <span
              className={`relative h-5 w-9 rounded-full border transition-colors ${
                sample ? "border-border-active bg-action/30" : "border-border bg-panel"
              }`}
            >
              <span
                className={`absolute top-0.5 size-3.5 rounded-full transition-all ${
                  sample ? "left-4 bg-info" : "left-0.5 bg-text-muted"
                }`}
              />
            </span>
          </button>

          <Button
            variant="action"
            full
            onClick={generate}
            disabled={invalid || busy}
          >
            {busy ? "Generating…" : "Generate PDF"}
          </Button>

          {status ? (
            <p className="text-center font-tele text-[11px] tracking-[0.1em] text-text-muted">
              {status}
            </p>
          ) : (
            <p className="text-center font-tele text-[10px] tracking-[0.1em] text-text-disabled">
              IMAGES DESATURATED · UNDER {MAX_IMAGE_KB} KB EACH · ALL TIMES IST
            </p>
          )}
        </div>
      </section>
      <SystemNotices />
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-ui text-[11px] font-medium tracking-[0.12em] text-text-2 uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
