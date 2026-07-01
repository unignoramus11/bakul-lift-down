// Shared config. NEXT_PUBLIC_ so the client compressor and the server-side
// guard read the exact same budget.
export const MAX_IMAGE_KB = Number(
  process.env.NEXT_PUBLIC_MAX_IMAGE_KB ?? "20",
);

export const MAX_IMAGE_BYTES = MAX_IMAGE_KB * 1024;

// A little slack over the client budget so a report is never rejected for being
// a few bytes over the target after base64 overhead — the client aims for
// MAX_IMAGE_KB, the server refuses only clearly-oversized payloads.
export const MAX_IMAGE_BYTES_HARD = Math.ceil(MAX_IMAGE_BYTES * 1.6);

export const MAX_NOTE_LEN = 280;
