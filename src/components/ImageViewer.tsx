"use client";

import { Dialog } from "@ark-ui/react/dialog";
import { createContext, useCallback, useContext, useState } from "react";
import { clsx } from "@/lib/clsx";

// A global photo lightbox. Any photo in the app can call `open(src, caption)`
// to show the full, uncropped image (object-contain) on a dark backdrop.

type ViewerState = { src: string; caption?: string } | null;
const Ctx = createContext<(src: string, caption?: string) => void>(() => {});

export const useImageViewer = () => useContext(Ctx);

export function ImageViewerProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<ViewerState>(null);

  const open = useCallback((src: string, caption?: string) => {
    if (src) setView({ src, caption });
  }, []);

  return (
    <Ctx.Provider value={open}>
      {children}
      <Dialog.Root
        open={!!view}
        onOpenChange={(d) => !d.open && setView(null)}
        lazyMount
        unmountOnExit
      >
        <Dialog.Backdrop
          data-backdrop
          className={clsx(
            "fixed inset-0 z-[70] bg-black/90",
            "data-[state=open]:animate-[backdrop-in_200ms_ease-out]",
            "data-[state=closed]:animate-[backdrop-out_160ms_ease-in]",
          )}
        />
        <Dialog.Positioner className="fixed inset-0 z-[71] flex items-center justify-center p-4">
          <Dialog.Content
            data-sheet
            className={clsx(
              "relative flex max-h-full max-w-full flex-col items-center",
              "data-[state=open]:animate-[viewer-in_220ms_cubic-bezier(0.2,0.9,0.25,1)]",
              "data-[state=closed]:animate-[backdrop-out_160ms_ease-in]",
            )}
            style={{
              paddingTop: "max(0.5rem, env(safe-area-inset-top))",
              paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
            }}
          >
            <Dialog.Title className="sr-only">Photo</Dialog.Title>
            {/* close */}
            <Dialog.CloseTrigger
              className="absolute right-1 top-1 z-10 grid size-9 place-items-center rounded-[6px] border border-border bg-black/60 font-tele text-[16px] leading-none text-text-2 hover:border-text-muted"
              aria-label="Close photo"
            >
              ×
            </Dialog.CloseTrigger>

            {view ? (
              <figure className="relative flex min-h-0 flex-col">
                <div className="relative flex min-h-0 items-center justify-center">
                  {/* corner brackets */}
                  <span className="pointer-events-none absolute left-0 top-0 size-6 border-l-2 border-t-2 border-border-active/70" />
                  <span className="pointer-events-none absolute right-0 top-0 size-6 border-r-2 border-t-2 border-border-active/70" />
                  <span className="pointer-events-none absolute bottom-0 left-0 size-6 border-b-2 border-l-2 border-border-active/70" />
                  <span className="pointer-events-none absolute bottom-0 right-0 size-6 border-b-2 border-r-2 border-border-active/70" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={view.src}
                    alt={view.caption ?? "Lift photo"}
                    className="max-h-[82vh] max-w-[92vw] object-contain"
                  />
                </div>
                {view.caption ? (
                  <figcaption className="mt-2 text-center font-tele text-[11px] tracking-[0.1em] text-text-muted">
                    {view.caption}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Ctx.Provider>
  );
}
