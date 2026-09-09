import type { ReaderUser } from '@softgate/shared';
import { apiRequest } from './http';

export type ReaderUserProfileBody = {
  displayName?: string;
  email?: string;
  bio?: string;
  avatar?: string | null;
};

export function listReaderUsers() {
  return apiRequest<{ users: ReaderUser[] }>('/api/users');
}

export function updateReaderUser(id: string, body: ReaderUserProfileBody) {
  return apiRequest<{ user: ReaderUser }>(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteReaderUser(id: string) {
  return apiRequest<{ ok: true }>(`/api/users/${id}`, { method: 'DELETE' });
}
