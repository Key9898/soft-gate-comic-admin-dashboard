export type BilingualText = { en: string; mm: string };

export type AboutHistoryRecord = {
  id: string;
  year: number;
  month: number;
  title: BilingualText;
  description: BilingualText;
  photoUrl?: string;
  sortOrder: number;
  published: boolean;
};

export type AboutHistoryWrite = {
  year: number;
  month: number;
  title: BilingualText;
  description: BilingualText;
  photoUrl?: string;
  sortOrder: number;
  published: boolean;
};

export type AboutHistoryPatch = Partial<AboutHistoryWrite>;

export type AboutHistoryStore = {
  list: () => Promise<AboutHistoryRecord[]>;
  findById: (id: string) => Promise<AboutHistoryRecord | null>;
  create: (input: AboutHistoryWrite) => Promise<AboutHistoryRecord>;
  update: (id: string, patch: AboutHistoryPatch) => Promise<AboutHistoryRecord | null>;
  delete: (id: string) => Promise<boolean>;
};

export const PHOTO_FIRST_OF_YEAR_ERROR =
  'photo is only allowed on the first published entry of that year';

export class PhotoNotFirstError extends Error {
  constructor() {
    super(PHOTO_FIRST_OF_YEAR_ERROR);
    this.name = 'PhotoNotFirstError';
  }
}

export function persistedHistory(row: AboutHistoryRecord): AboutHistoryRecord {
  const next: AboutHistoryRecord = {
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

export function compareHistory(a: AboutHistoryRecord, b: AboutHistoryRecord): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.id.localeCompare(b.id);
}

export function firstPublishedId(rows: AboutHistoryRecord[], year: number): string | null {
  const published = rows
    .filter((row) => row.published && row.year === year)
    .slice()
    .sort(compareHistory);
  return published[0]?.id ?? null;
}

export function wouldBeFirstPublished(
  rows: AboutHistoryRecord[],
  candidate: AboutHistoryRecord,
): boolean {
  if (!candidate.published) return false;
  const next = rows.filter((row) => row.id !== candidate.id).concat(candidate);
  return firstPublishedId(next, candidate.year) === candidate.id;
}

export function assertPhotoAllowed(
  rows: AboutHistoryRecord[],
  candidate: AboutHistoryRecord,
): void {
  if (!candidate.photoUrl) return;
  if (!wouldBeFirstPublished(rows, candidate)) {
    throw new PhotoNotFirstError();
  }
}

export function stripNonFirstPhotos(
  rows: AboutHistoryRecord[],
  years: number[],
): AboutHistoryRecord[] {
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
