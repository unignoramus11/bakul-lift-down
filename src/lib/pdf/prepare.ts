// Client-only helpers for the PDF export.
// react-pdf can't decode WebP, and we want the printed "contact sheet" look,
// so every image is redrawn to a small grayscale JPEG on a canvas first.

import type { ReportDTO, ReportKind } from "../reports";
import { dayKeysBetween } from "../time";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Redraw any image data URL as a square, desaturated JPEG. */
export async function toGrayscaleJpeg(
  dataUrl: string,
  size = 240,
): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#0b1118";
  ctx.fillRect(0, 0, size, size);

  // center-crop to square
  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;
  ctx.filter = "grayscale(1) contrast(1.08) brightness(0.98)";
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.72);
}

/** Build id → grayscale-jpeg map for a set of reports. */
export async function buildThumbMap(
  reports: ReportDTO[],
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  await Promise.all(
    reports.map(async (r) => {
      try {
        out[r.id] = await toGrayscaleJpeg(r.imageData);
      } catch {
        /* skip unreadable image */
      }
    }),
  );
  return out;
}

// ── Mock data (design preview / empty ranges) ───────────────────────────────

const NOTES_DOWN = [
  "stuck between 2 and 3, doors won't open",
  "no response on any floor, panel dark",
  "makes grinding noise then stops",
  "doors keep re-opening, won't move",
  "trapped 5 min, alarm not working",
  "",
];
const NOTES_UP = [
  "back online, tested up and down",
  "technician left, running normally",
  "restored, doors smooth again",
  "",
];

function placeholderImage(label: string, sub: string, down: boolean): string {
  const size = 240;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, "#1a2532");
  g.addColorStop(1, "#0b1118");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(120,140,160,0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= size; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }
  ctx.fillStyle = down ? "rgba(255,77,103,0.85)" : "rgba(68,209,122,0.85)";
  ctx.font = "600 26px monospace";
  ctx.textAlign = "center";
  ctx.fillText(label, size / 2, size / 2 - 4);
  ctx.fillStyle = "rgba(179,193,207,0.7)";
  ctx.font = "12px monospace";
  ctx.fillText(sub, size / 2, size / 2 + 22);
  return canvas.toDataURL("image/jpeg", 0.7);
}

/** Deterministic-ish sample reports spread across the range. */
export function makeMockReports(from: string, to: string): ReportDTO[] {
  const keys = dayKeysBetween(from, to);
  const reports: ReportDTO[] = [];
  let seq = 0;
  const rnd = mulberry32(hash(`${from}|${to}`));

  keys.forEach((dateKey, di) => {
    // ~35% of days see an incident
    if (rnd() > 0.35) return;
    const bursts = 1 + Math.floor(rnd() * 3);
    let downOpen = false;
    for (let b = 0; b < bursts; b++) {
      const kind: ReportKind =
        !downOpen || rnd() > 0.55 ? "DOWN" : "RESTORED";
      downOpen = kind === "DOWN";
      const hour = 7 + Math.floor(rnd() * 14);
      const min = Math.floor(rnd() * 60);
      const [y, m, d] = dateKey.split("-").map(Number);
      // IST wall-clock → UTC instant
      const created = new Date(Date.UTC(y, m - 1, d, hour - 5, min - 30));
      const down = kind === "DOWN";
      const notes = down ? NOTES_DOWN : NOTES_UP;
      reports.push({
        id: `mock-${di}-${b}-${seq++}`,
        kind,
        imageData: placeholderImage(
          down ? "DOWN" : "OK",
          `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")} IST`,
          down,
        ),
        imageMime: "image/jpeg",
        imageBytes: 4200,
        note: notes[Math.floor(rnd() * notes.length)] || null,
        dateKey,
        createdAt: created.toISOString(),
      });
    }
  });
  return reports;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
