-- CreateEnum
CREATE TYPE "PlatformLanguage" AS ENUM ('en', 'mm');

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL,
    "maintenanceMode" BOOLEAN NOT NULL,
    "allowRegistration" BOOLEAN NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "defaultLanguage" "PlatformLanguage" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);
