import { describe, expect, it } from 'vitest';
import type { Webtoon } from '@softgate/shared';
import { mockAuthors } from '@softgate/shared';
import {
  SPOTLIGHT_CAP,
  canFlagSpotlight,
  flaggedSpotlightCount,
  isSpotlightOrderTaken,
  takenSpotlightOrders,
} from './spotlight';

const base = (overrides: Partial<Webtoon> & Pick<Webtoon, 'id'>): Webtoon => ({
  title: { en: overrides.id, mm: '' },
  description: { en: '', mm: '' },
  coverColor: '',
  author: mockAuthors[0],
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

describe('spotlight', () => {
  const five = [1, 2, 3, 4, 5].map((order) =>
    base({ id: `s${order}`, spotlight: true, spotlightOrder: order }),
  );

  it('counts only non-draft flagged titles toward the cap', () => {
    const webtoons = [
      ...five,
      base({ id: 'draft', status: 'draft', spotlight: true, spotlightOrder: 1 }),
    ];
    expect(flaggedSpotlightCount(webtoons)).toBe(SPOTLIGHT_CAP);
    expect(canFlagSpotlight(webtoons, 'new')).toBe(false);
    expect(canFlagSpotlight(webtoons, 'new', 'draft')).toBe(true);
  });

  it('lets an already flagged title stay on when the cap is full', () => {
    expect(canFlagSpotlight(five, 's1')).toBe(true);
    expect(canFlagSpotlight(five, 's1', 'ongoing')).toBe(true);
  });

  it('blocks a sixth non-draft flag', () => {
    expect(canFlagSpotlight(five, 'extra', 'ongoing')).toBe(false);
  });

  it('treats spotlightOrder as unique except for the title being edited', () => {
    expect(takenSpotlightOrders(five).has(3)).toBe(true);
    expect(isSpotlightOrderTaken(five, 3)).toBe(true);
    expect(isSpotlightOrderTaken(five, 3, 's3')).toBe(false);
    expect(isSpotlightOrderTaken(five, 1, 's3')).toBe(true);
  });
});
