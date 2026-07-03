import imageCompression from "browser-image-compression";
import { MAX_IMAGE_KB } from "./config";

// Heavily compress a chosen photo, client-side, until the encoded image is
// under the configured budget (default 20 KB). WebP first for the best
// ratio; a second, more aggressive pass runs only if the first overshoots.

export type CompressResult = {
  dataUrl: string; // "data:image/webp;base64,..."
  bytes: number; // size of the compressed image
  mime: string;
  originalBytes: number;
};

const TARGET_MB = MAX_IMAGE_KB / 1024;

export async function compressImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<CompressResult> {
  const originalBytes = file.size;

  let out = await imageCompression(file, {
    maxSizeMB: TARGET_MB,
    maxWidthOrHeight: 1280,
    initialQuality: 0.72,
    fileType: "image/webp",
    useWebWorker: true,
    onProgress,
  });

  // Second pass if the target wasn't met (very detailed photos).
  if (out.size > MAX_IMAGE_KB * 1024) {
    out = await imageCompression(out, {
      maxSizeMB: TARGET_MB,
      maxWidthOrHeight: 720,
      initialQuality: 0.5,
      fileType: "image/webp",
      useWebWorker: true,
    });
  }

  const dataUrl = await imageCompression.getDataUrlFromFile(out);
  onProgress?.(100);

  return {
    dataUrl,
    bytes: out.size,
    mime: out.type || "image/webp",
    originalBytes,
  };
}
