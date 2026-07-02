"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { DaySummary, LiveStatus, ReportDTO } from "@/lib/reports";
import { setSlotOrigin } from "@/lib/slotOrigin";
import { formatISTTime } from "@/lib/time";
import { LiftStatusHero } from "./LiftStatusHero";
import { MonthSwitcher } from "./MonthSwitcher";
import { ReportSheet } from "./ReportSheet";
import { StickyActionBar } from "./StickyActionBar";
import { SystemNotices, notify } from "./SystemNotice";
import { Logo } from "./Logo";

type Mode = "DOWN" | "RESTORED";

export function HomeShell({
  initialLive,
  initialMonth,
  initialDays,
}: {
  initialLive: LiveStatus;
  initialMonth: { year: number; month: number };
  initialDays: DaySummary[];
}) {
  const [live, setLive] = useState<LiveStatus>(initialLive);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("DOWN");
  const [refreshSignal, setRefreshSignal] = useState(0);
  // Bumped each open so the report sheet remounts fresh (state reset via key).
  const [sheetSession, setSheetSession] = useState(0);

  // Keep the hero live — poll today's status.
  useEffect(() => {
    let alive = true;
    const tick = () =>
      fetch("/api/status")
        .then((r) => r.json())
        .then((j: LiveStatus) => alive && setLive(j))
        .catch(() => {});
    const id = setInterval(tick, 25000);
    const onVis = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const openReport = useCallback((m: Mode) => {
    setSheetSession((n) => n + 1);
    setMode(m);
    setSheetOpen(true);
  }, []);

  const onSubmitted = useCallback((report: ReportDTO) => {
    setLive((prev) => {
      const isDown = report.kind === "DOWN";
      return {
        // A restore only happens after downtime, so it lands as RESTORED.
        status: isDown ? "DOWN" : "RESTORED",
        since: report.createdAt,
        isDown,
        todayCount: prev.todayCount + 1,
        downToday: prev.downToday + (isDown ? 1 : 0),
        restoredToday: prev.restoredToday + (isDown ? 0 : 1),
      };
    });
    setRefreshSignal((n) => n + 1);
    notify({
      title: report.kind === "DOWN" ? "Downtime filed" : "Restoration filed",
      description: `${report.kind} · ${formatISTTime(new Date(report.createdAt))}`,
      type: report.kind === "DOWN" ? "error" : "success",
    });
  }, []);

  return (
    <>
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-3 px-4 py-4">
        <LiftStatusHero live={live} />
        <MonthSwitcher
          initialMonth={initialMonth}
          initialDays={initialDays}
          refreshSignal={refreshSignal}
        />

        <Link
          href="/export"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setSlotOrigin({ left: r.left, top: r.top, width: r.width, height: r.height });
          }}
          className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-border bg-panel font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-text-2 transition-colors duration-120 hover:border-text-muted hover:bg-panel-2"
        >
          <Logo size={16} accent={false} />
          Generate PDF Report
        </Link>

        <p className="px-1 pt-1 text-center font-tele text-[10px] tracking-widest text-text-disabled">
          CROWD-SOURCED · TAP ANY DAY FOR THE LOG
        </p>
      </main>

      <StickyActionBar
        isDown={live.isDown}
        onDowntime={() => openReport("DOWN")}
        onRestored={() => openReport("RESTORED")}
      />

      <ReportSheet
        key={sheetSession}
        open={sheetOpen}
        mode={mode}
        onOpenChange={setSheetOpen}
        onSubmitted={onSubmitted}
      />

      <SystemNotices />
    </>
  );
}
