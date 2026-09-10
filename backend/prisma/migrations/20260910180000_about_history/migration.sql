-- CreateTable
CREATE TABLE "AboutHistory" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "photoUrl" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AboutHistory_year_month_idx" ON "AboutHistory"("year", "month");
