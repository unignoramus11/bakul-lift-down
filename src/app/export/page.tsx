import type { Metadata } from "next";
import { ExportPanel } from "@/components/ExportPanel";
import { SlotReveal } from "@/components/SlotReveal";
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
      <SlotReveal fallbackHref="/">
        <ExportPanel />
      </SlotReveal>
    </>
  );
}
