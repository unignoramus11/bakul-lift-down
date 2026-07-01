"use client";

import { useSyncExternalStore } from "react";
import { formatISTTime } from "@/lib/time";

// A shared once-per-second tick, exposed as an external store so the clock is
// a pure subscription (no effect + setState). Cached snapshot avoids the
// "getSnapshot should be cached" pitfall.
let now = Date.now();

function subscribe(onChange: () => void) {
  now = Date.now();
  onChange();
  const id = setInterval(() => {
    now = Date.now();
    onChange();
  }, 1000);
  return () => clearInterval(id);
}

// The live IST clock. A plain per-second value swap (no easing). Renders a
// stable placeholder on the server to avoid hydration drift.
export function ISTClock({ className }: { className?: string }) {
  const value = useSyncExternalStore(
    subscribe,
    () => now,
    () => null,
  );

  return (
    <span className={className} suppressHydrationWarning>
      {value !== null ? formatISTTime(new Date(value)) : "--:--:-- IST"}
    </span>
  );
}
