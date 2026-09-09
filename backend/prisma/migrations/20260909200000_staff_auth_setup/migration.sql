-- AlterTable
ALTER TABLE "StaffUser" ADD COLUMN "totpEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "StaffUser" ADD COLUMN "totpSecret" TEXT;
ALTER TABLE "StaffUser" ADD COLUMN "totpBackupHashes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "StaffPasswordReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffPasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffPasswordReset_tokenHash_key" ON "StaffPasswordReset"("tokenHash");

-- AddForeignKey
ALTER TABLE "StaffPasswordReset" ADD CONSTRAINT "StaffPasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "StaffUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
