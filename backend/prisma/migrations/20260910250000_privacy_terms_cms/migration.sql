-- CreateTable
CREATE TABLE "PrivacyMeta" (
    "id" TEXT NOT NULL,
    "seoDesc" JSONB NOT NULL,
    "glance" JSONB NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivacyMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivacySection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "headingLevel" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "body" JSONB NOT NULL,
    "bullets" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivacySection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TermsMeta" (
    "id" TEXT NOT NULL,
    "seoDesc" JSONB NOT NULL,
    "glance" JSONB NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TermsMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TermsSection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "headingLevel" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "body" JSONB NOT NULL,
    "bullets" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TermsSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrivacySection_slug_key" ON "PrivacySection"("slug");

-- CreateIndex
CREATE INDEX "PrivacySection_sortOrder_idx" ON "PrivacySection"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TermsSection_slug_key" ON "TermsSection"("slug");

-- CreateIndex
CREATE INDEX "TermsSection_sortOrder_idx" ON "TermsSection"("sortOrder");
