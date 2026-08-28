import { describe, expect, it } from 'vitest';
import type { Author, Genre, Webtoon } from '@softgate/shared';
import { mockGenres } from '@softgate/shared';
import {
  ALL_GENRE_SLUG,
  assignedSeriesCount,
  canDeleteGenre,
  canonicalizeWebtoonGenres,
  cascadeGenreTokens,
  derivedWebtoonCount,
  genresForPicker,
  isSlugTaken,
  isValidSlug,
  nextGenreId,
  resolveGenreLabelEn,
  resolveGenreSlug,
  syncGenreWebtoonCounts,
} from './genres';

const author: Author = {
  id: 'a1',
  name: { en: 'Writer', mm: '' },
  followerCount: 0,
  webtoonCount: 0,
  status: 'active',
};

const genre = (overrides: Partial<Genre> & Pick<Genre, 'id' | 'slug'>): Genre => ({
  name: { en: overrides.slug, mm: '' },
  webtoonCount: 0,
  ...overrides,
});

const webtoon = (overrides: Partial<Webtoon> & Pick<Webtoon, 'id'>): Webtoon => ({
  title: { en: overrides.id, mm: '' },
  description: { en: '', mm: '' },
  coverColor: '',
  author,
  genres: [],
  tags: [],
  status: 'ongoing',
  isPremium: false,
  viewCount: 0,
  likeCount: 0,
  episodeCount: 0,
  rating: 0,
  contentRating: 'all',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('nextGenreId', () => {
  it('returns the next numeric id and ignores non-numeric leftovers', () => {
    expect(nextGenreId(mockGenres)).toBe('11');
    expect(nextGenreId([genre({ id: '2', slug: 'a' }), genre({ id: 's1', slug: 'b' })])).toBe('3');
  });
});

describe('slug rules', () => {
  it('accepts kebab slugs and rejects all / invalid', () => {
    expect(isValidSlug('action')).toBe(true);
    expect(isValidSlug('slice-of-life')).toBe(true);
    expect(isValidSlug(ALL_GENRE_SLUG)).toBe(false);
    expect(isValidSlug('Action')).toBe(false);
    expect(isValidSlug('sci_fi')).toBe(false);
    expect(isSlugTaken(mockGenres, 'action')).toBe(true);
    expect(isSlugTaken(mockGenres, 'brand-new')).toBe(false);
  });
});

describe('assigned and derived counts', () => {
  const action = genre({
    id: '2',
    slug: 'action',
    name: { en: 'Action', mm: 'အက်ရှင်' },
  });
  const all = genre({ id: '1', slug: 'all', name: { en: 'All', mm: 'အားလုံး' } });
  const list = [
    webtoon({ id: 'w1', genres: ['အက်ရှင်'], status: 'ongoing' }),
    webtoon({ id: 'w2', genres: ['action'], status: 'draft' }),
    webtoon({ id: 'w3', genres: ['romance'], status: 'completed' }),
  ];

  it('matches MM and slug aliases; drafts count toward assigned only', () => {
    expect(assignedSeriesCount(list, action)).toBe(2);
    expect(derivedWebtoonCount(list, action)).toBe(1);
    expect(canDeleteGenre(list, action)).toBe(false);
    expect(canDeleteGenre([], action)).toBe(true);
    expect(canDeleteGenre([], all)).toBe(false);
    expect(derivedWebtoonCount(list, all)).toBe(2);
  });
});

describe('canonicalize and resolve', () => {
  const catalog = [
    genre({ id: '1', slug: 'all', name: { en: 'All', mm: 'အားလုံး' } }),
    genre({ id: '2', slug: 'action', name: { en: 'Action', mm: 'အက်ရှင်' } }),
  ];

  it('maps known tokens to slugs, drops all, keeps unknown', () => {
    expect(resolveGenreSlug(catalog, 'အက်ရှင်')).toBe('action');
    expect(resolveGenreLabelEn('အက်ရှင်', catalog)).toBe('Action');
    expect(canonicalizeWebtoonGenres(['အက်ရှင်', 'Action', 'all', 'mystery-x'], catalog)).toEqual([
      'action',
      'mystery-x',
    ]);
  });
});

describe('cascadeGenreTokens', () => {
  it('rewrites previous aliases to the unchanged slug', () => {
    const previous = genre({
      id: '2',
      slug: 'action',
      name: { en: 'Action', mm: 'အက်ရှင်' },
    });
    const updated = { ...previous, name: { en: 'Act', mm: 'အက်' } };
    const list = [
      webtoon({ id: 'w1', genres: ['အက်ရှင်', 'romance'] }),
      webtoon({ id: 'w2', genres: ['comedy'] }),
    ];
    expect(cascadeGenreTokens(list, previous, updated)[0].genres).toEqual(['action', 'romance']);
  });

  it('does not cascade the all sentinel', () => {
    const all = genre({ id: '1', slug: 'all', name: { en: 'All', mm: 'အားလုံး' } });
    const updated = { ...all, name: { en: 'Everything', mm: 'အားလုံး' } };
    const list = [webtoon({ id: 'w1', genres: ['action'] })];
    expect(cascadeGenreTokens(list, all, updated)[0].genres).toEqual(['action']);
  });
});

describe('genresForPicker and sync', () => {
  it('excludes all and rewrites derived counts', () => {
    const action = genre({ id: '2', slug: 'action', webtoonCount: 99 });
    const all = genre({ id: '1', slug: 'all', webtoonCount: 99 });
    const list = [webtoon({ id: 'w1', genres: ['action'], status: 'ongoing' })];
    expect(genresForPicker([all, action]).map((item) => item.slug)).toEqual(['action']);
    expect(syncGenreWebtoonCounts([all, action], list).map((item) => item.webtoonCount)).toEqual([
      1, 1,
    ]);
  });
});
