// A stable, anonymous per-device identifier kept in localStorage. Used only to
// scope report rate-limiting to this device (see lib/ratelimit.ts). It carries
// no personal data — just a random UUID.
const KEY = "bld:device-id";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}
