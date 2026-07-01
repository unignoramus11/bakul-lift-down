import Link from "next/link";
import { ISTClock } from "./ISTClock";
import { Logo } from "./Logo";

// Slim ops header. Brand + asset on the left, live IST clock on the right.
// Sticky so the "feed" identity stays put while the calendar scrolls.
export function StatusStrip() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-[2px]">
      <div
        className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5"
        style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }}
      >
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <Logo />
          <span className="flex flex-col min-w-0 leading-tight">
            <span className="font-ui text-[13px] font-semibold tracking-[0.16em] text-text truncate">
              BAKUL LIFT DOWN
            </span>
            <span className="font-tele text-[10px] tracking-[0.12em] text-text-muted truncate">
              BAKUL HOSTEL · IIIT-H
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <span className="size-1.5 rounded-full bg-danger rec-dot" aria-hidden />
          <ISTClock className="font-tele text-[12px] tracking-[0.06em] text-text-2 tabular-nums" />
        </div>
      </div>
    </header>
  );
}
