import type { AboutHistory } from '@softgate/shared';
import { mockAboutHistories } from '@softgate/shared';

export const ABOUT_HISTORY_STORAGE_KEY = 'softgate_admin_about_history_v1';
export const ABOUT_HISTORY_SCHEMA_VERSION = 1;

export const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export type HistoryCandidate = Pick<
  AboutHistory,
  'id' | 'year' | 'month' | 'sortOrder' | 'published'
>;

export function persistedHistory(row: AboutHistory): AboutHistory {
  const next: AboutHistory = {
    id: row.id,
    year: row.year,
    month: row.month,
    title: { en: row.title.en, mm: row.title.mm },
    description: { en: row.description.en, mm: row.description.mm },
    sortOrder: row.sortOrder,
    published: row.published,
  };
  if (row.photoUrl) next.photoUrl = row.photoUrl;
  return next;
}

export function compareHistory(a: HistoryCandidate, b: HistoryCandidate): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.id.localeCompare(b.id);
}

export function sortHistories(rows: AboutHistory[]): AboutHistory[] {
  return rows.slice().sort(compareHistory);
}

export function firstPublishedId(rows: HistoryCandidate[], year: number): string | null {
  const published = rows
    .filter((row) => row.published && row.year === year)
    .slice()
    .sort(compareHistory);
  return published[0]?.id ?? null;
}

export function wouldBeFirstPublished(
  rows: HistoryCandidate[],
  candidate: HistoryCandidate,
): boolean {
  if (!candidate.published) return false;
  const next = rows.filter((row) => row.id !== candidate.id).concat(candidate);
  return firstPublishedId(next, candidate.year) === candidate.id;
}

export function stripNonFirstPhotos(rows: AboutHistory[], years: number[]): AboutHistory[] {
  const uniqueYears = [...new Set(years)];
  const firstIds = new Set(
    uniqueYears
      .map((year) => firstPublishedId(rows, year))
      .filter((id): id is string => Boolean(id)),
  );
  return rows.map((row) => {
    if (!row.photoUrl) return persistedHistory(row);
    if (row.published && firstIds.has(row.id)) return persistedHistory(row);
    return persistedHistory({ ...row, photoUrl: undefined });
  });
}

export function groupHistoriesByYear(
  rows: AboutHistory[],
): Array<{ year: number; items: AboutHistory[] }> {
  const groups: Array<{ year: number; items: AboutHistory[] }> = [];
  for (const row of sortHistories(rows)) {
    const last = groups[groups.length - 1];
    if (last && last.year === row.year) last.items.push(row);
    else groups.push({ year: row.year, items: [row] });
  }
  return groups;
}

export function monthLabel(month: number): string {
  return MONTH_LABELS[month - 1] ?? String(month);
}

export function nextAboutHistoryId(rows: AboutHistory[]): string {
  let max = 0;
  for (const row of rows) {
    const match = /^h(\d+)$/.exec(row.id);
    const n = match ? Number(match[1]) : /^\d+$/.test(row.id) ? Number(row.id) : null;
    if (n != null && n > max) max = n;
  }
  return `h${max + 1}`;
}

export function loadAboutHistories(): AboutHistory[] {
  const raw = localStorage.getItem(ABOUT_HISTORY_STORAGE_KEY);
  if (!raw) return mockAboutHistories;
  try {
    const parsed = JSON.parse(raw) as { schemaVersion?: number; histories?: unknown };
    if (parsed.schemaVersion !== ABOUT_HISTORY_SCHEMA_VERSION || !Array.isArray(parsed.histories)) {
      return mockAboutHistories;
    }
    return parsed.histories as AboutHistory[];
  } catch {
    return mockAboutHistories;
  }
}

export function saveAboutHistories(rows: AboutHistory[]): void {
  localStorage.setItem(
    ABOUT_HISTORY_STORAGE_KEY,
    JSON.stringify({ schemaVersion: ABOUT_HISTORY_SCHEMA_VERSION, histories: rows }),
  );
}
