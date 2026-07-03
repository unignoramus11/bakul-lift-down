import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin";
import { deleteReport } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// DELETE /api/admin/reports/[id] — removes one report. Admin cookie required.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const jar = await cookies();
  if (!tokenValid(jar.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const ok = await deleteReport(id);
  if (!ok) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
