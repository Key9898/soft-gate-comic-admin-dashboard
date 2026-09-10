import { apiRequest } from './http';

export type ReaderBroadcastType = 'system' | 'promotion';
export type ReaderBroadcastStatus = 'sending' | 'sent' | 'failed';

export type ReaderBroadcast = {
  id: string;
  type: ReaderBroadcastType;
  title: { en: string; mm: string };
  message: { en: string; mm: string };
  href?: string;
  audience: 'all' | 'selected';
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

export type ReaderHit = {
  id: string;
  email: string;
  displayName: string;
};

export type BroadcastPreview = {
  readers: number;
  withEmail: number;
  withPush: number;
};

export type BroadcastAudience = { all: true } | { userIds: string[] };

export type BroadcastWriteBody = {
  type: ReaderBroadcastType;
  title: { en: string; mm: string };
  message: { en: string; mm: string };
  href?: string;
  audience: BroadcastAudience;
};

export function listReaderBroadcasts() {
  return apiRequest<{ broadcasts: ReaderBroadcast[] }>('/api/reader-broadcasts');
}

export function searchBroadcastReaders(q: string) {
  const query = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
  return apiRequest<{ readers: ReaderHit[] }>(`/api/reader-broadcasts/readers${query}`);
}

export function previewReaderBroadcast(audience: BroadcastAudience) {
  return apiRequest<BroadcastPreview>('/api/reader-broadcasts/preview', {
    method: 'POST',
    body: JSON.stringify({ audience }),
  });
}

export function sendReaderBroadcast(body: BroadcastWriteBody) {
  return apiRequest<{ broadcast: ReaderBroadcast }>('/api/reader-broadcasts', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
