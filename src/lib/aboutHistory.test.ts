import { describe, expect, it } from 'vitest';
import { mockAboutHistories } from '@softgate/shared';
import {
  firstPublishedId,
  groupHistoriesByYear,
  nextAboutHistoryId,
  stripNonFirstPhotos,
  wouldBeFirstPublished,
} from './aboutHistory';

describe('aboutHistory helpers', () => {
  it('treats Founded as first published of 2026', () => {
    expect(firstPublishedId(mockAboutHistories, 2026)).toBe('h1');
    expect(wouldBeFirstPublished(mockAboutHistories, mockAboutHistories[0])).toBe(true);
    expect(wouldBeFirstPublished(mockAboutHistories, mockAboutHistories[1])).toBe(false);
  });

  it('groups mock rows under 2026 oldest-first', () => {
    const groups = groupHistoriesByYear(mockAboutHistories);
    expect(groups).toHaveLength(1);
    expect(groups[0].year).toBe(2026);
    expect(groups[0].items.map((row) => row.id)).toEqual(['h1', 'h2', 'h3', 'h4']);
  });

  it('strips a photo that is no longer first of year', () => {
    const withPhoto = mockAboutHistories.map((row) =>
      row.id === 'h1' ? { ...row, photoUrl: 'https://cdn.example/founded.webp' } : row,
    );
    const demoted = withPhoto.map((row) => (row.id === 'h1' ? { ...row, month: 6 } : row));
    const stripped = stripNonFirstPhotos(demoted, [2026]);
    expect(stripped.find((row) => row.id === 'h1')?.photoUrl).toBeUndefined();
    expect(stripped.find((row) => row.id === 'h2')?.photoUrl).toBeUndefined();
  });

  it('increments mock hN ids', () => {
    expect(nextAboutHistoryId(mockAboutHistories)).toBe('h5');
  });
});
