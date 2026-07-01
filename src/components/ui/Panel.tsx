import { clsx } from "@/lib/clsx";

// The one and only surface primitive. There are no cards in this app — only
// modules: 1px border, 8px radius, no drop shadow, depth from layered
// backgrounds. Header collapses to a single row with a right-aligned status
// slot, per the panel anatomy in the design language.

export function Panel({
  title,
  status,
  footer,
  elevated,
  as: Tag = "section",
  className,
  bodyClassName,
  children,
}: {
  title?: React.ReactNode;
  status?: React.ReactNode;
  footer?: React.ReactNode;
  elevated?: boolean;
  as?: React.ElementType;
  className?: string;
  bodyClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <Tag
      className={clsx(
        "rounded-[var(--radius)] border",
        elevated ? "bg-panel-2" : "bg-panel",
        "border-border",
        className,
      )}
    >
      {(title || status) && (
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <span className="font-ui text-[13px] font-semibold tracking-[0.14em] text-text-2 uppercase truncate">
            {title}
          </span>
          {status ? <span className="shrink-0">{status}</span> : null}
        </header>
      )}
      <div className={clsx("px-4 py-4", bodyClassName)}>{children}</div>
      {footer ? (
        <footer className="border-t border-border px-4 py-2.5 font-tele text-[12px] text-text-muted">
          {footer}
        </footer>
      ) : null}
    </Tag>
  );
}
