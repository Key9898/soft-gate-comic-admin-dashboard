import type { Express, NextFunction, Response } from 'express';
import { Router } from 'express';
import { canWriteCatalog } from '../auth/rbac.js';
import { createRequireStaff, type AuthedRequest } from '../auth/requireStaff.js';
import type { StaffStore } from '../auth/staffStore.js';
import {
  CatalogConflictError,
  type CatalogStore,
  type EpisodeRecord,
  type WebtoonRecord,
} from './catalogStore.js';
import { newCatalogId } from './memoryCatalogStore.js';
import {
  hasOwn,
  readBilingual,
  readImageSizes,
  readIsoDate,
  readNonNegInt,
  readOptionalBilingual,
  readString,
  readStringArray,
} from './parse.js';
import { authorPayload, genrePayload, publicEpisode, publicWebtoon } from './serialize.js';
import {
  canDeleteAuthor,
  canDeleteGenre,
  canFlagSpotlight,
  isAuthorStatus,
  isContentRating,
  isEpisodeStatus,
  isSpotlightOrder,
  isSpotlightOrderTaken,
  isValidSlug,
  isWebtoonStatus,
  resolveGenreIds,
} from './rules.js';

type StaffMw = ReturnType<typeof createRequireStaff>;

function requireCatalogWrite(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!canWriteCatalog(req.staff?.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

function handleConflict(err: unknown, res: Response): boolean {
  if (err instanceof CatalogConflictError) {
    res.status(409).json({ error: err.message });
    return true;
  }
  return false;
}

async function episodeCountMap(catalog: CatalogStore) {
  const episodes = await catalog.listEpisodes();
  const counts = new Map<string, number>();
  for (const episode of episodes) {
    counts.set(episode.webtoonId, (counts.get(episode.webtoonId) ?? 0) + 1);
  }
  return counts;
}

function scheduleFields(
  status: EpisodeRecord['status'],
  scheduledRaw: unknown,
  isPremium: boolean,
  freeRaw: unknown,
  coinRaw: unknown,
):
  | { ok: true; scheduledAt?: Date; freeAt?: Date; coinPrice: number }
  | { ok: false; error: string } {
  const scheduled = readIsoDate(scheduledRaw);
  if (!scheduled.ok) return { ok: false, error: 'scheduledAt must be a valid ISO date' };
  if (status === 'scheduled' && !scheduled.date) {
    return { ok: false, error: 'scheduledAt is required' };
  }
  const freeAt = readIsoDate(freeRaw);
  if (!freeAt.ok) return { ok: false, error: 'freeAt must be a valid ISO date' };
  if (!isPremium) {
    return {
      ok: true,
      scheduledAt: status === 'scheduled' ? scheduled.date : undefined,
      freeAt: undefined,
      coinPrice: 0,
    };
  }
  const coinPrice = coinRaw === undefined ? 0 : readNonNegInt(coinRaw);
  if (coinPrice == null) return { ok: false, error: 'coinPrice must be a non-negative integer' };
  return {
    ok: true,
    scheduledAt: status === 'scheduled' ? scheduled.date : undefined,
    freeAt: freeAt.date,
    coinPrice,
  };
}

function createAuthorRouter(requireStaff: StaffMw, catalog: CatalogStore): Router {
  const router = Router();
  router.use(requireStaff);

  router.get('/', async (_req, res) => {
    const [authors, webtoons] = await Promise.all([catalog.listAuthors(), catalog.listWebtoons()]);
    res.json({ authors: authors.map((author) => authorPayload(author, webtoons)) });
  });

  router.post('/', requireCatalogWrite, async (req, res) => {
    const name = readBilingual(req.body?.name, true);
    if (!name) {
      res.status(400).json({ error: 'name.en is required' });
      return;
    }
    const bio = readOptionalBilingual(req.body?.bio);
    if (bio === null) {
      res.status(400).json({ error: 'bio must be { en, mm }' });
      return;
    }
    const avatar = readString(req.body?.avatar)?.trim() || undefined;
    const statusRaw = readString(req.body?.status) ?? 'active';
    if (!isAuthorStatus(statusRaw)) {
      res.status(400).json({ error: 'status is invalid' });
      return;
    }
    const author = await catalog.createAuthor({
      id: newCatalogId(),
      name,
      bio,
      avatar,
      followerCount: 0,
      status: statusRaw,
    });
    const webtoons = await catalog.listWebtoons();
    res.status(201).json({ author: authorPayload(author, webtoons) });
  });

  router.get('/:id', async (req, res) => {
    const author = await catalog.findAuthorById(String(req.params.id));
    if (!author) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const webtoons = await catalog.listWebtoons();
    res.json({ author: authorPayload(author, webtoons) });
  });

  router.patch('/:id', requireCatalogWrite, async (req, res) => {
    const existing = await catalog.findAuthorById(String(req.params.id));
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const patch: Parameters<CatalogStore['updateAuthor']>[1] = {};
    if (req.body?.name !== undefined) {
      const name = readBilingual(req.body.name, true);
      if (!name) {
        res.status(400).json({ error: 'name.en is required' });
        return;
      }
      patch.name = name;
    }
    if (req.body?.bio !== undefined) {
      const bio = readOptionalBilingual(req.body.bio);
      if (bio === null) {
        res.status(400).json({ error: 'bio must be { en, mm }' });
        return;
      }
      patch.bio = bio;
    }
    if (req.body?.avatar !== undefined) {
      patch.avatar = readString(req.body.avatar)?.trim() || undefined;
    }
    if (req.body?.status !== undefined) {
      const statusRaw = readString(req.body.status);
      if (!statusRaw || !isAuthorStatus(statusRaw)) {
        res.status(400).json({ error: 'status is invalid' });
        return;
      }
      patch.status = statusRaw;
    }
    const author = await catalog.updateAuthor(existing.id, patch);
    const webtoons = await catalog.listWebtoons();
    res.json({ author: authorPayload(author ?? existing, webtoons) });
  });

  router.delete('/:id', requireCatalogWrite, async (req, res) => {
    const existing = await catalog.findAuthorById(String(req.params.id));
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const webtoons = await catalog.listWebtoons();
    if (!canDeleteAuthor(webtoons, existing.id)) {
      res.status(409).json({ error: 'Author is assigned to a series' });
      return;
    }
    try {
      await catalog.deleteAuthor(existing.id);
    } catch (err) {
      if (handleConflict(err, res)) return;
      throw err;
    }
    res.json({ ok: true });
  });

  return router;
}

function createGenreRouter(requireStaff: StaffMw, catalog: CatalogStore): Router {
  const router = Router();
  router.use(requireStaff);

  router.get('/', async (_req, res) => {
    const [genres, webtoons] = await Promise.all([catalog.listGenres(), catalog.listWebtoons()]);
    res.json({ genres: genres.map((genre) => genrePayload(genre, webtoons)) });
  });

  router.post('/', requireCatalogWrite, async (req, res) => {
    const name = readBilingual(req.body?.name, true);
    const slug = normalizeSlugInput(readString(req.body?.slug));
    if (!name || !slug) {
      res.status(400).json({ error: 'name.en and slug are required' });
      return;
    }
    if (!isValidSlug(slug)) {
      res.status(400).json({ error: 'slug is invalid' });
      return;
    }
    if (await catalog.findGenreBySlug(slug)) {
      res.status(409).json({ error: 'Slug already taken' });
      return;
    }
    try {
      const genre = await catalog.createGenre({ id: newCatalogId(), name, slug });
      const webtoons = await catalog.listWebtoons();
      res.status(201).json({ genre: genrePayload(genre, webtoons) });
    } catch (err) {
      if (handleConflict(err, res)) return;
      throw err;
    }
  });

  router.get('/:id', async (req, res) => {
    const genre = await catalog.findGenreById(String(req.params.id));
    if (!genre) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const webtoons = await catalog.listWebtoons();
    res.json({ genre: genrePayload(genre, webtoons) });
  });

  router.patch('/:id', requireCatalogWrite, async (req, res) => {
    if (req.body && typeof req.body === 'object' && hasOwn(req.body as object, 'slug')) {
      res.status(400).json({ error: 'slug cannot be changed' });
      return;
    }
    const existing = await catalog.findGenreById(String(req.params.id));
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const name = req.body?.name !== undefined ? readBilingual(req.body.name, true) : existing.name;
    if (!name) {
      res.status(400).json({ error: 'name.en is required' });
      return;
    }
    const genre = await catalog.updateGenre(existing.id, { name });
    const webtoons = await catalog.listWebtoons();
    res.json({ genre: genrePayload(genre ?? existing, webtoons) });
  });

  router.delete('/:id', requireCatalogWrite, async (req, res) => {
    const existing = await catalog.findGenreById(String(req.params.id));
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const webtoons = await catalog.listWebtoons();
    if (!canDeleteGenre(webtoons, existing)) {
      res.status(409).json({ error: 'Genre cannot be deleted' });
      return;
    }
    try {
      await catalog.deleteGenre(existing.id);
    } catch (err) {
      if (handleConflict(err, res)) return;
      throw err;
    }
    res.json({ ok: true });
  });

  return router;
}

function normalizeSlugInput(slug: string | null): string | null {
  if (!slug) return null;
  const next = slug.trim().toLowerCase();
  return next || null;
}

async function writeWebtoonPayload(catalog: CatalogStore, webtoon: WebtoonRecord) {
  const [authors, genres, webtoons, counts] = await Promise.all([
    catalog.listAuthors(),
    catalog.listGenres(),
    catalog.listWebtoons(),
    episodeCountMap(catalog),
  ]);
  const author = authors.find((item) => item.id === webtoon.authorId);
  if (!author) return null;
  return publicWebtoon(webtoon, author, genres, counts.get(webtoon.id) ?? 0, webtoons);
}

function createWebtoonRouter(requireStaff: StaffMw, catalog: CatalogStore): Router {
  const router = Router();
  router.use(requireStaff);

  router.get('/', async (_req, res) => {
    const [authors, genres, webtoons, counts] = await Promise.all([
      catalog.listAuthors(),
      catalog.listGenres(),
      catalog.listWebtoons(),
      episodeCountMap(catalog),
    ]);
    const authorsById = new Map(authors.map((author) => [author.id, author]));
    res.json({
      webtoons: webtoons.flatMap((webtoon) => {
        const author = authorsById.get(webtoon.authorId);
        if (!author) return [];
        return [publicWebtoon(webtoon, author, genres, counts.get(webtoon.id) ?? 0, webtoons)];
      }),
    });
  });

  router.post('/', requireCatalogWrite, async (req, res) => {
    const title = readBilingual(req.body?.title, true);
    const description = readBilingual(req.body?.description, false) ?? { en: '', mm: '' };
    const authorId = readString(req.body?.authorId);
    const contentRating = readString(req.body?.contentRating);
    const statusRaw = readString(req.body?.status) ?? 'draft';
    if (!title || !authorId) {
      res.status(400).json({ error: 'title.en and authorId are required' });
      return;
    }
    if (!isWebtoonStatus(statusRaw)) {
      res.status(400).json({ error: 'status is invalid' });
      return;
    }
    if (!contentRating || !isContentRating(contentRating)) {
      res.status(400).json({ error: 'contentRating is required' });
      return;
    }
    const weeklyViewCount =
      req.body?.weeklyViewCount === undefined ? 0 : readNonNegInt(req.body.weeklyViewCount);
    if (weeklyViewCount == null) {
      res.status(400).json({ error: 'weeklyViewCount must be a non-negative integer' });
      return;
    }
    const tags = readStringArray(req.body?.tags);
    const genreTokens = readStringArray(req.body?.genres);
    if (!tags || !genreTokens) {
      res.status(400).json({ error: 'tags and genres must be string arrays' });
      return;
    }
    const author = await catalog.findAuthorById(authorId);
    if (!author) {
      res.status(400).json({ error: 'author not found' });
      return;
    }
    if (author.status !== 'active') {
      res.status(400).json({ error: 'author must be active' });
      return;
    }
    const genres = await catalog.listGenres();
    const resolved = resolveGenreIds(genreTokens, genres);
    if (!resolved.ok) {
      res.status(400).json({ error: resolved.error });
      return;
    }
    const webtoons = await catalog.listWebtoons();
    const spotlight = Boolean(req.body?.spotlight);
    let spotlightOrder: number | undefined;
    if (spotlight) {
      const order = req.body?.spotlightOrder;
      if (typeof order !== 'number' || !isSpotlightOrder(order)) {
        res.status(400).json({ error: 'spotlightOrder must be 1-5' });
        return;
      }
      if (!canFlagSpotlight(webtoons, undefined, statusRaw)) {
        res.status(409).json({ error: 'Spotlight is limited to 5 non-draft titles' });
        return;
      }
      if (isSpotlightOrderTaken(webtoons, order)) {
        res.status(409).json({ error: `Spotlight order ${order} is already in use` });
        return;
      }
      spotlightOrder = order;
    }
    const webtoon = await catalog.createWebtoon({
      id: newCatalogId(),
      title,
      description,
      coverImage: readString(req.body?.coverImage)?.trim() || undefined,
      coverColor: readString(req.body?.coverColor) ?? '',
      authorId,
      genreIds: resolved.ids,
      tags,
      status: statusRaw,
      isPremium: Boolean(req.body?.isPremium),
      viewCount: 0,
      likeCount: 0,
      rating: 0,
      contentRating,
      spotlight,
      spotlightOrder,
      weeklyViewCount,
    });
    const payload = await writeWebtoonPayload(catalog, webtoon);
    res.status(201).json({ webtoon: payload });
  });

  router.get('/:id', async (req, res) => {
    const webtoon = await catalog.findWebtoonById(String(req.params.id));
    if (!webtoon) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const payload = await writeWebtoonPayload(catalog, webtoon);
    if (!payload) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ webtoon: payload });
  });

  router.patch('/:id', requireCatalogWrite, async (req, res) => {
    const existing = await catalog.findWebtoonById(String(req.params.id));
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const title =
      req.body?.title !== undefined ? readBilingual(req.body.title, true) : existing.title;
    const description =
      req.body?.description !== undefined
        ? readBilingual(req.body.description, false)
        : existing.description;
    if (!title || !description) {
      res.status(400).json({ error: 'title.en is required' });
      return;
    }
    const statusRaw =
      req.body?.status !== undefined ? readString(req.body.status) : existing.status;
    if (!statusRaw || !isWebtoonStatus(statusRaw)) {
      res.status(400).json({ error: 'status is invalid' });
      return;
    }
    const contentRating =
      req.body?.contentRating !== undefined
        ? readString(req.body.contentRating)
        : existing.contentRating;
    if (!contentRating || !isContentRating(contentRating)) {
      res.status(400).json({ error: 'contentRating is invalid' });
      return;
    }
    const weeklyViewCount =
      req.body?.weeklyViewCount !== undefined
        ? readNonNegInt(req.body.weeklyViewCount)
        : existing.weeklyViewCount;
    if (weeklyViewCount == null) {
      res.status(400).json({ error: 'weeklyViewCount must be a non-negative integer' });
      return;
    }
    const tags = req.body?.tags !== undefined ? readStringArray(req.body.tags) : existing.tags;
    const genreTokens = req.body?.genres !== undefined ? readStringArray(req.body.genres) : null;
    if (!tags || (req.body?.genres !== undefined && !genreTokens)) {
      res.status(400).json({ error: 'tags and genres must be string arrays' });
      return;
    }
    let genreIds = existing.genreIds;
    if (genreTokens) {
      const genres = await catalog.listGenres();
      const resolved = resolveGenreIds(genreTokens, genres);
      if (!resolved.ok) {
        res.status(400).json({ error: resolved.error });
        return;
      }
      genreIds = resolved.ids;
    }
    const nextAuthorId = readString(req.body?.authorId) ?? existing.authorId;
    const author = await catalog.findAuthorById(nextAuthorId);
    if (!author) {
      res.status(400).json({ error: 'author not found' });
      return;
    }
    if (nextAuthorId !== existing.authorId && author.status !== 'active') {
      res.status(400).json({ error: 'author must be active' });
      return;
    }
    const webtoons = await catalog.listWebtoons();
    const spotlight =
      req.body?.spotlight !== undefined ? Boolean(req.body.spotlight) : existing.spotlight;
    let spotlightOrder = existing.spotlightOrder;
    if (!spotlight) {
      spotlightOrder = undefined;
    } else {
      const order =
        req.body?.spotlightOrder !== undefined ? req.body.spotlightOrder : existing.spotlightOrder;
      if (typeof order !== 'number' || !isSpotlightOrder(order)) {
        res.status(400).json({ error: 'spotlightOrder must be 1-5' });
        return;
      }
      if (!canFlagSpotlight(webtoons, existing.id, statusRaw)) {
        res.status(409).json({ error: 'Spotlight is limited to 5 non-draft titles' });
        return;
      }
      if (isSpotlightOrderTaken(webtoons, order, existing.id)) {
        res.status(409).json({ error: `Spotlight order ${order} is already in use` });
        return;
      }
      spotlightOrder = order;
    }
    const webtoon = await catalog.updateWebtoon(existing.id, {
      title,
      description,
      coverImage:
        req.body?.coverImage !== undefined
          ? readString(req.body.coverImage)?.trim() || undefined
          : existing.coverImage,
      coverColor:
        req.body?.coverColor !== undefined
          ? (readString(req.body.coverColor) ?? '')
          : existing.coverColor,
      authorId: nextAuthorId,
      genreIds,
      tags,
      status: statusRaw,
      isPremium:
        req.body?.isPremium !== undefined ? Boolean(req.body.isPremium) : existing.isPremium,
      contentRating,
      spotlight,
      spotlightOrder,
      weeklyViewCount,
    });
    const payload = await writeWebtoonPayload(catalog, webtoon ?? existing);
    res.json({ webtoon: payload });
  });

  router.delete('/:id', requireCatalogWrite, async (req, res) => {
    const existing = await catalog.findWebtoonById(String(req.params.id));
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const episodes = await catalog.listEpisodes(existing.id);
    if (episodes.length > 0) {
      res.status(409).json({ error: 'Webtoon has episodes' });
      return;
    }
    try {
      await catalog.deleteWebtoon(existing.id);
    } catch (err) {
      if (handleConflict(err, res)) return;
      throw err;
    }
    res.json({ ok: true });
  });

  return router;
}

async function writeEpisodePayload(catalog: CatalogStore, episode: EpisodeRecord) {
  const webtoon = await catalog.findWebtoonById(episode.webtoonId);
  return publicEpisode(episode, webtoon?.title ?? { en: '', mm: '' });
}

function createEpisodeRouter(requireStaff: StaffMw, catalog: CatalogStore): Router {
  const router = Router();
  router.use(requireStaff);

  router.get('/', async (req, res) => {
    const webtoonId = typeof req.query.webtoonId === 'string' ? req.query.webtoonId : undefined;
    const episodes = await catalog.listEpisodes(webtoonId);
    const webtoons = await catalog.listWebtoons();
    const titles = new Map(webtoons.map((webtoon) => [webtoon.id, webtoon.title]));
    res.json({
      episodes: episodes.map((episode) =>
        publicEpisode(episode, titles.get(episode.webtoonId) ?? { en: '', mm: '' }),
      ),
    });
  });

  router.post('/', requireCatalogWrite, async (req, res) => {
    const title = readBilingual(req.body?.title, true);
    const webtoonId = readString(req.body?.webtoonId);
    const statusRaw = readString(req.body?.status) ?? 'draft';
    if (!title || !webtoonId) {
      res.status(400).json({ error: 'title.en and webtoonId are required' });
      return;
    }
    if (!isEpisodeStatus(statusRaw)) {
      res.status(400).json({ error: 'status is invalid' });
      return;
    }
    const webtoon = await catalog.findWebtoonById(webtoonId);
    if (!webtoon) {
      res.status(400).json({ error: 'webtoon not found' });
      return;
    }
    const description = readOptionalBilingual(req.body?.description);
    if (description === null) {
      res.status(400).json({ error: 'description must be { en, mm }' });
      return;
    }
    const images = readStringArray(req.body?.images);
    if (!images) {
      res.status(400).json({ error: 'images must be a string array' });
      return;
    }
    const imageSizes = readImageSizes(req.body?.imageSizes, images.length);
    if (imageSizes === null) {
      res.status(400).json({ error: 'imageSizes must match images' });
      return;
    }
    const isPremium = Boolean(req.body?.isPremium);
    const schedule = scheduleFields(
      statusRaw,
      req.body?.scheduledAt,
      isPremium,
      req.body?.freeAt,
      req.body?.coinPrice,
    );
    if (!schedule.ok) {
      res.status(400).json({ error: schedule.error });
      return;
    }
    let episodeNumber =
      req.body?.episodeNumber === undefined ? undefined : readNonNegInt(req.body.episodeNumber);
    if (req.body?.episodeNumber !== undefined && (episodeNumber == null || episodeNumber < 1)) {
      res.status(400).json({ error: 'episodeNumber must be a positive integer' });
      return;
    }
    if (episodeNumber == null) {
      episodeNumber = (await catalog.maxEpisodeNumber(webtoonId)) + 1;
    }
    try {
      const episode = await catalog.createEpisode({
        id: newCatalogId(),
        webtoonId,
        title,
        description,
        images,
        imageSizes,
        isPremium,
        coinPrice: schedule.coinPrice,
        viewCount: 0,
        likeCount: 0,
        episodeNumber,
        status: statusRaw,
        freeAt: schedule.freeAt,
        scheduledAt: schedule.scheduledAt,
      });
      res.status(201).json({ episode: await writeEpisodePayload(catalog, episode) });
    } catch (err) {
      if (handleConflict(err, res)) return;
      throw err;
    }
  });

  router.get('/:id', async (req, res) => {
    const episode = await catalog.findEpisodeById(String(req.params.id));
    if (!episode) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ episode: await writeEpisodePayload(catalog, episode) });
  });

  router.patch('/:id', requireCatalogWrite, async (req, res) => {
    if (req.body && typeof req.body === 'object' && hasOwn(req.body as object, 'webtoonId')) {
      res.status(400).json({ error: 'webtoonId cannot be changed' });
      return;
    }
    const existing = await catalog.findEpisodeById(String(req.params.id));
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const title =
      req.body?.title !== undefined ? readBilingual(req.body.title, true) : existing.title;
    if (!title) {
      res.status(400).json({ error: 'title.en is required' });
      return;
    }
    const statusRaw =
      req.body?.status !== undefined ? readString(req.body.status) : existing.status;
    if (!statusRaw || !isEpisodeStatus(statusRaw)) {
      res.status(400).json({ error: 'status is invalid' });
      return;
    }
    const description =
      req.body?.description !== undefined
        ? readOptionalBilingual(req.body.description)
        : existing.description;
    if (description === null) {
      res.status(400).json({ error: 'description must be { en, mm }' });
      return;
    }
    const images =
      req.body?.images !== undefined ? readStringArray(req.body.images) : existing.images;
    if (!images) {
      res.status(400).json({ error: 'images must be a string array' });
      return;
    }
    const imageSizesRaw =
      req.body?.imageSizes !== undefined ? req.body.imageSizes : existing.imageSizes;
    const imageSizes = readImageSizes(imageSizesRaw, images.length);
    if (imageSizes === null && req.body?.imageSizes !== undefined) {
      res.status(400).json({ error: 'imageSizes must match images' });
      return;
    }
    const nextImageSizes = imageSizes ?? undefined;
    const isPremium =
      req.body?.isPremium !== undefined ? Boolean(req.body.isPremium) : existing.isPremium;
    const schedule = scheduleFields(
      statusRaw,
      req.body?.scheduledAt !== undefined
        ? req.body.scheduledAt
        : existing.scheduledAt?.toISOString(),
      isPremium,
      req.body?.freeAt !== undefined ? req.body.freeAt : existing.freeAt?.toISOString(),
      req.body?.coinPrice !== undefined ? req.body.coinPrice : existing.coinPrice,
    );
    if (!schedule.ok) {
      res.status(400).json({ error: schedule.error });
      return;
    }
    let episodeNumber = existing.episodeNumber;
    if (req.body?.episodeNumber !== undefined) {
      const next = readNonNegInt(req.body.episodeNumber);
      if (next == null || next < 1) {
        res.status(400).json({ error: 'episodeNumber must be a positive integer' });
        return;
      }
      episodeNumber = next;
    }
    try {
      const episode = await catalog.updateEpisode(existing.id, {
        title,
        description,
        images,
        imageSizes: nextImageSizes,
        isPremium,
        coinPrice: schedule.coinPrice,
        episodeNumber,
        status: statusRaw,
        freeAt: schedule.freeAt,
        scheduledAt: schedule.scheduledAt,
      });
      res.json({ episode: await writeEpisodePayload(catalog, episode ?? existing) });
    } catch (err) {
      if (handleConflict(err, res)) return;
      throw err;
    }
  });

  router.delete('/:id', requireCatalogWrite, async (req, res) => {
    const existing = await catalog.findEpisodeById(String(req.params.id));
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    await catalog.deleteEpisode(existing.id);
    res.json({ ok: true });
  });

  return router;
}

export function mountCatalogRoutes(app: Express, store: StaffStore, catalog: CatalogStore) {
  const requireStaff = createRequireStaff(store);
  app.use('/api/authors', createAuthorRouter(requireStaff, catalog));
  app.use('/api/genres', createGenreRouter(requireStaff, catalog));
  app.use('/api/webtoons', createWebtoonRouter(requireStaff, catalog));
  app.use('/api/episodes', createEpisodeRouter(requireStaff, catalog));
}
