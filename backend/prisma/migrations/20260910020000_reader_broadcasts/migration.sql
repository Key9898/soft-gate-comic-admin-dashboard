-- CreateEnum
CREATE TYPE "ReaderBroadcastType" AS ENUM ('system', 'promotion');

-- CreateEnum
CREATE TYPE "ReaderBroadcastAudience" AS ENUM ('all', 'selected');

-- CreateEnum
CREATE TYPE "ReaderBroadcastStatus" AS ENUM ('sending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "ReaderBroadcast" (
    "id" TEXT NOT NULL,
    "type" "ReaderBroadcastType" NOT NULL,
    "title" JSONB NOT NULL,
    "message" JSONB NOT NULL,
    "href" TEXT,
    "audience" "ReaderBroadcastAudience" NOT NULL,
    "readerIds" JSONB NOT NULL,
    "status" "ReaderBroadcastStatus" NOT NULL DEFAULT 'sending',
    "createdById" TEXT NOT NULL,
    "inboxCount" INTEGER NOT NULL DEFAULT 0,
    "emailed" INTEGER NOT NULL DEFAULT 0,
    "pushed" INTEGER NOT NULL DEFAULT 0,
    "skippedPref" INTEGER NOT NULL DEFAULT 0,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReaderBroadcast_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReaderBroadcast" ADD CONSTRAINT "ReaderBroadcast_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "StaffUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
