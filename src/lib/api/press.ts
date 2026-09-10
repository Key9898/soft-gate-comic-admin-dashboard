import { apiRequest } from './http';
import type { PressMeta, PressNews, PressStill } from '@/lib/press';

export type PressMetaWriteBody = PressMeta;
export type PressNewsWriteBody = Omit<PressNews, 'id'>;
export type PressStillWriteBody = Omit<PressStill, 'id'>;

export function getPressMeta() {
  return apiRequest<{ meta: PressMeta }>('/api/press');
}

export function updatePressMeta(body: PressMetaWriteBody) {
  return apiRequest<{ meta: PressMeta }>('/api/press', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function listPressNews() {
  return apiRequest<{ news: PressNews[] }>('/api/press/news');
}

export function createPressNews(body: PressNewsWriteBody) {
  return apiRequest<{ item: PressNews }>('/api/press/news', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updatePressNews(id: string, body: Partial<PressNewsWriteBody>) {
  return apiRequest<{ item: PressNews }>(`/api/press/news/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deletePressNews(id: string) {
  return apiRequest<{ ok: true }>(`/api/press/news/${id}`, { method: 'DELETE' });
}

export function listPressStills() {
  return apiRequest<{ stills: PressStill[] }>('/api/press/stills');
}

export function createPressStill(body: PressStillWriteBody) {
  return apiRequest<{ item: PressStill }>('/api/press/stills', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updatePressStill(id: string, body: Partial<PressStillWriteBody>) {
  return apiRequest<{ item: PressStill }>(`/api/press/stills/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deletePressStill(id: string) {
  return apiRequest<{ ok: true }>(`/api/press/stills/${id}`, { method: 'DELETE' });
}
