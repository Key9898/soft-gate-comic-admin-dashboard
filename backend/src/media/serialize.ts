import type { MediaAssetRecord } from './mediaAssetStore.js';

export function publicMediaFile(row: MediaAssetRecord) {
  return {
    id: row.id,
    name: row.name,
    type: row.kind,
    url: row.url,
    size: row.size,
    uploadedAt: row.createdAt.toISOString(),
    category: row.category,
  };
}
