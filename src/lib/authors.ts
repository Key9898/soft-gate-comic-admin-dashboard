import type { Author, Webtoon } from '@softgate/shared';

const numericId = (id: string): number | null => {
  if (!/^\d+$/.test(id)) return null;
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
};

export const nextAuthorId = (authors: Author[]): string => {
  let max = 0;
  for (const author of authors) {
    const n = numericId(author.id);
    if (n != null && n > max) max = n;
  }
  return String(max + 1);
};

export const assignedSeriesCount = (webtoons: Webtoon[], authorId: string): number =>
  webtoons.filter((webtoon) => webtoon.author.id === authorId).length;

export const derivedWebtoonCount = (webtoons: Webtoon[], authorId: string): number =>
  webtoons.filter((webtoon) => webtoon.author.id === authorId && webtoon.status !== 'draft').length;

export const canDeleteAuthor = (webtoons: Webtoon[], authorId: string): boolean =>
  assignedSeriesCount(webtoons, authorId) === 0;

export const cascadeAuthor = (webtoons: Webtoon[], updated: Author): Webtoon[] =>
  webtoons.map((webtoon) =>
    webtoon.author.id === updated.id ? { ...webtoon, author: updated } : webtoon,
  );

export const syncAuthorWebtoonCounts = (authors: Author[], webtoons: Webtoon[]): Author[] =>
  authors.map((author) => ({
    ...author,
    webtoonCount: derivedWebtoonCount(webtoons, author.id),
  }));

export const authorsForPicker = (authors: Author[], currentId?: string): Author[] =>
  authors.filter((author) => author.status === 'active' || author.id === currentId);

export const withDerivedCount = (author: Author, webtoons: Webtoon[]): Author => ({
  ...author,
  webtoonCount: derivedWebtoonCount(webtoons, author.id),
});
