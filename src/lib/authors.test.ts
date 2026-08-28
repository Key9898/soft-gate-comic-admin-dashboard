import { describe, expect, it } from 'vitest';
import type { Author, Webtoon } from '@softgate/shared';
import { mockAuthors } from '@softgate/shared';
import {
  assignedSeriesCount,
  authorsForPicker,
  canDeleteAuthor,
  cascadeAuthor,
  derivedWebtoonCount,
  nextAuthorId,
  syncAuthorWebtoonCounts,
} from './authors';

const author = (overrides: Partial<Author> & Pick<Author, 'id'>): Author => ({
  name: { en: overrides.id, mm: '' },
  followerCount: 0,
  webtoonCount: 0,
  status: 'active',
  ...overrides,
});

const webtoon = (overrides: Partial<Webtoon> & Pick<Webtoon, 'id' | 'author'>): Webtoon => ({
  title: { en: overrides.id, mm: '' },
  description: { en: '', mm: '' },
  coverColor: '',
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

describe('nextAuthorId', () => {
  it('returns the next numeric id and ignores non-numeric leftovers', () => {
    expect(nextAuthorId(mockAuthors)).toBe('6');
    expect(nextAuthorId([author({ id: '2' }), author({ id: 's1' }), author({ id: '9' })])).toBe(
      '10',
    );
  });
});

describe('assigned and derived counts', () => {
  const a1 = author({ id: '1' });
  const a2 = author({ id: '2' });
  const list = [
    webtoon({ id: 'w1', author: a1, status: 'ongoing' }),
    webtoon({ id: 'w2', author: a1, status: 'draft' }),
    webtoon({ id: 'w3', author: a2, status: 'completed' }),
  ];

  it('counts drafts toward assigned but not toward webtoonCount', () => {
    expect(assignedSeriesCount(list, '1')).toBe(2);
    expect(derivedWebtoonCount(list, '1')).toBe(1);
    expect(canDeleteAuthor(list, '1')).toBe(false);
    expect(canDeleteAuthor(list, '99')).toBe(true);
  });
});

describe('cascadeAuthor', () => {
  it('replaces nested author copies by id', () => {
    const a1 = author({ id: '1', name: { en: 'Old', mm: '' } });
    const updated = { ...a1, name: { en: 'New', mm: 'အသစ်' } };
    const list = [
      webtoon({ id: 'w1', author: a1 }),
      webtoon({ id: 'w2', author: author({ id: '2' }) }),
    ];
    const next = cascadeAuthor(list, updated);
    expect(next[0].author.name.en).toBe('New');
    expect(next[1].author.id).toBe('2');
  });
});

describe('syncAuthorWebtoonCounts', () => {
  it('rewrites webtoonCount from non-draft assignments', () => {
    const authors = [author({ id: '1', webtoonCount: 99 }), author({ id: '2', webtoonCount: 99 })];
    const list = [
      webtoon({ id: 'w1', author: authors[0], status: 'ongoing' }),
      webtoon({ id: 'w2', author: authors[0], status: 'draft' }),
    ];
    expect(syncAuthorWebtoonCounts(authors, list).map((item) => item.webtoonCount)).toEqual([1, 0]);
  });
});

describe('authorsForPicker', () => {
  it('lists active authors and keeps the current inactive id', () => {
    const authors = [
      author({ id: '1', status: 'active' }),
      author({ id: '5', status: 'inactive' }),
    ];
    expect(authorsForPicker(authors).map((item) => item.id)).toEqual(['1']);
    expect(authorsForPicker(authors, '5').map((item) => item.id)).toEqual(['1', '5']);
  });
});
