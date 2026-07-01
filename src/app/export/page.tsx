import type { Metadata } from "next";
import { ExportPanel } from "@/components/ExportPanel";
import { StatusStrip } from "@/components/StatusStrip";

export const metadata: Metadata = {
  title: "Generate PDF Report · BAKUL LIFT DOWN",
  description:
    "Export a PDF report of Bakul Hostel lift downtime over any date range.",
  alternates: { canonical: "/export" },
};

export default function ExportPage() {
  return (
    <>
      <StatusStrip />
      <ExportPanel />
    </>
  );
}
