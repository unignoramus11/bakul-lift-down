import { clsx } from "@/lib/clsx";

// Tiny, uppercase, monospaced status markers. Color only ever signals status;
// the word is always spelled out (never color alone) for accessibility.

type Tone = "down" | "operational" | "restored" | "offline" | "neutral" | "info";

const TONES: Record<Tone, string> = {
  down: "text-danger border-danger/50 bg-danger/10",
  operational: "text-success border-success/50 bg-success/10",
  restored: "text-success border-success/50 bg-success/10",
  offline: "text-offline border-offline/50 bg-offline/10",
  info: "text-info border-info/50 bg-info/10",
  neutral: "text-text-muted border-border bg-panel-2",
};

export function Badge({
  tone = "neutral",
  pulse,
  dot,
  children,
  className,
}: {
  tone?: Tone;
  pulse?: boolean;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-[4px] border px-1.5 py-0.5",
        "font-tele text-[11px] font-medium tracking-[0.16em] uppercase leading-none",
        TONES[tone],
        pulse && "pulse-slow",
        className,
      )}
    >
      {dot ? (
        <span
          className={clsx(
            "size-1.5 rounded-full",
            tone === "down" && "bg-danger",
            (tone === "operational" || tone === "restored") && "bg-success",
            tone === "offline" && "bg-offline",
            tone === "info" && "bg-info",
            tone === "neutral" && "bg-text-muted",
          )}
        />
      ) : null}
      {children}
    </span>
  );
}
