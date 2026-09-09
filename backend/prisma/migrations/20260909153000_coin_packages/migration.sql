-- CreateTable
CREATE TABLE "CoinPackage" (
    "id" TEXT NOT NULL,
    "coins" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "bonus" INTEGER,
    "popular" BOOLEAN,
    "bestValue" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoinPackage_pkey" PRIMARY KEY ("id")
);
