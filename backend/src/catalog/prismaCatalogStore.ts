import { Prisma, type PrismaClient } from '@prisma/client';
import {
  CatalogConflictError,
  type AuthorRecord,
  type AuthorStatus,
  type BilingualText,
  type CatalogStore,
  type EpisodeRecord,
  type EpisodeStatus,
  type GenreRecord,
  type ImageSize,
  type WebtoonRecord,
  type WebtoonStatus,
} from './catalogStore.js';

function asBilingual(value: Prisma.JsonValue): BilingualText {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const row = value as { en?: unknown; mm?: unknown };
    return {
      en: typeof row.en === 'string' ? row.en : '',
      mm: typeof row.mm === 'string' ? row.mm : '',
    };
  }
  return { en: '', mm: '' };
}

function asImageSizes(value: Prisma.JsonValue | null): ImageSize[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((item) => {
    if (item === null) return null;
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const row = item as { width?: unknown; height?: unknown };
      if (typeof row.width === 'number' && typeof row.height === 'number') {
        return { width: row.width, height: row.height };
      }
    }
    return null;
  });
}

function jsonValue(
  value: BilingualText | ImageSize[] | undefined,
): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return value as Prisma.InputJsonValue;
}

function toAuthor(row: {
  id: string;
  name: Prisma.JsonValue;
  bio: Prisma.JsonValue | null;
  avatar: string | null;
  followerCount: number;
  status: AuthorStatus;
  createdAt: Date;
  updatedAt: Date;
}): AuthorRecord {
  return {
    id: row.id,
    name: asBilingual(row.name),
    bio: row.bio == null ? undefined : asBilingual(row.bio),
    avatar: row.avatar ?? undefined,
    followerCount: row.followerCount,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toGenre(row: {
  id: string;
  name: Prisma.JsonValue;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}): GenreRecord {
  return {
    id: row.id,
    name: asBilingual(row.name),
    slug: row.slug,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toWebtoon(row: {
  id: string;
  title: Prisma.JsonValue;
  description: Prisma.JsonValue;
  coverImage: string | null;
  coverColor: string;
  authorId: string;
  tags: string[];
  status: WebtoonStatus;
  isPremium: boolean;
  viewCount: number;
  likeCount: number;
  rating: number;
  contentRating: string;
  spotlight: boolean;
  spotlightOrder: number | null;
  weeklyViewCount: number;
  createdAt: Date;
  updatedAt: Date;
  genres: { genreId: string }[];
}): WebtoonRecord {
  return {
    id: row.id,
    title: asBilingual(row.title),
    description: asBilingual(row.description),
    coverImage: row.coverImage ?? undefined,
    coverColor: row.coverColor,
    authorId: row.authorId,
    genreIds: row.genres.map((item) => item.genreId),
    tags: row.tags,
    status: row.status,
    isPremium: row.isPremium,
    viewCount: row.viewCount,
    likeCount: row.likeCount,
    rating: row.rating,
    contentRating: row.contentRating,
    spotlight: row.spotlight,
    spotlightOrder: row.spotlightOrder ?? undefined,
    weeklyViewCount: row.weeklyViewCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toEpisode(row: {
  id: string;
  webtoonId: string;
  title: Prisma.JsonValue;
  description: Prisma.JsonValue | null;
  images: string[];
  imageSizes: Prisma.JsonValue | null;
  isPremium: boolean;
  coinPrice: number;
  viewCount: number;
  likeCount: number;
  episodeNumber: number;
  status: EpisodeStatus;
  freeAt: Date | null;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): EpisodeRecord {
  return {
    id: row.id,
    webtoonId: row.webtoonId,
    title: asBilingual(row.title),
    description: row.description == null ? undefined : asBilingual(row.description),
    images: row.images,
    imageSizes: asImageSizes(row.imageSizes),
    isPremium: row.isPremium,
    coinPrice: row.coinPrice,
    viewCount: row.viewCount,
    likeCount: row.likeCount,
    episodeNumber: row.episodeNumber,
    status: row.status,
    freeAt: row.freeAt ?? undefined,
    scheduledAt: row.scheduledAt ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function rethrowConflict(err: unknown): never {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    (err.code === 'P2002' || err.code === 'P2003')
  ) {
    throw new CatalogConflictError();
  }
  throw err;
}

const webtoonInclude = { genres: true } as const;

export function createPrismaCatalogStore(prisma: PrismaClient): CatalogStore {
  return {
    async listAuthors() {
      const rows = await prisma.author.findMany({ orderBy: { createdAt: 'asc' } });
      return rows.map(toAuthor);
    },
    async findAuthorById(id) {
      const row = await prisma.author.findUnique({ where: { id } });
      return row ? toAuthor(row) : null;
    },
    async createAuthor(input) {
      const row = await prisma.author.create({
        data: {
          id: input.id,
          name: jsonValue(input.name) as Prisma.InputJsonValue,
          bio: jsonValue(input.bio) ?? Prisma.JsonNull,
          avatar: input.avatar,
          followerCount: input.followerCount,
          status: input.status,
        },
      });
      return toAuthor(row);
    },
    async updateAuthor(id, patch) {
      try {
        const row = await prisma.author.update({
          where: { id },
          data: {
            ...(patch.name ? { name: jsonValue(patch.name) } : {}),
            ...(patch.bio !== undefined ? { bio: jsonValue(patch.bio) ?? Prisma.JsonNull } : {}),
            ...(patch.avatar !== undefined ? { avatar: patch.avatar ?? null } : {}),
            ...(patch.status ? { status: patch.status } : {}),
          },
        });
        return toAuthor(row);
      } catch {
        return null;
      }
    },
    async deleteAuthor(id) {
      try {
        await prisma.author.delete({ where: { id } });
        return true;
      } catch (err) {
        rethrowConflict(err);
      }
    },

    async listGenres() {
      const rows = await prisma.genre.findMany({ orderBy: { createdAt: 'asc' } });
      return rows.map(toGenre);
    },
    async findGenreById(id) {
      const row = await prisma.genre.findUnique({ where: { id } });
      return row ? toGenre(row) : null;
    },
    async findGenreBySlug(slug) {
      const row = await prisma.genre.findUnique({ where: { slug: slug.toLowerCase() } });
      return row ? toGenre(row) : null;
    },
    async createGenre(input) {
      try {
        const row = await prisma.genre.create({
          data: {
            id: input.id,
            name: jsonValue(input.name) as Prisma.InputJsonValue,
            slug: input.slug.toLowerCase(),
          },
        });
        return toGenre(row);
      } catch (err) {
        rethrowConflict(err);
      }
    },
    async updateGenre(id, patch) {
      try {
        const row = await prisma.genre.update({
          where: { id },
          data: { name: jsonValue(patch.name) as Prisma.InputJsonValue },
        });
        return toGenre(row);
      } catch {
        return null;
      }
    },
    async deleteGenre(id) {
      try {
        await prisma.genre.delete({ where: { id } });
        return true;
      } catch (err) {
        rethrowConflict(err);
      }
    },

    async listWebtoons() {
      const rows = await prisma.webtoon.findMany({
        include: webtoonInclude,
        orderBy: { createdAt: 'desc' },
      });
      return rows.map(toWebtoon);
    },
    async findWebtoonById(id) {
      const row = await prisma.webtoon.findUnique({ where: { id }, include: webtoonInclude });
      return row ? toWebtoon(row) : null;
    },
    async createWebtoon(input) {
      const row = await prisma.webtoon.create({
        data: {
          id: input.id,
          title: jsonValue(input.title) as Prisma.InputJsonValue,
          description: jsonValue(input.description) as Prisma.InputJsonValue,
          coverImage: input.coverImage,
          coverColor: input.coverColor,
          authorId: input.authorId,
          tags: input.tags,
          status: input.status,
          isPremium: input.isPremium,
          viewCount: input.viewCount,
          likeCount: input.likeCount,
          rating: input.rating,
          contentRating: input.contentRating,
          spotlight: input.spotlight,
          spotlightOrder: input.spotlightOrder ?? null,
          weeklyViewCount: input.weeklyViewCount,
          genres: { create: input.genreIds.map((genreId) => ({ genreId })) },
        },
        include: webtoonInclude,
      });
      return toWebtoon(row);
    },
    async updateWebtoon(id, patch) {
      try {
        const data: Prisma.WebtoonUpdateInput = {
          ...(patch.title ? { title: jsonValue(patch.title) } : {}),
          ...(patch.description ? { description: jsonValue(patch.description) } : {}),
          ...(patch.coverImage !== undefined ? { coverImage: patch.coverImage ?? null } : {}),
          ...(patch.coverColor !== undefined ? { coverColor: patch.coverColor } : {}),
          ...(patch.authorId ? { author: { connect: { id: patch.authorId } } } : {}),
          ...(patch.tags ? { tags: patch.tags } : {}),
          ...(patch.status ? { status: patch.status } : {}),
          ...(patch.isPremium !== undefined ? { isPremium: patch.isPremium } : {}),
          ...(patch.contentRating ? { contentRating: patch.contentRating } : {}),
          ...(patch.spotlight !== undefined ? { spotlight: patch.spotlight } : {}),
          ...(patch.spotlight === false
            ? { spotlightOrder: null }
            : patch.spotlightOrder !== undefined
              ? { spotlightOrder: patch.spotlightOrder }
              : {}),
          ...(patch.weeklyViewCount !== undefined
            ? { weeklyViewCount: patch.weeklyViewCount }
            : {}),
        };
        if (patch.genreIds) {
          data.genres = {
            deleteMany: {},
            create: patch.genreIds.map((genreId) => ({ genreId })),
          };
        }
        const row = await prisma.webtoon.update({
          where: { id },
          data,
          include: webtoonInclude,
        });
        return toWebtoon(row);
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
          return null;
        }
        rethrowConflict(err);
      }
    },
    async deleteWebtoon(id) {
      try {
        await prisma.webtoon.delete({ where: { id } });
        return true;
      } catch (err) {
        rethrowConflict(err);
      }
    },

    async listEpisodes(webtoonId) {
      const rows = await prisma.episode.findMany({
        where: webtoonId ? { webtoonId } : undefined,
        orderBy: { episodeNumber: 'asc' },
      });
      return rows.map(toEpisode);
    },
    async findEpisodeById(id) {
      const row = await prisma.episode.findUnique({ where: { id } });
      return row ? toEpisode(row) : null;
    },
    async createEpisode(input) {
      try {
        const row = await prisma.episode.create({
          data: {
            id: input.id,
            webtoonId: input.webtoonId,
            title: jsonValue(input.title) as Prisma.InputJsonValue,
            description: jsonValue(input.description) ?? Prisma.JsonNull,
            images: input.images,
            imageSizes: jsonValue(input.imageSizes) ?? Prisma.JsonNull,
            isPremium: input.isPremium,
            coinPrice: input.coinPrice,
            viewCount: input.viewCount,
            likeCount: input.likeCount,
            episodeNumber: input.episodeNumber,
            status: input.status,
            freeAt: input.freeAt ?? null,
            scheduledAt: input.scheduledAt ?? null,
          },
        });
        return toEpisode(row);
      } catch (err) {
        rethrowConflict(err);
      }
    },
    async updateEpisode(id, patch) {
      try {
        const row = await prisma.episode.update({
          where: { id },
          data: {
            ...(patch.title ? { title: jsonValue(patch.title) } : {}),
            ...(patch.description !== undefined
              ? { description: jsonValue(patch.description) ?? Prisma.JsonNull }
              : {}),
            ...(patch.images ? { images: patch.images } : {}),
            ...(patch.imageSizes !== undefined
              ? { imageSizes: jsonValue(patch.imageSizes) ?? Prisma.JsonNull }
              : {}),
            ...(patch.isPremium !== undefined ? { isPremium: patch.isPremium } : {}),
            ...(patch.coinPrice !== undefined ? { coinPrice: patch.coinPrice } : {}),
            ...(patch.episodeNumber !== undefined ? { episodeNumber: patch.episodeNumber } : {}),
            ...(patch.status ? { status: patch.status } : {}),
            ...(patch.freeAt !== undefined ? { freeAt: patch.freeAt ?? null } : {}),
            ...(patch.scheduledAt !== undefined ? { scheduledAt: patch.scheduledAt ?? null } : {}),
          },
        });
        return toEpisode(row);
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
          return null;
        }
        rethrowConflict(err);
      }
    },
    async deleteEpisode(id) {
      try {
        await prisma.episode.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
    async maxEpisodeNumber(webtoonId) {
      const row = await prisma.episode.aggregate({
        where: { webtoonId },
        _max: { episodeNumber: true },
      });
      return row._max.episodeNumber ?? 0;
    },
  };
}
