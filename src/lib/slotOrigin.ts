// Remembers the on-screen rect of the calendar cell (or launch button) that was
// last tapped, so the target view animates open — and closed — from exactly
// that slot. Cleared implicitly on a fresh page load (module state resets), so
// direct visits just fade in.
export type SlotRect = { left: number; top: number; width: number; height: number };

let origin: SlotRect | null = null;

// When a route shows its loading skeleton first, the skeleton plays the
// grow-from-slot animation. This flag lets the real page know the open
// animation was already handled, so it appears in place instead of
// re-animating (which would look like a shrink-then-grow).
let skeletonOpened = false;

export function setSlotOrigin(rect: SlotRect) {
  origin = rect;
  // A fresh navigation — the skeleton hasn't animated yet.
  skeletonOpened = false;
}

export function getSlotOrigin(): SlotRect | null {
  return origin;
}

/** Called by a loading skeleton once it has played the grow-from-slot open. */
export function markSkeletonOpened() {
  skeletonOpened = true;
}

/** Read-and-reset: true if a skeleton already played the open animation. */
export function consumeSkeletonOpened(): boolean {
  const v = skeletonOpened;
  skeletonOpened = false;
  return v;
}
