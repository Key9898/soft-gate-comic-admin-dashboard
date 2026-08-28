import type { MediaAssetRecord, MediaAssetStore } from './mediaAssetStore.js';

export function createMemoryMediaAssetStore(): MediaAssetStore {
  const rows = new Map<string, MediaAssetRecord>();

  return {
    async create(input) {
      const row: MediaAssetRecord = { ...input, createdAt: new Date() };
      rows.set(row.id, row);
      return row;
    },
    async list() {
      return [...rows.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    async findById(id) {
      return rows.get(id) ?? null;
    },
    async delete(id) {
      return rows.delete(id);
    },
  };
}
