// Client-only image pipeline for the PDF export.
// react-pdf can't decode WebP, and we want the printed "contact sheet" look,
// so every image is redrawn to a small grayscale JPEG on a canvas first.

import type { ReportDTO } from "../reports";

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
  ctx.fillStyle = "#e7ecf1";
  ctx.fillRect(0, 0, size, size);

  // center-crop to square
  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;
  ctx.filter = "grayscale(1) contrast(1.06)";
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
