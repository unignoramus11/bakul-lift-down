import { SlotOpen } from "@/components/SlotOpen";
import { StatusStrip } from "@/components/StatusStrip";
import { Skeleton } from "@/components/ui/Skeleton";

// Instant skeleton for the date detail page while its reports load. Grows from
// the tapped calendar cell so it's continuous with the page's open animation.
export default function DateLoading() {
  return (
    <>
      <StatusStrip />
      <SlotOpen>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-3 pb-16">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-8" />
        </div>

        {/* case-file header */}
        <section className="mb-4 overflow-hidden rounded-(--radius) border border-border bg-panel">
          <Skeleton className="aspect-16/7 w-full rounded-none" />
          <div className="flex items-center justify-between px-4 py-3">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
        </section>

        {/* timeline */}
        <Skeleton className="mb-4 ml-1.5 h-3 w-48" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3 pl-1">
              <Skeleton className="mt-1.5 size-2 shrink-0 rounded-full" />
              <div className="flex-1 overflow-hidden rounded-(--radius) border border-border bg-panel">
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex gap-3 p-3">
                  <Skeleton className="aspect-square w-24 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      </SlotOpen>
    </>
  );
}
