-- CreateTable
CREATE TABLE "PressMeta" (
    "id" TEXT NOT NULL,
    "copy" JSONB NOT NULL,
    "zipUrl" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "facts" JSONB NOT NULL,
    "palette" JSONB NOT NULL,
    "assets" JSONB NOT NULL,
    "spokespersonMemberId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PressMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PressNews" (
    "id" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "body" JSONB NOT NULL,
    "href" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "demoBadge" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PressNews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PressStill" (
    "id" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "demoBadge" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PressStill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PressNews_sortOrder_idx" ON "PressNews"("sortOrder");

-- CreateIndex
CREATE INDEX "PressStill_sortOrder_idx" ON "PressStill"("sortOrder");
