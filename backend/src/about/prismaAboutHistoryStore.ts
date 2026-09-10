import type { Prisma, PrismaClient } from '@prisma/client';
import {
  assertPhotoAllowed,
  persistedHistory,
  stripNonFirstPhotos,
  type AboutHistoryPatch,
  type AboutHistoryRecord,
  type AboutHistoryStore,
  type AboutHistoryWrite,
  type BilingualText,
} from './aboutHistoryStore.js';

function asBilingual(value: Prisma.JsonValue): BilingualText {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const row = value as { en?: unknown; mm?: unknown };
    return {
      en: typeof row.en === 'string' ? row.en : '',
      mm: typeof row.mm === 'string' ? row.mm : '',
    };
  }
  return { en: '', mm: '' };
}

function toRecord(row: {
  id: string;
  year: number;
  month: number;
  title: Prisma.JsonValue;
  description: Prisma.JsonValue;
  photoUrl: string | null;
  sortOrder: number;
  published: boolean;
}): AboutHistoryRecord {
  return persistedHistory({
    id: row.id,
    year: row.year,
    month: row.month,
    title: asBilingual(row.title),
    description: asBilingual(row.description),
    photoUrl: row.photoUrl ?? undefined,
    sortOrder: row.sortOrder,
    published: row.published,
  });
}

export function createPrismaAboutHistoryStore(prisma: PrismaClient): AboutHistoryStore {
  const listRows = async () => {
    const rows = await prisma.aboutHistory.findMany({
      orderBy: [{ year: 'asc' }, { month: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
    });
    return rows.map(toRecord);
  };

  const stripYears = async (years: number[]) => {
    const listed = await listRows();
    const next = stripNonFirstPhotos(listed, years);
    await Promise.all(
      listed.map((row) => {
        const updated = next.find((item) => item.id === row.id);
        if (!updated) return Promise.resolve();
        const was = row.photoUrl ?? '';
        const now = updated.photoUrl ?? '';
        if (was === now) return Promise.resolve();
        return prisma.aboutHistory.update({
          where: { id: row.id },
          data: { photoUrl: updated.photoUrl ?? null },
        });
      }),
    );
  };

  return {
    async list() {
      return listRows();
    },
    async findById(id) {
      const row = await prisma.aboutHistory.findUnique({ where: { id } });
      return row ? toRecord(row) : null;
    },
    async create(input: AboutHistoryWrite) {
      const listed = await listRows();
      const pending = persistedHistory({ id: 'pending', ...input });
      assertPhotoAllowed(listed, pending);
      const row = await prisma.aboutHistory.create({
        data: {
          year: pending.year,
          month: pending.month,
          title: pending.title,
          description: pending.description,
          photoUrl: pending.photoUrl ?? null,
          sortOrder: pending.sortOrder,
          published: pending.published,
        },
      });
      await stripYears([row.year]);
      const fresh = await prisma.aboutHistory.findUnique({ where: { id: row.id } });
      return toRecord(fresh ?? row);
    },
    async update(id, patch: AboutHistoryPatch) {
      const current = await prisma.aboutHistory.findUnique({ where: { id } });
      if (!current) return null;
      const listed = await listRows();
      const stored = persistedHistory({ ...toRecord(current), ...patch, id });
      if (patch.photoUrl) assertPhotoAllowed(listed, stored);
      await prisma.aboutHistory.update({
        where: { id },
        data: {
          year: stored.year,
          month: stored.month,
          title: stored.title,
          description: stored.description,
          photoUrl: stored.photoUrl ?? null,
          sortOrder: stored.sortOrder,
          published: stored.published,
        },
      });
      await stripYears([current.year, stored.year]);
      const fresh = await prisma.aboutHistory.findUnique({ where: { id } });
      return fresh ? toRecord(fresh) : stored;
    },
    async delete(id) {
      const current = await prisma.aboutHistory.findUnique({ where: { id } });
      if (!current) return false;
      try {
        await prisma.aboutHistory.delete({ where: { id } });
      } catch {
        return false;
      }
      await stripYears([current.year]);
      return true;
    },
  };
}
