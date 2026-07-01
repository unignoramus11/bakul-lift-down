// Remembers the on-screen rect of the calendar cell that was last tapped, so
// the date view can animate open (and closed) from exactly that slot. Cleared
// implicitly on a fresh page load (module state resets), so direct visits just
// fade in.
export type SlotRect = { left: number; top: number; width: number; height: number };

let origin: SlotRect | null = null;

export function setSlotOrigin(rect: SlotRect) {
  origin = rect;
}

export function getSlotOrigin(): SlotRect | null {
  return origin;
}
