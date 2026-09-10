import type { Prisma, PrismaClient } from '@prisma/client';
import { isMissingTableError } from '../prismaMissingTable.js';
import {
  COOKIE_COPY_KEYS,
  COOKIE_META_ID,
  COOKIE_ROW_ID_BY_KEY,
  DEFAULT_COOKIE_META,
  DEFAULT_COOKIE_ROWS,
  compareCookieRow,
  isCookieStorageKey,
  persistedCookieMeta,
  persistedCookieRow,
  type BilingualText,
  type CookieCopy,
  type CookieMetaRecord,
  type CookieRowPatch,
  type CookieRowRecord,
  type CookieRowWrite,
  type CookieStore,
} from './cookieStore.js';

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

function asCopy(value: Prisma.JsonValue): CookieCopy {
  const source =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const next = {} as CookieCopy;
  for (const key of COOKIE_COPY_KEYS) {
    next[key] = asBilingual(source[key] ?? DEFAULT_COOKIE_META.copy[key]);
  }
  return next;
}

function asGlance(value: Prisma.JsonValue): BilingualText[] {
  if (!Array.isArray(value) || value.length !== 5) {
    return DEFAULT_COOKIE_META.glance.map(asBilingual);
  }
  return value.map(asBilingual);
}

function toMeta(row: {
  effectiveDate: string;
  copy: Prisma.JsonValue;
  glance: Prisma.JsonValue;
}): CookieMetaRecord {
  return persistedCookieMeta({
    effectiveDate: row.effectiveDate,
    copy: asCopy(row.copy),
    glance: asGlance(row.glance),
  });
}

function toRow(row: {
  id: string;
  storageKey: string;
  label: Prisma.JsonValue;
  description: Prisma.JsonValue;
  sortOrder: number;
}): CookieRowRecord {
  const storageKey = isCookieStorageKey(row.storageKey) ? row.storageKey : 'i18nextLng';
  return persistedCookieRow({
    id: row.id,
    storageKey,
    label: asBilingual(row.label),
    description: asBilingual(row.description),
    sortOrder: row.sortOrder,
  });
}

function rowWriteData(row: CookieRowRecord) {
  return {
    id: row.id,
    storageKey: row.storageKey,
    label: row.label as Prisma.InputJsonValue,
    description: row.description as Prisma.InputJsonValue,
    sortOrder: row.sortOrder,
  };
}

function isUniqueError(err: unknown): boolean {
  return Boolean(err && typeof err === 'object' && (err as { code?: string }).code === 'P2002');
}

export function createPrismaCookieStore(prisma: PrismaClient): CookieStore {
  const ensureSeeded = async () => {
    try {
      const meta = await prisma.cookieMeta.findUnique({ where: { id: COOKIE_META_ID } });
      if (meta) return;
      await prisma.$transaction(async (tx) => {
        const stored = persistedCookieMeta(DEFAULT_COOKIE_META);
        await tx.cookieMeta.create({
          data: {
            id: COOKIE_META_ID,
            effectiveDate: stored.effectiveDate,
            copy: stored.copy as Prisma.InputJsonValue,
            glance: stored.glance as Prisma.InputJsonValue,
          },
        });
        await tx.cookieStorageRow.createMany({
          data: DEFAULT_COOKIE_ROWS.map((row) => rowWriteData(persistedCookieRow(row))),
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
        const row = await prisma.cookieMeta.findUnique({ where: { id: COOKIE_META_ID } });
        if (!row) return persistedCookieMeta(DEFAULT_COOKIE_META);
        return toMeta(row);
      } catch (err) {
        if (isMissingTableError(err)) return persistedCookieMeta(DEFAULT_COOKIE_META);
        throw err;
      }
    },
    async upsertMeta(input) {
      const stored = persistedCookieMeta(input);
      const row = await prisma.cookieMeta.upsert({
        where: { id: COOKIE_META_ID },
        create: {
          id: COOKIE_META_ID,
          effectiveDate: stored.effectiveDate,
          copy: stored.copy as Prisma.InputJsonValue,
          glance: stored.glance as Prisma.InputJsonValue,
        },
        update: {
          effectiveDate: stored.effectiveDate,
          copy: stored.copy as Prisma.InputJsonValue,
          glance: stored.glance as Prisma.InputJsonValue,
        },
      });
      return toMeta(row);
    },
    async listRows() {
      try {
        await ensureSeeded();
        const list = await prisma.cookieStorageRow.findMany({
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        });
        return list.map(toRow).sort(compareCookieRow);
      } catch (err) {
        if (isMissingTableError(err)) return DEFAULT_COOKIE_ROWS.map(persistedCookieRow);
        throw err;
      }
    },
    async findRowById(id) {
      const row = await prisma.cookieStorageRow.findUnique({ where: { id } });
      return row ? toRow(row) : null;
    },
    async findRowByStorageKey(storageKey) {
      const row = await prisma.cookieStorageRow.findUnique({ where: { storageKey } });
      return row ? toRow(row) : null;
    },
    async createRow(input: CookieRowWrite) {
      const id = COOKIE_ROW_ID_BY_KEY[input.storageKey];
      const row = await prisma.cookieStorageRow.create({
        data: rowWriteData(persistedCookieRow({ id, ...input })),
      });
      return toRow(row);
    },
    async updateRow(id, patch: CookieRowPatch) {
      const current = await prisma.cookieStorageRow.findUnique({ where: { id } });
      if (!current) return null;
      const stored = persistedCookieRow({ ...toRow(current), ...patch, id });
      const row = await prisma.cookieStorageRow.update({
        where: { id },
        data: {
          label: stored.label as Prisma.InputJsonValue,
          description: stored.description as Prisma.InputJsonValue,
          sortOrder: stored.sortOrder,
        },
      });
      return toRow(row);
    },
    async deleteRow(id) {
      try {
        await prisma.cookieStorageRow.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
  };
}
