import { clsx } from "@/lib/clsx";

// Brand mark: camera-viewfinder corner brackets framing a lift shaft with an
// up-chevron and a down-chevron — the lift being watched. Uses
// currentColor for the frame so it inherits, with a fixed danger accent on the
// down-chevron (the whole point of the app).
export function Logo({
  className,
  size = 22,
  accent = true,
}: {
  className?: string;
  size?: number;
  accent?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={clsx("shrink-0", className)}
      aria-hidden
    >
      {/* viewfinder corner brackets */}
      <path
        d="M3 7V3h4M17 3h4v4M21 17v4h-4M7 21H3v-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
      {/* lift shaft */}
      <rect
        x="9.25"
        y="7.25"
        width="5.5"
        height="9.5"
        rx="0.5"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.55"
      />
      {/* up chevron (operational direction) */}
      <path
        d="M10.4 11.2 12 9.6l1.6 1.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
      />
      {/* down chevron (the incident) */}
      <path
        d="M10.4 12.8 12 14.4l1.6-1.6"
        stroke={accent ? "var(--color-danger)" : "currentColor"}
        strokeWidth="1.4"
        strokeLinecap="square"
      />
    </svg>
  );
}
