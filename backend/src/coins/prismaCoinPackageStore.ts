import type { PrismaClient } from '@prisma/client';
import {
  exclusiveFlag,
  persistedPack,
  type CoinPackagePatch,
  type CoinPackageRecord,
  type CoinPackageStore,
  type CoinPackageWrite,
} from './coinPackageStore.js';

function toRecord(row: {
  id: string;
  coins: number;
  price: number;
  bonus: number | null;
  popular: boolean | null;
  bestValue: boolean | null;
}): CoinPackageRecord {
  return persistedPack({
    id: row.id,
    coins: row.coins,
    price: row.price,
    bonus: row.bonus ?? undefined,
    popular: row.popular || undefined,
    bestValue: row.bestValue || undefined,
  });
}

export function createPrismaCoinPackageStore(prisma: PrismaClient): CoinPackageStore {
  const saveExclusive = async (id: string, flag: 'popular' | 'bestValue' | null) => {
    if (flag === 'popular') {
      await prisma.coinPackage.updateMany({
        where: { id: { not: id }, popular: true },
        data: { popular: null },
      });
    }
    if (flag === 'bestValue') {
      await prisma.coinPackage.updateMany({
        where: { id: { not: id }, bestValue: true },
        data: { bestValue: null },
      });
    }
  };

  return {
    async list() {
      const rows = await prisma.coinPackage.findMany({ orderBy: { createdAt: 'asc' } });
      return rows.map(toRecord);
    },
    async findById(id) {
      const row = await prisma.coinPackage.findUnique({ where: { id } });
      return row ? toRecord(row) : null;
    },
    async create(input: CoinPackageWrite) {
      const stored = persistedPack({ id: 'pending', ...input });
      const row = await prisma.coinPackage.create({
        data: {
          coins: stored.coins,
          price: stored.price,
          bonus: stored.bonus ?? null,
          popular: stored.popular ?? null,
          bestValue: stored.bestValue ?? null,
        },
      });
      await saveExclusive(row.id, exclusiveFlag(stored));
      const fresh = await prisma.coinPackage.findUnique({ where: { id: row.id } });
      return toRecord(fresh ?? row);
    },
    async update(id, patch: CoinPackagePatch) {
      const current = await prisma.coinPackage.findUnique({ where: { id } });
      if (!current) return null;
      const stored = persistedPack({ ...toRecord(current), ...patch, id });
      await prisma.coinPackage.update({
        where: { id },
        data: {
          coins: stored.coins,
          price: stored.price,
          bonus: stored.bonus ?? null,
          popular: stored.popular ?? null,
          bestValue: stored.bestValue ?? null,
        },
      });
      await saveExclusive(id, exclusiveFlag(stored));
      const fresh = await prisma.coinPackage.findUnique({ where: { id } });
      return fresh ? toRecord(fresh) : stored;
    },
    async delete(id) {
      try {
        await prisma.coinPackage.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
  };
}
