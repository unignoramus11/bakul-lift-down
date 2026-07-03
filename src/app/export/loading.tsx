import { SlotOpen } from "@/components/SlotOpen";
import { StatusStrip } from "@/components/StatusStrip";
import { Skeleton } from "@/components/ui/Skeleton";

// Instant skeleton for the PDF export page. Grows from the launch button so
// it's continuous with the page's open animation.
export default function ExportLoading() {
  return (
    <>
      <StatusStrip />
      <SlotOpen>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-3 pb-16">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-14" />
        </div>

        <section className="overflow-hidden rounded-(--radius) border border-border bg-panel">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-10" />
          </div>
          <div className="space-y-4 px-4 py-4">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </section>
      </main>
      </SlotOpen>
    </>
  );
}
