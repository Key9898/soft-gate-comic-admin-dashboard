-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('visible', 'hidden', 'deleted');

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "user" JSONB NOT NULL,
    "webtoonId" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "status" "CommentStatus" NOT NULL DEFAULT 'visible',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);
