import { CalendarSkeleton } from "@/components/CalendarSkeleton";
import { StatusStrip } from "@/components/StatusStrip";
import { Skeleton } from "@/components/ui/Skeleton";
import { currentMonthIST } from "@/lib/time";

// Instant skeleton shown while the home data (hero + calendar) loads.
export default function HomeLoading() {
  const { year, month } = currentMonthIST();
  return (
    <>
      <StatusStrip />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-3 px-4 py-3 pb-28">
        {/* hero */}
        <section className="rounded-(--radius) border border-border bg-panel">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center justify-between px-4 py-5">
            <div className="space-y-2.5">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-12 w-16 rotate-[-7deg]" />
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        </section>

        {/* calendar */}
        <section className="rounded-(--radius) border border-border bg-panel">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <Skeleton className="size-9" />
            <div className="flex flex-col items-center gap-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-2.5 w-10" />
            </div>
            <Skeleton className="size-9" />
          </div>
          <div className="px-3 py-3">
            <CalendarSkeleton year={year} month1={month} />
          </div>
          <div className="flex items-center justify-center gap-1.5 pb-3">
            <Skeleton className="size-1.5 rounded-full" />
            <Skeleton className="size-1.5 rounded-full" />
            <Skeleton className="size-1.5 rounded-full" />
          </div>
        </section>

        <Skeleton className="h-12 w-full" />
      </main>
    </>
  );
}
