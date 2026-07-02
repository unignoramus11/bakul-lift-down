"use client";

import { Toast, Toaster, createToaster } from "@ark-ui/react/toast";
import { clsx } from "@/lib/clsx";

// System notices — the app's own voice, not a friendly one. Slide + fade,
// auto-dismiss. One shared toaster instance drives the whole app.
export const systemToaster = createToaster({
  placement: "top",
  overlap: true,
  gap: 8,
  max: 4,
});

export function notify(opts: {
  title: string;
  description?: string;
  type?: "success" | "error" | "info";
}) {
  systemToaster.create({
    title: opts.title,
    description: opts.description,
    type: opts.type ?? "info",
    duration: 3200,
  });
}

const TONE: Record<string, string> = {
  success: "border-border-success",
  error: "border-border-alert",
  info: "border-border-active",
};

const DOT: Record<string, string> = {
  success: "bg-success",
  error: "bg-danger",
  info: "bg-info",
};

export function SystemNotices() {
  return (
    <Toaster
      toaster={systemToaster}
      className="z-60 w-[min(92vw,360px)]"
      style={{ top: "max(1rem, env(safe-area-inset-top))" }}
    >
      {(toast) => (
        <Toast.Root
          className={clsx(
            "flex items-start gap-2.5 rounded-md border bg-panel-2 px-3 py-2.5",
            "data-[state=open]:animate-[entry-rise_180ms_ease-out]",
            TONE[toast.type ?? "info"] ?? TONE.info,
          )}
        >
          <span
            className={clsx(
              "mt-1 size-1.5 shrink-0 rounded-full",
              DOT[toast.type ?? "info"] ?? DOT.info,
            )}
          />
          <div className="min-w-0 flex-1">
            <Toast.Title className="font-ui text-[12px] font-semibold uppercase tracking-[0.12em] text-text">
              {toast.title}
            </Toast.Title>
            {toast.description ? (
              <Toast.Description className="mt-0.5 font-tele text-[11px] tracking-[0.04em] text-text-muted">
                {toast.description}
              </Toast.Description>
            ) : null}
          </div>
          <Toast.CloseTrigger className="font-tele text-[14px] leading-none text-text-muted hover:text-text-2">
            ×
          </Toast.CloseTrigger>
        </Toast.Root>
      )}
    </Toaster>
  );
}
