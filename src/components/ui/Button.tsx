import { clsx } from "@/lib/clsx";

// Rectangular, border-forward, feels like a hardware switch. Press = border
// brightens, background lifts one layer, scale to 0.98 (a snap, never a bounce).

type Variant = "danger" | "success" | "action" | "neutral" | "ghost";

const VARIANTS: Record<Variant, string> = {
  danger:
    "border-danger/70 text-danger hover:border-danger hover:bg-danger/10 active:bg-danger/15",
  success:
    "border-success/70 text-success hover:border-success hover:bg-success/10 active:bg-success/15",
  action:
    "border-action/70 text-info hover:border-action hover:bg-action/10 active:bg-action/15",
  neutral:
    "border-border text-text-2 hover:border-text-muted hover:bg-panel-2 active:bg-panel-2",
  ghost:
    "border-transparent text-text-muted hover:text-text-2 hover:bg-panel-2",
};

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  full?: boolean;
};

export function Button({
  variant = "neutral",
  full,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={clsx(
        "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[6px] border px-4",
        "font-ui text-[13px] font-semibold uppercase tracking-[0.14em]",
        "transition-[transform,background-color,border-color] duration-[120ms]",
        "active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none",
        VARIANTS[variant],
        full && "w-full",
        className,
      )}
    >
      {children}
    </button>
  );
}
