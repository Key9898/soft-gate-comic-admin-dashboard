-- CreateEnum
CREATE TYPE "AuthorStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "WebtoonStatus" AS ENUM ('ongoing', 'completed', 'hiatus', 'draft');

-- CreateEnum
CREATE TYPE "EpisodeStatus" AS ENUM ('published', 'draft', 'scheduled');

-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "bio" JSONB,
    "avatar" TEXT,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "status" "AuthorStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Webtoon" (
    "id" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "coverImage" TEXT,
    "coverColor" TEXT NOT NULL DEFAULT '',
    "authorId" TEXT NOT NULL,
    "tags" TEXT[],
    "status" "WebtoonStatus" NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contentRating" TEXT NOT NULL,
    "spotlight" BOOLEAN NOT NULL DEFAULT false,
    "spotlightOrder" INTEGER,
    "weeklyViewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Webtoon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebtoonGenre" (
    "webtoonId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,

    CONSTRAINT "WebtoonGenre_pkey" PRIMARY KEY ("webtoonId","genreId")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL,
    "webtoonId" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB,
    "images" TEXT[],
    "imageSizes" JSONB,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "coinPrice" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "episodeNumber" INTEGER NOT NULL,
    "status" "EpisodeStatus" NOT NULL,
    "freeAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Genre_slug_key" ON "Genre"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_webtoonId_episodeNumber_key" ON "Episode"("webtoonId", "episodeNumber");

-- AddForeignKey
ALTER TABLE "Webtoon" ADD CONSTRAINT "Webtoon_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebtoonGenre" ADD CONSTRAINT "WebtoonGenre_webtoonId_fkey" FOREIGN KEY ("webtoonId") REFERENCES "Webtoon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebtoonGenre" ADD CONSTRAINT "WebtoonGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_webtoonId_fkey" FOREIGN KEY ("webtoonId") REFERENCES "Webtoon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

