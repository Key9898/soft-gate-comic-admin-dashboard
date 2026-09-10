import {
  DEFAULT_FAQ_ITEMS,
  DEFAULT_FAQ_META,
  compareFaqItem,
  persistedFaqItem,
  persistedFaqMeta,
  type FaqItemPatch,
  type FaqItemRecord,
  type FaqItemWrite,
  type FaqMetaRecord,
  type FaqStore,
} from './faqStore.js';

export function createMemoryFaqStore(): FaqStore {
  let meta: FaqMetaRecord | null = null;
  const items = new Map<string, FaqItemRecord>();

  const ensureSeeded = async () => {
    if (meta) return;
    meta = persistedFaqMeta(DEFAULT_FAQ_META);
    for (const row of DEFAULT_FAQ_ITEMS) {
      items.set(row.id, persistedFaqItem(row));
    }
  };

  return {
    ensureSeeded,
    async getMeta() {
      await ensureSeeded();
      return persistedFaqMeta(meta!);
    },
    async listItems() {
      await ensureSeeded();
      return [...items.values()].map(persistedFaqItem).sort(compareFaqItem);
    },
    async findItemById(id) {
      await ensureSeeded();
      const row = items.get(id);
      return row ? persistedFaqItem(row) : null;
    },
    async createItem(input: FaqItemWrite) {
      await ensureSeeded();
      const id = `q${meta!.nextItemNumber}`;
      meta = { nextItemNumber: meta!.nextItemNumber + 1 };
      const row = persistedFaqItem({ id, ...input });
      items.set(id, row);
      return persistedFaqItem(row);
    },
    async updateItem(id, patch: FaqItemPatch) {
      await ensureSeeded();
      const current = items.get(id);
      if (!current) return null;
      const merged: FaqItemRecord = { ...current, ...patch, id };
      if (patch.relatedTo === undefined && 'relatedTo' in patch) {
        delete merged.relatedTo;
        delete merged.relatedLabel;
      }
      const row = persistedFaqItem(merged);
      items.set(id, row);
      return persistedFaqItem(row);
    },
    async deleteItem(id) {
      await ensureSeeded();
      return items.delete(id);
    },
  };
}
