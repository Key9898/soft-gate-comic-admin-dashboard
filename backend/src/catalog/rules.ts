import type { GenreRecord, WebtoonRecord, WebtoonStatus } from './catalogStore.js';

export const ALL_GENRE_SLUG = 'all';
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SPOTLIGHT_CAP = 5;
export const SPOTLIGHT_ORDERS = [1, 2, 3, 4, 5] as const;
export const CONTENT_RATINGS = ['all', '13', '16', '18'] as const;
export const WEBTOON_STATUSES = ['ongoing', 'completed', 'hiatus', 'draft'] as const;
export const EPISODE_STATUSES = ['published', 'draft', 'scheduled'] as const;
export const AUTHOR_STATUSES = ['active', 'inactive'] as const;

export const normalizeGenreToken = (value: string): string => value.trim().toLowerCase();

export const isAllGenre = (genre: Pick<GenreRecord, 'slug'>): boolean =>
  normalizeGenreToken(genre.slug) === ALL_GENRE_SLUG;

export const isValidSlug = (slug: string): boolean =>
  SLUG_PATTERN.test(slug) && slug !== ALL_GENRE_SLUG;

export const isContentRating = (value: string): boolean =>
  (CONTENT_RATINGS as readonly string[]).includes(value);

export const isWebtoonStatus = (value: string): value is WebtoonStatus =>
  (WEBTOON_STATUSES as readonly string[]).includes(value);

export const isEpisodeStatus = (value: string): value is (typeof EPISODE_STATUSES)[number] =>
  (EPISODE_STATUSES as readonly string[]).includes(value);

export const isAuthorStatus = (value: string): value is (typeof AUTHOR_STATUSES)[number] =>
  (AUTHOR_STATUSES as readonly string[]).includes(value);

export const isSpotlightOrder = (value: number): value is (typeof SPOTLIGHT_ORDERS)[number] =>
  (SPOTLIGHT_ORDERS as readonly number[]).includes(value);

export const isSpotlightFlagged = (webtoon: Pick<WebtoonRecord, 'spotlight' | 'status'>): boolean =>
  Boolean(webtoon.spotlight) && webtoon.status !== 'draft';

export const flaggedSpotlightCount = (webtoons: WebtoonRecord[], excludeId?: string): number =>
  webtoons.filter((webtoon) => webtoon.id !== excludeId && isSpotlightFlagged(webtoon)).length;

export const canFlagSpotlight = (
  webtoons: WebtoonRecord[],
  excludeId?: string,
  nextStatus?: WebtoonStatus,
): boolean => {
  if (nextStatus === 'draft') return true;
  const existing = webtoons.find((webtoon) => webtoon.id === excludeId);
  if (existing && isSpotlightFlagged(existing)) return true;
  return flaggedSpotlightCount(webtoons, excludeId) < SPOTLIGHT_CAP;
};

export const takenSpotlightOrders = (
  webtoons: WebtoonRecord[],
  excludeId?: string,
): Set<number> => {
  const taken = new Set<number>();
  for (const webtoon of webtoons) {
    if (webtoon.id === excludeId) continue;
    if (webtoon.spotlight && webtoon.spotlightOrder != null) {
      taken.add(webtoon.spotlightOrder);
    }
  }
  return taken;
};

export const isSpotlightOrderTaken = (
  webtoons: WebtoonRecord[],
  order: number,
  excludeId?: string,
): boolean => takenSpotlightOrders(webtoons, excludeId).has(order);

export const assignedSeriesCountForAuthor = (webtoons: WebtoonRecord[], authorId: string): number =>
  webtoons.filter((webtoon) => webtoon.authorId === authorId).length;

export const derivedWebtoonCountForAuthor = (webtoons: WebtoonRecord[], authorId: string): number =>
  webtoons.filter((webtoon) => webtoon.authorId === authorId && webtoon.status !== 'draft').length;

export const canDeleteAuthor = (webtoons: WebtoonRecord[], authorId: string): boolean =>
  assignedSeriesCountForAuthor(webtoons, authorId) === 0;

export const assignedSeriesCountForGenre = (
  webtoons: WebtoonRecord[],
  genre: GenreRecord,
): number => {
  if (isAllGenre(genre)) return webtoons.length;
  return webtoons.filter((webtoon) => webtoon.genreIds.includes(genre.id)).length;
};

export const derivedWebtoonCountForGenre = (
  webtoons: WebtoonRecord[],
  genre: GenreRecord,
): number => {
  if (isAllGenre(genre)) return webtoons.filter((webtoon) => webtoon.status !== 'draft').length;
  return webtoons.filter(
    (webtoon) => webtoon.status !== 'draft' && webtoon.genreIds.includes(genre.id),
  ).length;
};

export const canDeleteGenre = (webtoons: WebtoonRecord[], genre: GenreRecord): boolean =>
  !isAllGenre(genre) && assignedSeriesCountForGenre(webtoons, genre) === 0;

export const resolveGenreIds = (
  tokens: string[],
  genres: GenreRecord[],
): { ok: true; ids: string[] } | { ok: false; error: string } => {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const token of tokens) {
    const key = normalizeGenreToken(token);
    if (!key) continue;
    const found = genres.find(
      (genre) =>
        normalizeGenreToken(genre.slug) === key ||
        normalizeGenreToken(genre.name.mm) === key ||
        normalizeGenreToken(genre.name.en) === key,
    );
    if (!found) return { ok: false, error: `Unknown genre: ${token}` };
    if (isAllGenre(found)) return { ok: false, error: 'Genre all cannot be assigned' };
    if (seen.has(found.id)) continue;
    seen.add(found.id);
    ids.push(found.id);
  }
  return { ok: true, ids };
};
