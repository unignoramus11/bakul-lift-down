import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin";
import { getMonthReports } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/reports?month=YYYY-MM — reports for a month. Admin only.
export async function GET(req: Request) {
  const jar = await cookies();
  if (!tokenValid(jar.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const m = month ? /^(\d{4})-(\d{2})$/.exec(month) : null;
  if (!m) {
    return NextResponse.json({ error: "Provide ?month=YYYY-MM." }, { status: 400 });
  }
  const year = Number(m[1]);
  const month1 = Number(m[2]);
  if (month1 < 1 || month1 > 12) {
    return NextResponse.json({ error: "Month out of range." }, { status: 400 });
  }

  const reports = await getMonthReports(year, month1);
  return NextResponse.json({ month, reports });
}
