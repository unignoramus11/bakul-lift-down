-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ReportKind" AS ENUM ('DOWN', 'RESTORED');

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "kind" "ReportKind" NOT NULL,
    "imageData" TEXT NOT NULL,
    "imageMime" TEXT NOT NULL DEFAULT 'image/webp',
    "imageBytes" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "dateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_dateKey_idx" ON "Report"("dateKey");

-- CreateIndex
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");

