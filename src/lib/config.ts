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

// Reports must be filed with a freshly-taken photo. Anything captured more than
// this many minutes ago (per EXIF / file timestamp) is rejected client-side.
export const MAX_PHOTO_AGE_MIN = Number(
  process.env.NEXT_PUBLIC_MAX_PHOTO_AGE_MIN ?? "5",
);
export const MAX_PHOTO_AGE_MS = MAX_PHOTO_AGE_MIN * 60 * 1000;

// The server re-checks the client-reported capture time, but leniently: the
// client already gated freshness at capture, and the user may take a few
// minutes to add a note and submit. This grace covers that flow so only
// clearly-stale timestamps are refused server-side.
export const SERVER_PHOTO_AGE_GRACE_MS = 10 * 60 * 1000;
