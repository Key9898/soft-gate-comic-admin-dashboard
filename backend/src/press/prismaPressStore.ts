import type { Prisma, PrismaClient } from '@prisma/client';
import {
  DEFAULT_PRESS_META,
  PRESS_COPY_KEYS,
  PRESS_FACT_KEYS,
  PRESS_META_ID,
  persistedMeta,
  persistedNews,
  persistedStill,
  type BilingualText,
  type PressAsset,
  type PressCopy,
  type PressFact,
  type PressFactKey,
  type PressMetaRecord,
  type PressNewsPatch,
  type PressNewsRecord,
  type PressNewsWrite,
  type PressPaletteSwatch,
  type PressStillPatch,
  type PressStillRecord,
  type PressStillWrite,
  type PressStore,
} from './pressStore.js';
import { isMissingTableError } from '../prismaMissingTable.js';

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

function asCopy(value: Prisma.JsonValue): PressCopy {
  const source =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const next = {} as PressCopy;
  for (const key of PRESS_COPY_KEYS) {
    next[key] = asBilingual(source[key] ?? DEFAULT_PRESS_META.copy[key]);
  }
  return next;
}

function asFacts(value: Prisma.JsonValue): Record<PressFactKey, PressFact> {
  const source =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const next = {} as Record<PressFactKey, PressFact>;
  for (const key of PRESS_FACT_KEYS) {
    const fallback = DEFAULT_PRESS_META.facts[key];
    const raw = source[key];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      next[key] = {
        label: asBilingual(fallback.label),
        value: asBilingual(fallback.value),
        ...(fallback.href ? { href: fallback.href } : {}),
      };
      continue;
    }
    const row = raw as { label?: unknown; value?: unknown; href?: unknown };
    const fact: PressFact = {
      label: asBilingual(row.label ?? fallback.label),
      value: asBilingual(row.value ?? fallback.value),
    };
    if (typeof row.href === 'string' && row.href.trim()) fact.href = row.href.trim();
    else if (fallback.href) fact.href = fallback.href;
    next[key] = fact;
  }
  return next;
}

function asPalette(value: Prisma.JsonValue): PressPaletteSwatch[] {
  if (!Array.isArray(value) || value.length === 0) {
    return DEFAULT_PRESS_META.palette.map((item) => ({
      hex: item.hex,
      label: asBilingual(item.label),
    }));
  }
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const row = item as { hex?: unknown; label?: unknown };
    if (typeof row.hex !== 'string') return [];
    return [{ hex: row.hex, label: asBilingual(row.label) }];
  });
}

function asAssets(value: Prisma.JsonValue): PressAsset[] {
  if (!Array.isArray(value) || value.length === 0) {
    return DEFAULT_PRESS_META.assets.map((item) => ({
      name: asBilingual(item.name),
      url: item.url,
      format: item.format,
    }));
  }
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const row = item as { name?: unknown; url?: unknown; format?: unknown };
    if (typeof row.url !== 'string' || typeof row.format !== 'string') return [];
    return [{ name: asBilingual(row.name), url: row.url, format: row.format }];
  });
}

function toMeta(row: {
  copy: Prisma.JsonValue;
  zipUrl: string;
  contactEmail: string;
  facts: Prisma.JsonValue;
  palette: Prisma.JsonValue;
  assets: Prisma.JsonValue;
  spokespersonMemberId: string | null;
}): PressMetaRecord {
  return persistedMeta({
    copy: asCopy(row.copy),
    zipUrl: row.zipUrl,
    contactEmail: row.contactEmail,
    facts: asFacts(row.facts),
    palette: asPalette(row.palette),
    assets: asAssets(row.assets),
    spokespersonMemberId: row.spokespersonMemberId ?? undefined,
  });
}

function toNews(row: {
  id: string;
  title: Prisma.JsonValue;
  body: Prisma.JsonValue;
  href: string | null;
  sortOrder: number;
  published: boolean;
  demoBadge: boolean;
}): PressNewsRecord {
  return persistedNews({
    id: row.id,
    title: asBilingual(row.title),
    body: asBilingual(row.body),
    href: row.href ?? undefined,
    sortOrder: row.sortOrder,
    published: row.published,
    demoBadge: row.demoBadge,
  });
}

function toStill(row: {
  id: string;
  title: Prisma.JsonValue;
  imageUrl: string;
  sortOrder: number;
  published: boolean;
  demoBadge: boolean;
}): PressStillRecord {
  return persistedStill({
    id: row.id,
    title: asBilingual(row.title),
    imageUrl: row.imageUrl,
    sortOrder: row.sortOrder,
    published: row.published,
    demoBadge: row.demoBadge,
  });
}

function metaWriteData(stored: PressMetaRecord) {
  return {
    copy: stored.copy as Prisma.InputJsonValue,
    zipUrl: stored.zipUrl,
    contactEmail: stored.contactEmail,
    facts: stored.facts as Prisma.InputJsonValue,
    palette: stored.palette as Prisma.InputJsonValue,
    assets: stored.assets as Prisma.InputJsonValue,
    spokespersonMemberId: stored.spokespersonMemberId ?? null,
  };
}

export function createPrismaPressStore(prisma: PrismaClient): PressStore {
  return {
    async getMeta() {
      try {
        const row = await prisma.pressMeta.findUnique({ where: { id: PRESS_META_ID } });
        if (row) return toMeta(row);
        const stored = persistedMeta(DEFAULT_PRESS_META);
        const created = await prisma.pressMeta.upsert({
          where: { id: PRESS_META_ID },
          create: { id: PRESS_META_ID, ...metaWriteData(stored) },
          update: metaWriteData(stored),
        });
        return toMeta(created);
      } catch (err) {
        if (isMissingTableError(err)) return persistedMeta(DEFAULT_PRESS_META);
        throw err;
      }
    },
    async upsertMeta(input) {
      const stored = persistedMeta(input);
      const row = await prisma.pressMeta.upsert({
        where: { id: PRESS_META_ID },
        create: { id: PRESS_META_ID, ...metaWriteData(stored) },
        update: metaWriteData(stored),
      });
      return toMeta(row);
    },
    async listNews() {
      try {
        const rows = await prisma.pressNews.findMany({
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        });
        return rows.map(toNews);
      } catch (err) {
        if (isMissingTableError(err)) return [];
        throw err;
      }
    },
    async findNewsById(id) {
      const row = await prisma.pressNews.findUnique({ where: { id } });
      return row ? toNews(row) : null;
    },
    async createNews(input: PressNewsWrite) {
      const pending = persistedNews({ id: 'pending', ...input });
      const row = await prisma.pressNews.create({
        data: {
          title: pending.title,
          body: pending.body,
          href: pending.href ?? null,
          sortOrder: pending.sortOrder,
          published: pending.published,
          demoBadge: pending.demoBadge,
        },
      });
      return toNews(row);
    },
    async updateNews(id, patch: PressNewsPatch) {
      const current = await prisma.pressNews.findUnique({ where: { id } });
      if (!current) return null;
      const stored = persistedNews({ ...toNews(current), ...patch, id });
      if (patch.href === '') stored.href = undefined;
      const row = await prisma.pressNews.update({
        where: { id },
        data: {
          title: stored.title,
          body: stored.body,
          href: stored.href ?? null,
          sortOrder: stored.sortOrder,
          published: stored.published,
          demoBadge: stored.demoBadge,
        },
      });
      return toNews(row);
    },
    async deleteNews(id) {
      try {
        await prisma.pressNews.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
    async listStills() {
      try {
        const rows = await prisma.pressStill.findMany({
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        });
        return rows.map(toStill);
      } catch (err) {
        if (isMissingTableError(err)) return [];
        throw err;
      }
    },
    async findStillById(id) {
      const row = await prisma.pressStill.findUnique({ where: { id } });
      return row ? toStill(row) : null;
    },
    async createStill(input: PressStillWrite) {
      const pending = persistedStill({ id: 'pending', ...input });
      const row = await prisma.pressStill.create({
        data: {
          title: pending.title,
          imageUrl: pending.imageUrl,
          sortOrder: pending.sortOrder,
          published: pending.published,
          demoBadge: pending.demoBadge,
        },
      });
      return toStill(row);
    },
    async updateStill(id, patch: PressStillPatch) {
      const current = await prisma.pressStill.findUnique({ where: { id } });
      if (!current) return null;
      const stored = persistedStill({ ...toStill(current), ...patch, id });
      const row = await prisma.pressStill.update({
        where: { id },
        data: {
          title: stored.title,
          imageUrl: stored.imageUrl,
          sortOrder: stored.sortOrder,
          published: stored.published,
          demoBadge: stored.demoBadge,
        },
      });
      return toStill(row);
    },
    async deleteStill(id) {
      try {
        await prisma.pressStill.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
  };
}
