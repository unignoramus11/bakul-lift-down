import { HomeShell } from "@/components/HomeShell";
import { StatusStrip } from "@/components/StatusStrip";
import { getMonthSummaries, getTodayLive } from "@/lib/queries";
import { currentMonthIST } from "@/lib/time";

// Rendered per-request so the calendar + hero reflect the latest reports.
export const dynamic = "force-dynamic";

/** Parse a "YYYY-MM" query param into a valid month, or null. */
function parseMonthParam(m: string | undefined): { year: number; month: number } | null {
  if (!m) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(m);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12 || year < 2000 || year > 3000) return null;
  return { year, month };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  // Open on a requested month (e.g. returning from a date in a past month),
  // otherwise the current IST month.
  const month = parseMonthParam(m) ?? currentMonthIST();
  const [days, live] = await Promise.all([
    getMonthSummaries(month.year, month.month),
    getTodayLive(),
  ]);

  return (
    <>
      <StatusStrip />
      <HomeShell initialLive={live} initialMonth={month} initialDays={days} />
    </>
  );
}
