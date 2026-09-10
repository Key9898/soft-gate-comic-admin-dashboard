import type { AboutHistory } from '@softgate/shared';
import { apiRequest } from './http';

export type AboutHistoryWriteBody = {
  year: number;
  month: number;
  title: { en: string; mm: string };
  description: { en: string; mm: string };
  photoUrl?: string;
  sortOrder: number;
  published: boolean;
};

export function listAboutHistories() {
  return apiRequest<{ histories: AboutHistory[] }>('/api/about/history');
}

export function createAboutHistory(body: AboutHistoryWriteBody) {
  return apiRequest<{ history: AboutHistory }>('/api/about/history', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateAboutHistory(id: string, body: Partial<AboutHistoryWriteBody>) {
  return apiRequest<{ history: AboutHistory }>(`/api/about/history/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteAboutHistory(id: string) {
  return apiRequest<{ ok: true }>(`/api/about/history/${id}`, { method: 'DELETE' });
}
