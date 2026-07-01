import { NextResponse } from "next/server";
import { getTodayLive } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/status — today's live lift status for the hero (polled client-side).
export async function GET() {
  try {
    const live = await getTodayLive();
    return NextResponse.json(live);
  } catch (err) {
    console.error("[GET /api/status]", err);
    return NextResponse.json({ error: "Status unavailable." }, { status: 500 });
  }
}
