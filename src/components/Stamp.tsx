"use client";

import { motion } from "motion/react";
import { clsx } from "@/lib/clsx";
import type { DayStatus } from "@/lib/reports";
import { useMotionPrefs } from "./MotionPrefsProvider";

// The signature object: a rubber-stamp mark, ink-red (DOWN) or ink-green
// (OPERATIONAL), pressed over a desaturated photo like a customs stamp on a
// passport page. EMPTY renders a muted placeholder with no stamp.

type Size = "sm" | "md" | "lg";

const SIZES: Record<
  Size,
  {
    text: string;
    border: string;
    pad: string;
    tracking: string;
    filter: string;
  }
> = {
  sm: {
    text: "text-[10px]",
    border: "border-[1.5px]",
    pad: "px-1.5 py-0.5",
    tracking: "tracking-[0.18em]",
    filter: "url(#stamp-rough-sm)",
  },
  md: {
    text: "text-[15px]",
    border: "border-2",
    pad: "px-3 py-1",
    tracking: "tracking-[0.22em]",
    filter: "url(#stamp-rough)",
  },
  lg: {
    text: "text-[26px]",
    border: "border-[3px]",
    pad: "px-5 py-2",
    tracking: "tracking-[0.24em]",
    filter: "url(#stamp-rough)",
  },
};

const HASH_BG = {
  backgroundImage:
    "repeating-linear-gradient(45deg, rgba(61,139,255,0.5) 0 1px, transparent 1px 7px)",
  backgroundColor: "var(--color-border-muted)",
  opacity: 1,
} as const;

export function Stamp({
  status,
  photo,
  alt = "",
  size = "sm",
  animate = false,
  rotation = -7,
  className,
}: {
  status: DayStatus;
  photo?: string | null;
  alt?: string;
  size?: Size;
  animate?: boolean;
  rotation?: number;
  className?: string;
}) {
  const { reduced } = useMotionPrefs();
  const s = SIZES[size];
  const isDown = status === "DOWN";
  const ink = isDown ? "var(--color-stamp-down)" : "var(--color-stamp-op)";
  const halo = isDown ? "rgba(255,77,103,0.15)" : "rgba(68,209,122,0.15)";
  const label = isDown ? "DOWN" : "OPERATIONAL";

  return (
    <div
      className={clsx(
        "relative isolate size-full overflow-hidden",
        !photo && "grain",
        className,
      )}
      style={!photo ? HASH_BG : undefined}
    >
      {/* Desaturated photo underneath (printed contact-sheet look). */}
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={alt}
          className="photo-desat grain absolute inset-0 size-full object-cover"
        />
      ) : null}

      {/* Muted diagonal hash sits under the stamp when there's no photo. */}

      {status === "EMPTY" ? null : (
        <StampMark
          label={label}
          ink={ink}
          halo={halo}
          rotation={rotation}
          sizeClasses={s}
          animate={animate}
          reduced={reduced}
        />
      )}
    </div>
  );
}

function StampMark({
  label,
  ink,
  halo,
  rotation,
  sizeClasses,
  animate,
  reduced,
}: {
  label: string;
  ink: string;
  halo: string;
  rotation: number;
  sizeClasses: (typeof SIZES)[Size];
  animate: boolean;
  reduced: boolean;
}) {
  const shouldAnimate = animate && !reduced;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      initial={
        shouldAnimate
          ? { scale: 1.15, y: -6, opacity: 0, rotate: rotation - 3 }
          : reduced && animate
            ? { opacity: 0 }
            : false
      }
      animate={{ scale: 1, y: 0, opacity: 1, rotate: rotation }}
      transition={
        shouldAnimate
          ? { type: "tween", ease: [0.2, 0.9, 0.25, 1], duration: 0.4 }
          : { duration: reduced && animate ? 0.18 : 0 }
      }
      style={{ rotate: rotation }}
    >
      {/* one-frame halo flash on landing */}
      {shouldAnimate ? (
        <motion.span
          className="absolute rounded-[4px]"
          style={{ background: halo, inset: "18%" }}
          initial={{ opacity: 0.9, scale: 1.1 }}
          animate={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      ) : null}
      <span
        className={clsx(
          "relative font-tele font-medium uppercase leading-none",
          sizeClasses.text,
          sizeClasses.border,
          sizeClasses.pad,
          sizeClasses.tracking,
        )}
        style={{
          color: ink,
          borderColor: ink,
          opacity: 0.74,
          borderRadius: 3,
          filter: sizeClasses.filter,
          boxShadow: `inset 0 0 0 100vmax ${halo}`,
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}
