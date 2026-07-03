import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/session — whether the current visitor holds a valid admin
// cookie (cheap, no DB). Lets the top-bar dot skip the password prompt when
// already logged in.
export async function GET() {
  const jar = await cookies();
  return NextResponse.json({ authed: tokenValid(jar.get(ADMIN_COOKIE)?.value) });
}
