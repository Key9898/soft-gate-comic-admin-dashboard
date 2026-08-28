import { randomUUID } from 'node:crypto';
import {
  CatalogConflictError,
  type AuthorPatch,
  type AuthorRecord,
  type CatalogStore,
  type EpisodePatch,
  type EpisodeRecord,
  type GenreRecord,
  type WebtoonPatch,
  type WebtoonRecord,
} from './catalogStore.js';

export function newCatalogId(): string {
  return randomUUID();
}

export function createMemoryCatalogStore(): CatalogStore {
  const authors = new Map<string, AuthorRecord>();
  const genres = new Map<string, GenreRecord>();
  const webtoons = new Map<string, WebtoonRecord>();
  const episodes = new Map<string, EpisodeRecord>();

  const stamp = (existing?: Date) => existing ?? new Date();

  return {
    async listAuthors() {
      return [...authors.values()];
    },
    async findAuthorById(id) {
      return authors.get(id) ?? null;
    },
    async createAuthor(input) {
      const now = new Date();
      const row: AuthorRecord = { ...input, createdAt: now, updatedAt: now };
      authors.set(row.id, row);
      return row;
    },
    async updateAuthor(id, patch: AuthorPatch) {
      const current = authors.get(id);
      if (!current) return null;
      const next: AuthorRecord = { ...current, ...patch, updatedAt: new Date() };
      authors.set(id, next);
      return next;
    },
    async deleteAuthor(id) {
      for (const webtoon of webtoons.values()) {
        if (webtoon.authorId === id) {
          throw new CatalogConflictError('Author is assigned to a series');
        }
      }
      return authors.delete(id);
    },

    async listGenres() {
      return [...genres.values()];
    },
    async findGenreById(id) {
      return genres.get(id) ?? null;
    },
    async findGenreBySlug(slug) {
      const key = slug.toLowerCase();
      for (const genre of genres.values()) {
        if (genre.slug === key) return genre;
      }
      return null;
    },
    async createGenre(input) {
      if (await this.findGenreBySlug(input.slug)) {
        throw new CatalogConflictError('Slug already taken');
      }
      const now = new Date();
      const row: GenreRecord = {
        ...input,
        slug: input.slug.toLowerCase(),
        createdAt: now,
        updatedAt: now,
      };
      genres.set(row.id, row);
      return row;
    },
    async updateGenre(id, patch) {
      const current = genres.get(id);
      if (!current) return null;
      const next: GenreRecord = { ...current, name: patch.name, updatedAt: new Date() };
      genres.set(id, next);
      return next;
    },
    async deleteGenre(id) {
      for (const webtoon of webtoons.values()) {
        if (webtoon.genreIds.includes(id)) {
          throw new CatalogConflictError('Genre is assigned to a series');
        }
      }
      return genres.delete(id);
    },

    async listWebtoons() {
      return [...webtoons.values()];
    },
    async findWebtoonById(id) {
      return webtoons.get(id) ?? null;
    },
    async createWebtoon(input) {
      const now = new Date();
      const row: WebtoonRecord = { ...input, createdAt: stamp(now), updatedAt: now };
      webtoons.set(row.id, row);
      return row;
    },
    async updateWebtoon(id, patch: WebtoonPatch) {
      const current = webtoons.get(id);
      if (!current) return null;
      const next: WebtoonRecord = { ...current, ...patch, updatedAt: new Date() };
      if (patch.spotlight === false) next.spotlightOrder = undefined;
      if ('coverImage' in patch && !patch.coverImage) next.coverImage = undefined;
      webtoons.set(id, next);
      return next;
    },
    async deleteWebtoon(id) {
      for (const episode of episodes.values()) {
        if (episode.webtoonId === id) {
          throw new CatalogConflictError('Webtoon has episodes');
        }
      }
      const deleted = webtoons.delete(id);
      return deleted;
    },

    async listEpisodes(webtoonId) {
      const rows = [...episodes.values()];
      return webtoonId ? rows.filter((episode) => episode.webtoonId === webtoonId) : rows;
    },
    async findEpisodeById(id) {
      return episodes.get(id) ?? null;
    },
    async createEpisode(input) {
      for (const episode of episodes.values()) {
        if (
          episode.webtoonId === input.webtoonId &&
          episode.episodeNumber === input.episodeNumber
        ) {
          throw new CatalogConflictError('Episode number already exists');
        }
      }
      const now = new Date();
      const row: EpisodeRecord = { ...input, createdAt: now, updatedAt: now };
      episodes.set(row.id, row);
      return row;
    },
    async updateEpisode(id, patch: EpisodePatch) {
      const current = episodes.get(id);
      if (!current) return null;
      const nextNumber = patch.episodeNumber ?? current.episodeNumber;
      if (nextNumber !== current.episodeNumber) {
        for (const episode of episodes.values()) {
          if (
            episode.id !== id &&
            episode.webtoonId === current.webtoonId &&
            episode.episodeNumber === nextNumber
          ) {
            throw new CatalogConflictError('Episode number already exists');
          }
        }
      }
      const next: EpisodeRecord = { ...current, ...patch, updatedAt: new Date() };
      if (patch.status && patch.status !== 'scheduled') next.scheduledAt = patch.scheduledAt;
      episodes.set(id, next);
      return next;
    },
    async deleteEpisode(id) {
      return episodes.delete(id);
    },
    async maxEpisodeNumber(webtoonId) {
      let max = 0;
      for (const episode of episodes.values()) {
        if (episode.webtoonId === webtoonId && episode.episodeNumber > max) {
          max = episode.episodeNumber;
        }
      }
      return max;
    },
  };
}
