import { describe, expect, it } from 'vitest';
import type { GenreRecord, WebtoonRecord } from './catalogStore.js';
import {
  canDeleteAuthor,
  canDeleteGenre,
  canFlagSpotlight,
  flaggedSpotlightCount,
  isSpotlightOrderTaken,
  isValidSlug,
  resolveGenreIds,
  SPOTLIGHT_CAP,
  takenSpotlightOrders,
} from './rules.js';

const genre = (
  overrides: Partial<GenreRecord> & Pick<GenreRecord, 'id' | 'slug'>,
): GenreRecord => ({
  name: { en: overrides.slug, mm: '' },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const webtoon = (overrides: Partial<WebtoonRecord> & Pick<WebtoonRecord, 'id'>): WebtoonRecord => ({
  title: { en: overrides.id, mm: '' },
  description: { en: '', mm: '' },
  coverColor: '',
  authorId: 'a1',
  genreIds: [],
  tags: [],
  status: 'ongoing',
  isPremium: false,
  viewCount: 0,
  likeCount: 0,
  rating: 0,
  contentRating: 'all',
  spotlight: false,
  weeklyViewCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('catalog rules', () => {
  it('rejects the all slug and invalid kebab slugs', () => {
    expect(isValidSlug('all')).toBe(false);
    expect(isValidSlug('Action')).toBe(false);
    expect(isValidSlug('action')).toBe(true);
    expect(isValidSlug('sci-fi')).toBe(true);
  });

  it('blocks deleting an assigned genre including drafts and the all sentinel', () => {
    const action = genre({ id: 'g1', slug: 'action' });
    const all = genre({ id: 'g0', slug: 'all' });
    const draft = webtoon({ id: 'w1', status: 'draft', genreIds: ['g1'] });
    expect(canDeleteGenre([draft], action)).toBe(false);
    expect(canDeleteGenre([], action)).toBe(true);
    expect(canDeleteGenre([], all)).toBe(false);
  });

  it('blocks deleting an author with any series including drafts', () => {
    expect(canDeleteAuthor([webtoon({ id: 'w1', status: 'draft', authorId: 'a1' })], 'a1')).toBe(
      false,
    );
    expect(canDeleteAuthor([webtoon({ id: 'w1', authorId: 'a2' })], 'a1')).toBe(true);
  });

  it('counts only non-draft flagged titles toward the spotlight cap', () => {
    const five = [1, 2, 3, 4, 5].map((order) =>
      webtoon({ id: `s${order}`, spotlight: true, spotlightOrder: order }),
    );
    const withDraft = [
      ...five,
      webtoon({ id: 'draft', status: 'draft', spotlight: true, spotlightOrder: 1 }),
    ];
    expect(flaggedSpotlightCount(withDraft)).toBe(SPOTLIGHT_CAP);
    expect(canFlagSpotlight(withDraft, 'new')).toBe(false);
    expect(canFlagSpotlight(withDraft, 'new', 'draft')).toBe(true);
    expect(takenSpotlightOrders(five).has(3)).toBe(true);
    expect(isSpotlightOrderTaken(five, 3, 's3')).toBe(false);
    expect(isSpotlightOrderTaken(withDraft, 1, 'extra')).toBe(true);
  });

  it('rejects unknown genre tokens and the all slug', () => {
    const genres = [genre({ id: 'g1', slug: 'action', name: { en: 'Action', mm: 'အက်ရှင်' } })];
    expect(resolveGenreIds(['unknown'], genres).ok).toBe(false);
    expect(resolveGenreIds(['all'], genres).ok).toBe(false);
    expect(resolveGenreIds(['Action'], genres)).toEqual({ ok: true, ids: ['g1'] });
  });
});
