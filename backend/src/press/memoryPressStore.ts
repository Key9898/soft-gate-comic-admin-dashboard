import { randomUUID } from 'node:crypto';
import {
  DEFAULT_PRESS_META,
  comparePressRow,
  persistedMeta,
  persistedNews,
  persistedStill,
  type PressMetaRecord,
  type PressNewsPatch,
  type PressNewsRecord,
  type PressNewsWrite,
  type PressStillPatch,
  type PressStillRecord,
  type PressStillWrite,
  type PressStore,
} from './pressStore.js';

export function createMemoryPressStore(): PressStore {
  let meta: PressMetaRecord | null = null;
  const news = new Map<string, PressNewsRecord>();
  const stills = new Map<string, PressStillRecord>();

  return {
    async getMeta() {
      if (!meta) meta = persistedMeta(DEFAULT_PRESS_META);
      return persistedMeta(meta);
    },
    async upsertMeta(input) {
      meta = persistedMeta(input);
      return persistedMeta(meta);
    },
    async listNews() {
      return [...news.values()].map(persistedNews).sort(comparePressRow);
    },
    async findNewsById(id) {
      const row = news.get(id);
      return row ? persistedNews(row) : null;
    },
    async createNews(input: PressNewsWrite) {
      const row = persistedNews({ id: randomUUID(), ...input });
      news.set(row.id, row);
      return persistedNews(row);
    },
    async updateNews(id, patch: PressNewsPatch) {
      const current = news.get(id);
      if (!current) return null;
      const merged = { ...current, ...patch, id };
      if (patch.href === '') merged.href = undefined;
      const row = persistedNews(merged);
      news.set(id, row);
      return persistedNews(row);
    },
    async deleteNews(id) {
      return news.delete(id);
    },
    async listStills() {
      return [...stills.values()].map(persistedStill).sort(comparePressRow);
    },
    async findStillById(id) {
      const row = stills.get(id);
      return row ? persistedStill(row) : null;
    },
    async createStill(input: PressStillWrite) {
      const row = persistedStill({ id: randomUUID(), ...input });
      stills.set(row.id, row);
      return persistedStill(row);
    },
    async updateStill(id, patch: PressStillPatch) {
      const current = stills.get(id);
      if (!current) return null;
      const row = persistedStill({ ...current, ...patch, id });
      stills.set(id, row);
      return persistedStill(row);
    },
    async deleteStill(id) {
      return stills.delete(id);
    },
  };
}
