-- CreateTable
CREATE TABLE "FaqMeta" (
    "id" TEXT NOT NULL,
    "nextItemNumber" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqItem" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "question" JSONB NOT NULL,
    "answer" JSONB NOT NULL,
    "relatedTo" TEXT,
    "relatedLabel" JSONB,
    "sortOrder" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CookieMeta" (
    "id" TEXT NOT NULL,
    "effectiveDate" TEXT NOT NULL,
    "copy" JSONB NOT NULL,
    "glance" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CookieMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CookieStorageRow" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "label" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CookieStorageRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FaqItem_sortOrder_idx" ON "FaqItem"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CookieStorageRow_storageKey_key" ON "CookieStorageRow"("storageKey");

-- CreateIndex
CREATE INDEX "CookieStorageRow_sortOrder_idx" ON "CookieStorageRow"("sortOrder");
