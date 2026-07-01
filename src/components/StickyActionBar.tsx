"use client";

import { clsx } from "@/lib/clsx";
import { Button } from "./ui/Button";

// Sticky bottom action bar (thumb zone), not a floating button. Report
// Downtime is always present; Report Restored appears only when the lift is
// currently down — filing and closing an incident are mirror images.
export function StickyActionBar({
  isDown,
  onDowntime,
  onRestored,
  extra,
}: {
  isDown: boolean;
  onDowntime: () => void;
  onRestored: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "sticky bottom-0 z-30 border-t border-border bg-bg/90 backdrop-blur-[2px]",
      )}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 pt-3">
        {extra}
        <Button variant="danger" full={!isDown} onClick={onDowntime} className={isDown ? "flex-1" : undefined}>
          Report Downtime
        </Button>
        {isDown ? (
          <Button variant="success" onClick={onRestored} className="flex-1">
            Report Restored
          </Button>
        ) : null}
      </div>
    </div>
  );
}
