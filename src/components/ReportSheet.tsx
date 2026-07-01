"use client";

import { Dialog } from "@ark-ui/react/dialog";
import { useRef, useState } from "react";
import { clsx } from "@/lib/clsx";
import { MAX_NOTE_LEN } from "@/lib/config";
import { type CompressResult, compressImage } from "@/lib/compress";
import { getDeviceId } from "@/lib/device";
import type { ReportDTO } from "@/lib/reports";
import { formatISTDate, formatISTTime } from "@/lib/time";
import { CompressionMeter } from "./CompressionMeter";
import { useImageViewer } from "./ImageViewer";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

type Mode = "DOWN" | "RESTORED";
type Step = "pick" | "compressing" | "ready" | "submitting" | "error";

export function ReportSheet({
  open,
  mode,
  onOpenChange,
  onSubmitted,
}: {
  open: boolean;
  mode: Mode;
  onOpenChange: (open: boolean) => void;
  onSubmitted: (report: ReportDTO) => void;
}) {
  const isDown = mode === "DOWN";
  const accent = isDown ? "var(--color-stamp-down)" : "var(--color-stamp-restored)";
  const fileInput = useRef<HTMLInputElement>(null);
  const openImage = useImageViewer();

  const [step, setStep] = useState<Step>("pick");
  const [preview, setPreview] = useState<string | null>(null);
  const [percent, setPercent] = useState(0);
  const [result, setResult] = useState<CompressResult | null>(null);
  const [note, setNote] = useState("");
  const [stampAt, setStampAt] = useState<Date>(() => new Date());
  const [error, setError] = useState<string | null>(null);

  // State resets on open because the parent remounts this component with a
  // fresh key each time it's opened — no reset effect needed.

  async function handleFile(file: File) {
    setStep("compressing");
    setPercent(0);
    setPreview((p) => {
      if (p) URL.revokeObjectURL(p);
      return URL.createObjectURL(file);
    });
    try {
      const res = await compressImage(file, (p) => setPercent(p));
      setResult(res);
      setPercent(100);
      setStampAt(new Date());
      setStep("ready");
    } catch {
      setError("Could not process the photo. It was not saved. Try again.");
      setStep("error");
    }
  }

  async function submit() {
    if (!result) return;
    setStep("submitting");
    setError(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: mode,
          imageData: result.dataUrl,
          imageMime: result.mime,
          imageBytes: result.bytes,
          note: note.trim() || null,
          deviceId: getDeviceId(),
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "Could not file report.");
        setStep("error");
        return;
      }
      const { report } = (await res.json()) as { report: ReportDTO };
      onSubmitted(report);
      onOpenChange(false);
    } catch {
      setError("Network error. Report not filed. Try again.");
      setStep("error");
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(d) => onOpenChange(d.open)}
      lazyMount
      unmountOnExit
    >
      <Dialog.Backdrop
        data-backdrop
        className={clsx(
          "fixed inset-0 z-40 bg-black/75",
          "data-[state=open]:animate-[backdrop-in_250ms_ease-out]",
          "data-[state=closed]:animate-[backdrop-out_200ms_ease-in]",
        )}
      />
      <Dialog.Positioner className="fixed inset-0 z-50 flex items-end tablet:items-stretch tablet:justify-end">
        <Dialog.Content
          data-sheet
          className={clsx(
            "flex max-h-[92vh] w-full flex-col overflow-hidden border-t border-border bg-bg",
            "tablet:h-full tablet:max-h-none tablet:w-[420px] tablet:border-l tablet:border-t-0",
            "rounded-t-[12px] tablet:rounded-none",
            // mobile: slide up from bottom
            "data-[state=open]:animate-[sheet-in-y_250ms_cubic-bezier(0.2,0.9,0.25,1)]",
            "data-[state=closed]:animate-[sheet-out-y_250ms_cubic-bezier(0.2,0.9,0.25,1)]",
            // desktop: slide in from the right
            "tablet:data-[state=open]:animate-[sheet-in-x_250ms_cubic-bezier(0.2,0.9,0.25,1)]",
            "tablet:data-[state=closed]:animate-[sheet-out-x_250ms_cubic-bezier(0.2,0.9,0.25,1)]",
          )}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex flex-col">
              <Dialog.Title className="font-ui text-[15px] font-semibold tracking-[0.12em] text-text">
                {isDown ? "FILE DOWNTIME REPORT" : "FILE RESTORATION"}
              </Dialog.Title>
              <Dialog.Description className="font-tele text-[10px] tracking-[0.1em] text-text-muted">
                BAKUL HOSTEL · LIFT-01
              </Dialog.Description>
            </div>
            <Badge tone={isDown ? "down" : "restored"} dot>
              {isDown ? "INCIDENT" : "RESTORE"}
            </Badge>
          </div>

          {/* body */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />

            {step === "pick" ? (
              <PickTarget accent={accent} onPick={() => fileInput.current?.click()} />
            ) : (
              <div className="space-y-4">
                {/* preview with viewfinder brackets */}
                {preview ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => preview && openImage(preview, "SELECTED PHOTO")}
                    className="relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-[6px] border border-border bg-black"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Selected lift photo"
                      className="photo-desat grain size-full object-cover"
                    />
                    <Brackets accent={accent} />
                    <span className="absolute left-2 top-2 z-10 rounded-[3px] bg-black/60 px-1.5 py-0.5 font-tele text-[10px] tracking-[0.1em] text-text-2">
                      REC ● {formatISTTime(stampAt)}
                    </span>
                  </div>
                ) : null}

                <CompressionMeter
                  percent={percent}
                  done={step !== "compressing"}
                  tone={isDown ? "down" : "restored"}
                />

                {(step === "ready" ||
                  step === "submitting" ||
                  step === "error") && (
                  <>
                    {/* note */}
                    <label className="block">
                      <span className="mb-1.5 block font-ui text-[12px] font-medium tracking-[0.1em] text-text-2 uppercase">
                        Field note{" "}
                        <span className="text-text-disabled">— optional</span>
                      </span>
                      <textarea
                        value={note}
                        onChange={(e) =>
                          setNote(e.target.value.slice(0, MAX_NOTE_LEN))
                        }
                        rows={2}
                        placeholder={
                          isDown
                            ? "e.g. stuck between 2 and 3, doors won't open"
                            : "e.g. back online, tested up and down"
                        }
                        className="w-full resize-none rounded-[6px] border border-border bg-bg-2 px-3 py-2 font-body text-[14px] text-text placeholder:text-text-disabled focus:border-border-active focus:outline-none"
                      />
                      <span className="mt-1 block text-right font-tele text-[10px] text-text-muted">
                        {note.length}/{MAX_NOTE_LEN}
                      </span>
                    </label>

                    {/* auto-filled metadata — the confirmation */}
                    <dl className="rounded-[6px] border border-border bg-panel px-3 py-2.5 font-tele text-[12px]">
                      <Meta k="TIME" v={formatISTTime(stampAt)} />
                      <Meta k="DATE" v={formatISTDate(stampAt)} />
                      <Meta
                        k="STATUS"
                        v={isDown ? "→ REPORTED DOWN" : "→ RESTORED"}
                        accent={accent}
                      />
                    </dl>

                    {step === "error" && error ? (
                      <p className="rounded-[6px] border border-border-alert bg-danger/10 px-3 py-2 font-body text-[13px] text-danger">
                        {error}
                      </p>
                    ) : null}
                  </>
                )}
              </div>
            )}
          </div>

          {/* sticky footer actions — thumb zone */}
          <div className="border-t border-border px-4 py-3">
            {step === "pick" ? (
              <Dialog.CloseTrigger asChild>
                <Button variant="ghost" full>
                  Cancel
                </Button>
              </Dialog.CloseTrigger>
            ) : step === "compressing" ? (
              <Button variant="neutral" full disabled>
                Compressing…
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="neutral"
                  onClick={() => fileInput.current?.click()}
                  className="flex-1"
                >
                  Retake
                </Button>
                <Button
                  variant={isDown ? "danger" : "success"}
                  onClick={submit}
                  disabled={step === "submitting" || !result}
                  className="flex-[2]"
                >
                  {step === "submitting"
                    ? "Filing…"
                    : isDown
                      ? "File Report"
                      : "File Restoration"}
                </Button>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

function PickTarget({
  accent,
  onPick,
}: {
  accent: string;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="group relative flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-[8px] border border-dashed border-border bg-bg-2 transition-colors duration-150 hover:border-text-muted"
    >
      <Brackets accent={accent} />
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 8h3l1.5-2h7L17 8h3v11H4V8Z"
          stroke={accent}
          strokeWidth="1.4"
        />
        <circle cx="12" cy="13" r="3.2" stroke={accent} strokeWidth="1.4" />
      </svg>
      <span className="font-ui text-[14px] font-semibold tracking-[0.12em] text-text-2">
        CAPTURE / UPLOAD PHOTO
      </span>
      <span className="font-tele text-[11px] tracking-[0.08em] text-text-muted">
        photo of the lift&apos;s current state
      </span>
    </button>
  );
}

function Brackets({ accent }: { accent: string }) {
  const common = "absolute size-5 border-[var(--b)]";
  return (
    <div
      className="pointer-events-none absolute inset-2 z-10"
      style={{ ["--b" as string]: accent }}
    >
      <span className={clsx(common, "left-0 top-0 border-l-2 border-t-2")} />
      <span className={clsx(common, "right-0 top-0 border-r-2 border-t-2")} />
      <span className={clsx(common, "bottom-0 left-0 border-b-2 border-l-2")} />
      <span className={clsx(common, "bottom-0 right-0 border-b-2 border-r-2")} />
    </div>
  );
}

function Meta({ k, v, accent }: { k: string; v: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <dt className="tracking-[0.1em] text-text-muted">{k}</dt>
      <dd style={accent ? { color: accent } : undefined} className="text-text-2">
        {v}
      </dd>
    </div>
  );
}
