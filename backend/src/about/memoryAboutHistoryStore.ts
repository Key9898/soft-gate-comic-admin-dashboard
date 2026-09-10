import { randomUUID } from 'node:crypto';
import {
  assertPhotoAllowed,
  compareHistory,
  persistedHistory,
  stripNonFirstPhotos,
  type AboutHistoryPatch,
  type AboutHistoryRecord,
  type AboutHistoryStore,
  type AboutHistoryWrite,
} from './aboutHistoryStore.js';

export function createMemoryAboutHistoryStore(): AboutHistoryStore {
  const rows = new Map<string, AboutHistoryRecord>();

  const all = () => [...rows.values()].map(persistedHistory);

  const replaceAll = (next: AboutHistoryRecord[]) => {
    rows.clear();
    for (const row of next) {
      rows.set(row.id, persistedHistory(row));
    }
  };

  const stripYears = (years: number[]) => {
    replaceAll(stripNonFirstPhotos(all(), years));
  };

  return {
    async list() {
      return all().sort(compareHistory);
    },
    async findById(id) {
      const row = rows.get(id);
      return row ? persistedHistory(row) : null;
    },
    async create(input: AboutHistoryWrite) {
      const row = persistedHistory({ id: randomUUID(), ...input });
      assertPhotoAllowed(all(), row);
      rows.set(row.id, row);
      stripYears([row.year]);
      return persistedHistory(rows.get(row.id)!);
    },
    async update(id, patch: AboutHistoryPatch) {
      const current = rows.get(id);
      if (!current) return null;
      const row = persistedHistory({ ...current, ...patch, id });
      if (patch.photoUrl) assertPhotoAllowed(all(), row);
      rows.set(id, row);
      stripYears([current.year, row.year]);
      return persistedHistory(rows.get(id)!);
    },
    async delete(id) {
      const current = rows.get(id);
      if (!current) return false;
      rows.delete(id);
      stripYears([current.year]);
      return true;
    },
  };
}
