import { apiRequest } from './http';
import type { CookieMeta, CookieRow, CookieRowWrite } from '@/lib/cookiesPolicy';

export type CookieMetaWriteBody = CookieMeta;
export type CookieRowWriteBody = CookieRowWrite;

export function getCookiesPolicy() {
  return apiRequest<{ meta: CookieMeta; rows: CookieRow[] }>('/api/cookies');
}

export function updateCookiesMeta(body: CookieMetaWriteBody) {
  return apiRequest<{ meta: CookieMeta }>('/api/cookies', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function createCookieRow(body: CookieRowWriteBody) {
  return apiRequest<{ item: CookieRow }>('/api/cookies/rows', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateCookieRow(id: string, body: Partial<Omit<CookieRowWriteBody, 'storageKey'>>) {
  return apiRequest<{ item: CookieRow }>(`/api/cookies/rows/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteCookieRow(id: string) {
  return apiRequest<{ ok: true }>(`/api/cookies/rows/${id}`, { method: 'DELETE' });
}
