-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Meta" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Meta_pkey" PRIMARY KEY ("id")
);
