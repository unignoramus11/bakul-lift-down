import { clsx } from "@/lib/clsx";

// A single shimmering placeholder block. Honors reduced-motion.
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={clsx(
        "animate-pulse rounded-md bg-border-muted/60 motion-reduce:animate-none",
        className,
      )}
    />
  );
}
