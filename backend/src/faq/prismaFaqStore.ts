import { Prisma, type PrismaClient } from '@prisma/client';
import { isMissingTableError } from '../prismaMissingTable.js';
import {
  DEFAULT_FAQ_ITEMS,
  DEFAULT_FAQ_META,
  FAQ_META_ID,
  compareFaqItem,
  isFaqCategory,
  isFaqRelatedPath,
  persistedFaqItem,
  persistedFaqMeta,
  type BilingualText,
  type FaqItemPatch,
  type FaqItemRecord,
  type FaqItemWrite,
  type FaqStore,
} from './faqStore.js';

function asBilingual(value: unknown): BilingualText {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const row = value as { en?: unknown; mm?: unknown };
    return {
      en: typeof row.en === 'string' ? row.en : '',
      mm: typeof row.mm === 'string' ? row.mm : '',
    };
  }
  return { en: '', mm: '' };
}

function toItem(row: {
  id: string;
  category: string;
  question: Prisma.JsonValue;
  answer: Prisma.JsonValue;
  relatedTo: string | null;
  relatedLabel: Prisma.JsonValue | null;
  sortOrder: number;
  published: boolean;
}): FaqItemRecord {
  const category = isFaqCategory(row.category) ? row.category : 'general';
  const next: FaqItemRecord = {
    id: row.id,
    category,
    question: asBilingual(row.question),
    answer: asBilingual(row.answer),
    sortOrder: row.sortOrder,
    published: row.published,
  };
  if (row.relatedTo && isFaqRelatedPath(row.relatedTo)) {
    next.relatedTo = row.relatedTo;
    next.relatedLabel = asBilingual(row.relatedLabel);
  }
  return persistedFaqItem(next);
}

function itemWriteData(row: FaqItemRecord) {
  return {
    id: row.id,
    category: row.category,
    question: row.question as Prisma.InputJsonValue,
    answer: row.answer as Prisma.InputJsonValue,
    relatedTo: row.relatedTo ?? null,
    relatedLabel: row.relatedLabel ? (row.relatedLabel as Prisma.InputJsonValue) : Prisma.DbNull,
    sortOrder: row.sortOrder,
    published: row.published,
  };
}

function isUniqueError(err: unknown): boolean {
  return Boolean(err && typeof err === 'object' && (err as { code?: string }).code === 'P2002');
}

export function createPrismaFaqStore(prisma: PrismaClient): FaqStore {
  const ensureSeeded = async () => {
    try {
      const meta = await prisma.faqMeta.findUnique({ where: { id: FAQ_META_ID } });
      if (meta) return;
      await prisma.$transaction(async (tx) => {
        await tx.faqMeta.create({
          data: { id: FAQ_META_ID, nextItemNumber: DEFAULT_FAQ_META.nextItemNumber },
        });
        await tx.faqItem.createMany({
          data: DEFAULT_FAQ_ITEMS.map((row) => itemWriteData(persistedFaqItem(row))),
        });
      });
    } catch (err) {
      if (isMissingTableError(err) || isUniqueError(err)) return;
      throw err;
    }
  };

  return {
    ensureSeeded,
    async getMeta() {
      try {
        await ensureSeeded();
        const row = await prisma.faqMeta.findUnique({ where: { id: FAQ_META_ID } });
        if (!row) return persistedFaqMeta(DEFAULT_FAQ_META);
        return persistedFaqMeta({ nextItemNumber: row.nextItemNumber });
      } catch (err) {
        if (isMissingTableError(err)) return persistedFaqMeta(DEFAULT_FAQ_META);
        throw err;
      }
    },
    async listItems() {
      try {
        await ensureSeeded();
        const rows = await prisma.faqItem.findMany({
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        });
        return rows.map(toItem).sort(compareFaqItem);
      } catch (err) {
        if (isMissingTableError(err)) return DEFAULT_FAQ_ITEMS.map(persistedFaqItem);
        throw err;
      }
    },
    async findItemById(id) {
      const row = await prisma.faqItem.findUnique({ where: { id } });
      return row ? toItem(row) : null;
    },
    async createItem(input: FaqItemWrite) {
      await ensureSeeded();
      const created = await prisma.$transaction(async (tx) => {
        const meta = await tx.faqMeta.findUnique({ where: { id: FAQ_META_ID } });
        const nextItemNumber = meta?.nextItemNumber ?? DEFAULT_FAQ_META.nextItemNumber;
        const id = `q${nextItemNumber}`;
        await tx.faqMeta.upsert({
          where: { id: FAQ_META_ID },
          create: { id: FAQ_META_ID, nextItemNumber: nextItemNumber + 1 },
          update: { nextItemNumber: nextItemNumber + 1 },
        });
        return tx.faqItem.create({
          data: itemWriteData(persistedFaqItem({ id, ...input })),
        });
      });
      return toItem(created);
    },
    async updateItem(id, patch: FaqItemPatch) {
      const current = await prisma.faqItem.findUnique({ where: { id } });
      if (!current) return null;
      const merged: FaqItemRecord = { ...toItem(current), ...patch, id };
      if (patch.relatedTo === undefined && 'relatedTo' in patch) {
        delete merged.relatedTo;
        delete merged.relatedLabel;
      }
      const stored = persistedFaqItem(merged);
      const row = await prisma.faqItem.update({
        where: { id },
        data: {
          category: stored.category,
          question: stored.question as Prisma.InputJsonValue,
          answer: stored.answer as Prisma.InputJsonValue,
          relatedTo: stored.relatedTo ?? null,
          relatedLabel: stored.relatedLabel
            ? (stored.relatedLabel as Prisma.InputJsonValue)
            : Prisma.DbNull,
          sortOrder: stored.sortOrder,
          published: stored.published,
        },
      });
      return toItem(row);
    },
    async deleteItem(id) {
      try {
        await prisma.faqItem.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
  };
}
