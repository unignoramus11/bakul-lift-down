"use client";

import Link from "next/link";
import { useSlotClose } from "./SlotReveal";

// "Back to calendar" control. Inside a SlotReveal it plays the collapse-to-slot
// animation before navigating; on a direct visit it's a plain link home.
export function CalendarBackLink({ href = "/" }: { href?: string }) {
  const close = useSlotClose();
  const cls =
    "inline-flex items-center gap-1.5 font-tele text-[12px] tracking-[0.1em] text-text-muted transition-colors hover:text-text-2";
  const inner = (
    <>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      </svg>
      CALENDAR
    </>
  );

  if (close) {
    return (
      <button type="button" onClick={close} className={cls}>
        {inner}
      </button>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
