import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { AdminPanel } from "@/components/AdminPanel";
import { StatusStrip } from "@/components/StatusStrip";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin";
import { getMonthReports } from "@/lib/queries";
import { currentMonthIST } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin · BAKUL LIFT DOWN",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const jar = await cookies();
  const authed = tokenValid(jar.get(ADMIN_COOKIE)?.value);

  if (!authed) {
    return (
      <>
        <StatusStrip />
        <main className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-4 py-16">
          <div className="w-full max-w-sm rounded-(--radius) border border-border-alert bg-panel p-6 text-center">
            <div className="font-ui text-[17px] font-semibold tracking-[0.12em] text-danger">
              ACCESS DENIED
            </div>
            <p className="mt-2 font-body text-[13px] text-text-muted">
              This area is restricted. Authenticate by tapping the red status dot
              in the top bar.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-text-2 transition-colors hover:border-text-muted hover:bg-panel-2"
            >
              Back to calendar
            </Link>
          </div>
        </main>
      </>
    );
  }

  const month = currentMonthIST();
  const reports = await getMonthReports(month.year, month.month);
  return (
    <>
      <StatusStrip />
      <AdminPanel initialMonth={month} initialReports={reports} />
    </>
  );
}
