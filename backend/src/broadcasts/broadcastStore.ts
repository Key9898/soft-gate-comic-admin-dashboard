export const READER_BROADCAST_TYPES = ['system', 'promotion'] as const;
export const READER_BROADCAST_AUDIENCES = ['all', 'selected'] as const;
export const READER_BROADCAST_STATUSES = ['sending', 'sent', 'failed'] as const;

export type ReaderBroadcastType = (typeof READER_BROADCAST_TYPES)[number];
export type ReaderBroadcastAudienceKind = (typeof READER_BROADCAST_AUDIENCES)[number];
export type ReaderBroadcastStatus = (typeof READER_BROADCAST_STATUSES)[number];

export type ReaderBroadcastRecord = {
  id: string;
  type: ReaderBroadcastType;
  title: { en: string; mm: string };
  message: { en: string; mm: string };
  href?: string;
  audience: ReaderBroadcastAudienceKind;
  readerIds: string[];
  status: ReaderBroadcastStatus;
  createdById: string;
  inboxCount: number;
  emailed: number;
  pushed: number;
  skippedPref: number;
  failureReason?: string;
  createdAt: string;
};

export type ReaderBroadcastWrite = {
  id?: string;
  type: ReaderBroadcastType;
  title: { en: string; mm: string };
  message: { en: string; mm: string };
  href?: string;
  audience: ReaderBroadcastAudienceKind;
  readerIds: string[];
  createdById: string;
};

export type ReaderBroadcastCounts = {
  inboxCount: number;
  emailed: number;
  pushed: number;
  skippedPref: number;
};

export type ReaderBroadcastStore = {
  list: () => Promise<ReaderBroadcastRecord[]>;
  findById: (id: string) => Promise<ReaderBroadcastRecord | null>;
  createSending: (input: ReaderBroadcastWrite) => Promise<ReaderBroadcastRecord>;
  markSent: (id: string, counts: ReaderBroadcastCounts) => Promise<ReaderBroadcastRecord | null>;
  markFailed: (id: string, reason: string) => Promise<ReaderBroadcastRecord | null>;
};

export function isReaderBroadcastType(value: unknown): value is ReaderBroadcastType {
  return value === 'system' || value === 'promotion';
}

export function publicBroadcast(row: ReaderBroadcastRecord): ReaderBroadcastRecord {
  const next: ReaderBroadcastRecord = {
    id: row.id,
    type: row.type,
    title: { en: row.title.en, mm: row.title.mm },
    message: { en: row.message.en, mm: row.message.mm },
    audience: row.audience,
    readerIds: [...row.readerIds],
    status: row.status,
    createdById: row.createdById,
    inboxCount: row.inboxCount,
    emailed: row.emailed,
    pushed: row.pushed,
    skippedPref: row.skippedPref,
    createdAt: row.createdAt,
  };
  if (row.href) next.href = row.href;
  if (row.failureReason) next.failureReason = row.failureReason;
  return next;
}
