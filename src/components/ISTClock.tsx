"use client";

import { useEffect, useState } from "react";
import { formatISTTime } from "@/lib/time";

// The live IST clock. A plain per-second value swap (no easing) — this alone
// makes the header feel like a real feed rather than a screenshot. Renders a
// stable placeholder until mounted to avoid hydration drift.
export function ISTClock({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={className} suppressHydrationWarning>
      {now ? formatISTTime(now) : "--:--:-- IST"}
    </span>
  );
}
