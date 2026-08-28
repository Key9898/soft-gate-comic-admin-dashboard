import type { Genre, Webtoon } from '@softgate/shared';

export const ALL_GENRE_SLUG = 'all';
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const numericId = (id: string): number | null => {
  if (!/^\d+$/.test(id)) return null;
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
};

export const normalizeGenreToken = (value: string): string => value.trim().toLowerCase();

export const isAllGenre = (genre: Pick<Genre, 'slug'>): boolean =>
  normalizeGenreToken(genre.slug) === ALL_GENRE_SLUG;

export const isValidSlug = (slug: string): boolean =>
  SLUG_PATTERN.test(slug) && slug !== ALL_GENRE_SLUG;

export const nextGenreId = (genres: Genre[]): string => {
  let max = 0;
  for (const genre of genres) {
    const n = numericId(genre.id);
    if (n != null && n > max) max = n;
  }
  return String(max + 1);
};

export const isSlugTaken = (genres: Genre[], slug: string, excludeId?: string): boolean => {
  const key = normalizeGenreToken(slug);
  return genres.some((genre) => genre.id !== excludeId && normalizeGenreToken(genre.slug) === key);
};

export const genreAliases = (genre: Pick<Genre, 'name' | 'slug'>): Set<string> =>
  new Set([genre.name.mm, genre.name.en, genre.slug].map(normalizeGenreToken).filter(Boolean));

export const webtoonMatchesGenre = (webtoon: Webtoon, genre: Genre): boolean => {
  if (isAllGenre(genre)) return true;
  const aliases = genreAliases(genre);
  return webtoon.genres.some((token) => aliases.has(normalizeGenreToken(token)));
};

export const resolveGenreSlug = (catalog: Genre[], token: string): string | undefined => {
  const key = normalizeGenreToken(token);
  if (!key) return undefined;
  const found = catalog.find(
    (genre) =>
      normalizeGenreToken(genre.slug) === key ||
      normalizeGenreToken(genre.name.mm) === key ||
      normalizeGenreToken(genre.name.en) === key,
  );
  return found?.slug;
};

export const resolveGenreLabelEn = (token: string, catalog: Genre[]): string => {
  const slug = resolveGenreSlug(catalog, token);
  if (!slug) return token;
  const found = catalog.find((genre) => genre.slug === slug);
  return found?.name.en || token;
};

export const canonicalizeWebtoonGenres = (tokens: string[], catalog: Genre[]): string[] => {
  const next: string[] = [];
  const seen = new Set<string>();
  for (const token of tokens) {
    const slug = resolveGenreSlug(catalog, token);
    if (slug === ALL_GENRE_SLUG) continue;
    const value = slug ?? token;
    const key = normalizeGenreToken(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    next.push(slug ?? token);
  }
  return next;
};

export const assignedSeriesCount = (webtoons: Webtoon[], genre: Genre): number =>
  webtoons.filter((webtoon) => webtoonMatchesGenre(webtoon, genre)).length;

export const derivedWebtoonCount = (webtoons: Webtoon[], genre: Genre): number =>
  webtoons.filter((webtoon) => webtoon.status !== 'draft' && webtoonMatchesGenre(webtoon, genre))
    .length;

export const canDeleteGenre = (webtoons: Webtoon[], genre: Genre): boolean =>
  !isAllGenre(genre) && assignedSeriesCount(webtoons, genre) === 0;

export const genresForPicker = (genres: Genre[]): Genre[] =>
  genres.filter((genre) => !isAllGenre(genre));

export const cascadeGenreTokens = (
  webtoons: Webtoon[],
  previous: Genre,
  updated: Genre,
): Webtoon[] => {
  if (isAllGenre(updated) || isAllGenre(previous)) return webtoons;
  const oldAliases = genreAliases(previous);
  const nextSlug = updated.slug;
  return webtoons.map((webtoon) => ({
    ...webtoon,
    genres: webtoon.genres.map((token) =>
      oldAliases.has(normalizeGenreToken(token)) ? nextSlug : token,
    ),
  }));
};

export const syncGenreWebtoonCounts = (genres: Genre[], webtoons: Webtoon[]): Genre[] =>
  genres.map((genre) => ({
    ...genre,
    webtoonCount: derivedWebtoonCount(webtoons, genre),
  }));

export const withDerivedCount = (genre: Genre, webtoons: Webtoon[]): Genre => ({
  ...genre,
  webtoonCount: derivedWebtoonCount(webtoons, genre),
});
