import {
  COOKIE_ROW_ID_BY_KEY,
  DEFAULT_COOKIE_META,
  DEFAULT_COOKIE_ROWS,
  compareCookieRow,
  persistedCookieMeta,
  persistedCookieRow,
  type CookieMetaRecord,
  type CookieRowPatch,
  type CookieRowWrite,
  type CookieStore,
} from './cookieStore.js';

export function createMemoryCookieStore(): CookieStore {
  let meta: CookieMetaRecord | null = null;
  const rows = new Map<string, ReturnType<typeof persistedCookieRow>>();

  const ensureSeeded = async () => {
    if (meta) return;
    meta = persistedCookieMeta(DEFAULT_COOKIE_META);
    for (const row of DEFAULT_COOKIE_ROWS) {
      rows.set(row.id, persistedCookieRow(row));
    }
  };

  return {
    ensureSeeded,
    async getMeta() {
      await ensureSeeded();
      return persistedCookieMeta(meta!);
    },
    async upsertMeta(input) {
      await ensureSeeded();
      meta = persistedCookieMeta(input);
      return persistedCookieMeta(meta);
    },
    async listRows() {
      await ensureSeeded();
      return [...rows.values()].map(persistedCookieRow).sort(compareCookieRow);
    },
    async findRowById(id) {
      await ensureSeeded();
      const row = rows.get(id);
      return row ? persistedCookieRow(row) : null;
    },
    async findRowByStorageKey(storageKey) {
      await ensureSeeded();
      const row = [...rows.values()].find((item) => item.storageKey === storageKey);
      return row ? persistedCookieRow(row) : null;
    },
    async createRow(input: CookieRowWrite) {
      await ensureSeeded();
      const id = COOKIE_ROW_ID_BY_KEY[input.storageKey];
      const row = persistedCookieRow({ id, ...input });
      rows.set(id, row);
      return persistedCookieRow(row);
    },
    async updateRow(id, patch: CookieRowPatch) {
      await ensureSeeded();
      const current = rows.get(id);
      if (!current) return null;
      const row = persistedCookieRow({ ...current, ...patch, id, storageKey: current.storageKey });
      rows.set(id, row);
      return persistedCookieRow(row);
    },
    async deleteRow(id) {
      await ensureSeeded();
      return rows.delete(id);
    },
  };
}
