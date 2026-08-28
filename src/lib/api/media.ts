import type { MediaFile } from '@softgate/shared';
import { apiRequest, apiUpload } from './http';

export function listMedia() {
  return apiRequest<{ files: MediaFile[] }>('/api/media');
}

export function uploadMedia(file: File, category?: string) {
  const body = new FormData();
  body.append('file', file);
  if (category) body.append('category', category);
  return apiUpload<{ file: MediaFile }>('/api/media', body);
}

export function deleteMedia(id: string) {
  return apiRequest<{ ok: true }>(`/api/media/${id}`, { method: 'DELETE' });
}
