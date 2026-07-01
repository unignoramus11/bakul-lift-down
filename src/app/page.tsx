import { HomeShell } from "@/components/HomeShell";
import { StatusStrip } from "@/components/StatusStrip";
import { getMonthSummaries, getTodayLive } from "@/lib/queries";
import { currentMonthIST } from "@/lib/time";

// Rendered per-request so the calendar + hero reflect the latest reports.
export const dynamic = "force-dynamic";

export default async function Home() {
  const month = currentMonthIST();
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
