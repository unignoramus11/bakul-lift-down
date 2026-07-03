import { MAX_PHOTO_AGE_MS } from "./config";

// Verify a chosen photo was taken recently, so people can't upload stale/old
// pictures of the lift. Read from the ORIGINAL file (compression strips EXIF).
//
// Timezone handling:
//  • If EXIF has OffsetTimeOriginal, we know the absolute instant exactly.
//  • Otherwise EXIF's DateTimeOriginal is a naive local time — interpret it in
//    the device's timezone (the photo was just taken on this device), which
//    yields the correct instant to diff against `Date.now()`.
//  • file.lastModified is already absolute epoch ms, used as a fallback.

const pad = (n: number) => String(n).padStart(2, "0");

async function exifTakenAt(file: File): Promise<Date | null> {
  try {
    const exifr = (await import("exifr")).default;
    const raw = (await exifr.parse(file, {
      pick: ["DateTimeOriginal", "OffsetTimeOriginal", "CreateDate"],
      reviveValues: false,
    })) as
      | { DateTimeOriginal?: unknown; OffsetTimeOriginal?: unknown; CreateDate?: unknown }
      | undefined;

    const dt =
      (typeof raw?.DateTimeOriginal === "string" && raw.DateTimeOriginal) ||
      (typeof raw?.CreateDate === "string" && raw.CreateDate) ||
      null;
    if (!dt) return null;

    // "YYYY:MM:DD HH:MM:SS"
    const m = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(dt);
    if (!m) return null;
    const [, y, mo, d, h, mi, s] = m.map(Number);

    const offset =
      typeof raw?.OffsetTimeOriginal === "string" ? raw.OffsetTimeOriginal : null;
    if (offset && /^[+-]\d{2}:\d{2}$/.test(offset)) {
      const abs = new Date(
        `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}:${pad(s)}${offset}`,
      );
      return isNaN(abs.getTime()) ? null : abs;
    }
    // No offset — interpret in the device's local timezone.
    const local = new Date(y, mo - 1, d, h, mi, s);
    return isNaN(local.getTime()) ? null : local;
  } catch {
    return null;
  }
}

export type FreshnessResult = {
  ok: boolean;
  takenAt: Date | null;
  ageMs: number | null;
};

/** True `ok` if the photo was taken within the allowed window (or age unknown). */
export async function checkPhotoFreshness(file: File): Promise<FreshnessResult> {
  let takenAt = await exifTakenAt(file);
  if (!takenAt && file.lastModified) {
    takenAt = new Date(file.lastModified);
  }
  if (!takenAt) {
    // Couldn't determine — don't block (best-effort guard).
    return { ok: true, takenAt: null, ageMs: null };
  }
  const ageMs = Date.now() - takenAt.getTime();
  // Allow small clock skew (future timestamps); reject only when clearly old.
  return { ok: ageMs <= MAX_PHOTO_AGE_MS, takenAt, ageMs };
}
