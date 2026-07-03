"use client";

import { Dialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clsx } from "@/lib/clsx";
import { Button } from "./ui/Button";

// The live red dot in the top bar doubles as the (hidden) admin gate: tap it to
// open a password prompt; on success it routes to /admin.
export function AdminDot() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);

  // On tap: if already logged in, go straight to /admin; else prompt.
  async function onDotTap() {
    if (checking) return;
    setChecking(true);
    try {
      const res = await fetch("/api/admin/session");
      const j = (await res.json().catch(() => ({}))) as { authed?: boolean };
      if (j.authed) {
        router.push("/admin");
        return;
      }
    } catch {
      /* fall through to prompt */
    } finally {
      setChecking(false);
    }
    setPw("");
    setError(null);
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        setOpen(false);
        router.push("/admin");
        return;
      }
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Login failed.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        setOpen(e.open);
        if (e.open) {
          setPw("");
          setError(null);
        }
      }}
      lazyMount
      unmountOnExit
    >
      <button
        type="button"
        onClick={onDotTap}
        aria-label="Admin access"
        title="Admin"
        className="-m-2 grid place-items-center p-2"
      >
        <span className="size-1.5 rounded-full bg-danger rec-dot" />
      </button>

      <Portal>
        <Dialog.Backdrop
          data-backdrop
          className="fixed inset-0 z-80 bg-black/75 data-[state=open]:animate-[backdrop-in_200ms_ease-out] data-[state=closed]:animate-[backdrop-out_160ms_ease-in]"
        />
        <Dialog.Positioner className="fixed inset-0 z-81 flex items-center justify-center p-4">
          <Dialog.Content
            data-sheet
            className={clsx(
              "w-full max-w-85 rounded-lg border border-border bg-panel-2 p-4",
              "data-[state=open]:animate-[viewer-in_180ms_cubic-bezier(0.2,0.9,0.25,1)]",
              "data-[state=closed]:animate-[viewer-out_140ms_ease-in]",
            )}
          >
            <Dialog.Title className="font-ui text-[15px] font-semibold tracking-[0.12em] text-text">
              ADMIN ACCESS
            </Dialog.Title>
            <Dialog.Description className="mt-1 font-tele text-[11px] tracking-[0.06em] text-text-muted">
              Enter the admin password to manage reports.
            </Dialog.Description>

            <form onSubmit={submit} className="mt-4 space-y-3">
              <input
                type="password"
                autoFocus
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Password"
                className="w-full rounded-md border border-border bg-bg-2 px-3 py-2.5 font-tele text-[14px] text-text placeholder:text-text-disabled focus:border-border-active focus:outline-none"
              />

              {error ? (
                <p className="rounded-md border border-border-alert bg-danger/10 px-3 py-2 font-body text-[13px] text-danger">
                  {error}
                </p>
              ) : null}

              <div className="flex gap-2">
                <Dialog.CloseTrigger asChild>
                  <Button variant="ghost" className="flex-1" type="button">
                    Cancel
                  </Button>
                </Dialog.CloseTrigger>
                <Button
                  variant="action"
                  type="submit"
                  disabled={busy || pw.length === 0}
                  className="flex-1"
                >
                  {busy ? "Checking…" : "Unlock"}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
