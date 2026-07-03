"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReportDTO } from "@/lib/reports";
import {
  currentMonthIST,
  formatDateKey,
  formatISTTime,
  formatMonthLabel,
  shiftMonth,
} from "@/lib/time";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Skeleton } from "./ui/Skeleton";
import { useImageViewer } from "./ImageViewer";
import { SystemNotices, notify } from "./SystemNotice";

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (y: number, m: number) => `${y}-${pad(m)}`;

export function AdminPanel({
  initialMonth,
  initialReports,
}: {
  initialMonth: { year: number; month: number };
  initialReports: ReportDTO[];
}) {
  const router = useRouter();
  const openImage = useImageViewer();

  const [{ year, month }, setYM] = useState(initialMonth);
  const [cache] = useState(
    () => new Map<string, ReportDTO[]>([[keyOf(initialMonth.year, initialMonth.month), initialReports]]),
  );
  const [items, setItems] = useState<ReportDTO[] | null>(initialReports);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const current = currentMonthIST();
  const atCurrent = year === current.year && month === current.month;

  // Fetch a month's reports only when it isn't cached. The cached/skeleton
  // decision is made synchronously in `go` (and on first mount the initial
  // month is already in state), so this effect only performs the async fetch.
  useEffect(() => {
    const k = keyOf(year, month);
    if (cache.has(k)) return;
    let alive = true;
    fetch(`/api/admin/reports?month=${k}`)
      .then((r) => r.json())
      .then((j: { reports?: ReportDTO[] }) => {
        if (!alive) return;
        const list = j.reports ?? [];
        cache.set(k, list);
        setItems(list);
      })
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, [year, month, cache]);

  const go = useCallback(
    (delta: number) => {
      if (delta > 0 && atCurrent) return;
      const next = shiftMonth(year, month, delta);
      setYM(next);
      setItems(cache.get(keyOf(next.year, next.month)) ?? null); // null → skeleton
      setConfirmId(null);
    },
    [year, month, atCurrent, cache],
  );

  const groups = useMemo(() => {
    if (!items) return [];
    const map = new Map<string, ReportDTO[]>();
    for (const r of items) {
      const arr = map.get(r.dateKey);
      if (arr) arr.push(r);
      else map.set(r.dateKey, [r]);
    }
    return [...map.entries()];
  }, [items]);

  async function del(id: string) {
    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, { method: "DELETE" });
      if (res.ok) {
        const k = keyOf(year, month);
        const next = (cache.get(k) ?? []).filter((r) => r.id !== id);
        cache.set(k, next);
        setItems(next);
        notify({ title: "Report deleted", type: "success" });
      } else {
        notify({ title: "Delete failed", type: "error" });
      }
    } catch {
      notify({ title: "Network error", type: "error" });
    } finally {
      setPendingId(null);
      setConfirmId(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-3 pb-16">
      <div className="mb-3 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-tele text-[12px] tracking-widest text-text-muted transition-colors hover:text-text-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          </svg>
          CALENDAR
        </Link>
        <span className="font-tele text-[10px] tracking-[0.16em] text-text-disabled">ADMIN</span>
      </div>

      <section className="overflow-hidden rounded-(--radius) border border-border bg-panel">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="font-ui text-[15px] font-semibold tracking-[0.12em] text-text">
            MANAGE REPORTS
          </div>
          <Button variant="neutral" onClick={logout} className="min-h-9 px-3 text-[12px]">
            Log out
          </Button>
        </header>

        {/* month switcher */}
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous month"
            className="grid size-9 place-items-center rounded-md border border-border text-text-2 transition-colors hover:border-text-muted active:bg-panel-2"
          >
            <Chevron dir="left" />
          </button>
          <div className="flex flex-col items-center">
            <span className="font-ui text-[14px] font-semibold tracking-[0.14em] text-text">
              {formatMonthLabel(year, month)}
            </span>
            <span className="font-tele text-[10px] tracking-[0.12em] text-text-muted">
              {items === null ? "SYNCING…" : `${items.length} REPORT${items.length === 1 ? "" : "S"}`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={atCurrent}
            aria-label="Next month"
            className="grid size-9 place-items-center rounded-md border border-border text-text-2 transition-colors enabled:hover:border-text-muted enabled:active:bg-panel-2 disabled:text-text-disabled disabled:opacity-40"
          >
            <Chevron dir="right" />
          </button>
        </div>

        {items === null ? (
          <div className="space-y-3 px-4 py-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-11 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-9 w-16" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="px-4 py-10 text-center font-body text-[14px] text-text-muted">
            No reports this month.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {groups.map(([dateKey, rows]) => (
              <div key={dateKey}>
                <div className="bg-bg-2 px-4 py-1.5 font-tele text-[11px] tracking-widest text-text-muted">
                  {formatDateKey(dateKey)}
                </div>
                <ul className="divide-y divide-border">
                  {rows.map((r) => {
                    const down = r.kind === "DOWN";
                    const confirming = confirmId === r.id;
                    return (
                      <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            openImage(r.imageData, `${r.kind} · ${formatISTTime(new Date(r.createdAt))}`)
                          }
                          aria-label="View photo"
                          className="size-11 shrink-0 cursor-zoom-in overflow-hidden rounded-md border border-border"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={r.imageData} alt="" className="photo-desat size-full object-cover" />
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge tone={down ? "down" : "restored"} dot>
                              {r.kind}
                            </Badge>
                            <span className="font-tele text-[11px] text-text-muted tabular-nums">
                              {formatISTTime(new Date(r.createdAt))}
                            </span>
                          </div>
                          <p className="mt-1 truncate font-body text-[12px] text-text-2">
                            {r.note ?? <span className="text-text-disabled">— no note —</span>}
                          </p>
                        </div>

                        <Button
                          variant={confirming ? "danger" : "ghost"}
                          onClick={() => (confirming ? del(r.id) : setConfirmId(r.id))}
                          disabled={pendingId === r.id}
                          className="min-h-9 shrink-0 px-3 text-[12px]"
                        >
                          {pendingId === r.id ? "…" : confirming ? "Confirm" : "Delete"}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
      <SystemNotices />
    </main>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}
