-- CreateEnum
CREATE TYPE "StaffNotificationType" AS ENUM ('system', 'report', 'payment', 'content');

-- CreateTable
CREATE TABLE "StaffNotification" (
    "id" TEXT NOT NULL,
    "type" "StaffNotificationType" NOT NULL,
    "title" JSONB NOT NULL,
    "message" JSONB NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actionUrl" TEXT,

    CONSTRAINT "StaffNotification_pkey" PRIMARY KEY ("id")
);
