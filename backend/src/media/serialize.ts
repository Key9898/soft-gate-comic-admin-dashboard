import type { MediaAssetRecord } from './mediaAssetStore.js';
import { publicMediaUrl } from './r2Config.js';

export function publicMediaFile(row: MediaAssetRecord) {
  return {
    id: row.id,
    name: row.name,
    type: row.kind,
    url: publicMediaUrl(row.key),
    size: row.size,
    uploadedAt: row.createdAt.toISOString(),
    category: row.category,
  };
}
