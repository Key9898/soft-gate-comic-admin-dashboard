import type { PrismaClient } from '@prisma/client';
import type { MediaAssetRecord, MediaAssetStore } from './mediaAssetStore.js';

function toRecord(row: {
  id: string;
  key: string;
  url: string;
  name: string;
  contentType: string;
  kind: 'image' | 'pdf';
  size: number;
  category: string;
  createdAt: Date;
}): MediaAssetRecord {
  return {
    id: row.id,
    key: row.key,
    url: row.url,
    name: row.name,
    contentType: row.contentType,
    kind: row.kind,
    size: row.size,
    category: row.category,
    createdAt: row.createdAt,
  };
}

export function createPrismaMediaAssetStore(prisma: PrismaClient): MediaAssetStore {
  return {
    async create(input) {
      const row = await prisma.mediaAsset.create({
        data: {
          id: input.id,
          key: input.key,
          url: input.url,
          name: input.name,
          contentType: input.contentType,
          kind: input.kind,
          size: input.size,
          category: input.category,
        },
      });
      return toRecord(row);
    },
    async list() {
      const rows = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } });
      return rows.map(toRecord);
    },
    async findById(id) {
      const row = await prisma.mediaAsset.findUnique({ where: { id } });
      return row ? toRecord(row) : null;
    },
    async delete(id) {
      try {
        await prisma.mediaAsset.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
  };
}
