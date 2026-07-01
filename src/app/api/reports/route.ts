import { NextResponse } from "next/server";
import {
  MAX_IMAGE_BYTES_HARD,
  MAX_IMAGE_KB,
  MAX_NOTE_LEN,
} from "@/lib/config";
import {
  createReport,
  getDayReports,
  getMonthSummaries,
  getRangeReports,
} from "@/lib/queries";
import type { ReportKind } from "@/lib/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/reports?month=YYYY-MM   → per-day calendar summaries
// GET /api/reports?date=YYYY-MM-DD → full report list for a day (timeline)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    if (from || to) {
      if (!from || !to || !DAY_RE.test(from) || !DAY_RE.test(to)) {
        return bad("Range needs from & to as YYYY-MM-DD.");
      }
      const reports = await getRangeReports(from, to);
      return NextResponse.json({ from, to, reports });
    }

    if (date) {
      if (!DAY_RE.test(date)) {
        return bad("Malformed date. Expected YYYY-MM-DD.");
      }
      const reports = await getDayReports(date);
      return NextResponse.json({ dateKey: date, reports });
    }

    if (month) {
      const m = /^(\d{4})-(\d{2})$/.exec(month);
      if (!m) return bad("Malformed month. Expected YYYY-MM.");
      const year = Number(m[1]);
      const month1 = Number(m[2]);
      if (month1 < 1 || month1 > 12) return bad("Month out of range.");
      const days = await getMonthSummaries(year, month1);
      return NextResponse.json({ month, days });
    }

    return bad("Provide ?month=YYYY-MM or ?date=YYYY-MM-DD.");
  } catch (err) {
    console.error("[GET /api/reports]", err);
    return NextResponse.json({ error: "Query failed." }, { status: 500 });
  }
}

// POST /api/reports — file a DOWN or RESTORED report.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("Body must be JSON.");
  }

  const {
    kind,
    imageData,
    imageMime,
    imageBytes,
    note,
  } = (body ?? {}) as Record<string, unknown>;

  if (kind !== "DOWN" && kind !== "RESTORED") {
    return bad("kind must be DOWN or RESTORED.");
  }
  if (typeof imageData !== "string" || !imageData.startsWith("data:image/")) {
    return bad("imageData must be an image data URL.");
  }
  if (imageData.length > MAX_IMAGE_BYTES_HARD) {
    return bad(
      `Image too large after compression (target ${MAX_IMAGE_KB} KB). Not saved.`,
    );
  }
  if (typeof note === "string" && note.length > MAX_NOTE_LEN) {
    return bad(`Note must be ${MAX_NOTE_LEN} characters or fewer.`);
  }

  const mime =
    typeof imageMime === "string" && imageMime.startsWith("image/")
      ? imageMime
      : "image/webp";
  const bytes =
    typeof imageBytes === "number" && imageBytes > 0
      ? Math.round(imageBytes)
      : Math.round((imageData.length * 3) / 4);

  try {
    const report = await createReport({
      kind: kind as ReportKind,
      imageData,
      imageMime: mime,
      imageBytes: bytes,
      note: typeof note === "string" ? note : null,
    });
    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/reports]", err);
    return NextResponse.json({ error: "Could not file report." }, { status: 500 });
  }
}

function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
