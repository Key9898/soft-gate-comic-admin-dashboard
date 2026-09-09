import { randomUUID } from 'node:crypto';
import {
  exclusiveFlag,
  persistedPack,
  type CoinPackagePatch,
  type CoinPackageRecord,
  type CoinPackageStore,
  type CoinPackageWrite,
} from './coinPackageStore.js';

export function createMemoryCoinPackageStore(): CoinPackageStore {
  const packs = new Map<string, CoinPackageRecord>();

  const saveExclusive = (id: string, flag: 'popular' | 'bestValue' | null) => {
    if (!flag) return;
    for (const [key, row] of packs) {
      if (key === id) continue;
      if (flag === 'popular' && row.popular) {
        packs.set(key, persistedPack({ ...row, popular: undefined }));
      }
      if (flag === 'bestValue' && row.bestValue) {
        packs.set(key, persistedPack({ ...row, bestValue: undefined }));
      }
    }
  };

  return {
    async list() {
      return [...packs.values()].map(persistedPack);
    },
    async findById(id) {
      const row = packs.get(id);
      return row ? persistedPack(row) : null;
    },
    async create(input: CoinPackageWrite) {
      const row = persistedPack({ id: randomUUID(), ...input });
      packs.set(row.id, row);
      saveExclusive(row.id, exclusiveFlag(row));
      return persistedPack(packs.get(row.id)!);
    },
    async update(id, patch: CoinPackagePatch) {
      const current = packs.get(id);
      if (!current) return null;
      const row = persistedPack({ ...current, ...patch, id });
      packs.set(id, row);
      saveExclusive(id, exclusiveFlag(row));
      return persistedPack(packs.get(id)!);
    },
    async delete(id) {
      return packs.delete(id);
    },
  };
}
