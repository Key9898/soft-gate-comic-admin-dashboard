-- CreateTable
CREATE TABLE "AboutTeamMember" (
    "id" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "role" JSONB NOT NULL,
    "photoUrl" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutTeamMeta" (
    "id" TEXT NOT NULL,
    "deck" JSONB NOT NULL,
    "standInNote" JSONB NOT NULL,
    "standInVisible" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutTeamMeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AboutTeamMember_sortOrder_idx" ON "AboutTeamMember"("sortOrder");
