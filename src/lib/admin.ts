import "server-only";
import { createHash } from "node:crypto";

// Minimal admin gate. A single password lives in ADMIN_PASSWORD. On successful
// login we set an httpOnly cookie holding an opaque token (a hash of the
// password) that protected routes re-derive and compare — no session store
// needed. If ADMIN_PASSWORD is unset, admin access is disabled entirely.

const PASSWORD = process.env.ADMIN_PASSWORD ?? "";

export const ADMIN_COOKIE = "bld_admin";

export function adminConfigured(): boolean {
  return PASSWORD.length > 0;
}

/** Opaque token stored in the cookie (never the password itself). */
export function adminToken(): string {
  return createHash("sha256").update(`bld-admin:${PASSWORD}`).digest("hex");
}

export function checkPassword(pw: unknown): boolean {
  return adminConfigured() && typeof pw === "string" && pw === PASSWORD;
}

export function tokenValid(token: string | undefined | null): boolean {
  return adminConfigured() && !!token && token === adminToken();
}
