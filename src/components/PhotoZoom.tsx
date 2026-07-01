"use client";

import { clsx } from "@/lib/clsx";
import { useImageViewer } from "./ImageViewer";

// Wrap any photo to make it open in the global lightbox. Used from server
// components (which can't call the hook directly).
export function PhotoZoom({
  src,
  caption,
  className,
  children,
}: {
  src?: string | null;
  caption?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const open = useImageViewer();
  if (!src) return <>{children}</>;
  return (
    <button
      type="button"
      onClick={() => open(src, caption)}
      className={clsx("block cursor-zoom-in", className)}
      aria-label="View full photo"
    >
      {children}
    </button>
  );
}
