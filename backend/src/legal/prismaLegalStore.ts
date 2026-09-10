import type { Prisma, PrismaClient } from '@prisma/client';
import { isMissingTableError } from '../prismaMissingTable.js';
import {
  PRIVACY_META_ID,
  TERMS_META_ID,
  compareLegalSection,
  defaultMetaFor,
  defaultSectionsFor,
  persistedBilingual,
  persistedMeta,
  persistedSection,
  seedSectionsFor,
  type BilingualText,
  type LegalDoc,
  type LegalHeadingLevel,
  type LegalMetaRecord,
  type LegalSectionKind,
  type LegalSectionPatch,
  type LegalSectionRecord,
  type LegalSectionWrite,
  type LegalStore,
} from './legalStore.js';

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

function asGlance(value: Prisma.JsonValue): BilingualText[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const text = asBilingual(item);
    if (!text.en && !text.mm) return [];
    return [text];
  });
}

function asBullets(value: Prisma.JsonValue): BilingualText[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asBilingual(item));
}

function asKind(value: string): LegalSectionKind {
  if (value === 'bullets' || value === 'privacy-rights') return value;
  return 'body';
}

function asHeading(value: string): LegalHeadingLevel {
  return value === 'h3' ? 'h3' : 'h2';
}

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function fromIsoDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return new Date(`${value}T12:00:00.000Z`);
  return new Date(`${match[1]}-${match[2]}-${match[3]}T12:00:00.000Z`);
}

function toMeta(row: {
  seoDesc: Prisma.JsonValue;
  glance: Prisma.JsonValue;
  effectiveDate: Date;
}): LegalMetaRecord {
  return persistedMeta({
    seoDesc: asBilingual(row.seoDesc),
    glance: asGlance(row.glance),
    effectiveDate: toIsoDate(row.effectiveDate),
  });
}

function toSection(row: {
  id: string;
  slug: string;
  kind: string;
  headingLevel: string;
  title: Prisma.JsonValue;
  body: Prisma.JsonValue;
  bullets: Prisma.JsonValue;
  sortOrder: number;
  published: boolean;
}): LegalSectionRecord {
  return persistedSection({
    id: row.id,
    slug: row.slug,
    kind: asKind(row.kind),
    headingLevel: asHeading(row.headingLevel),
    title: asBilingual(row.title),
    body: asBilingual(row.body),
    bullets: asBullets(row.bullets),
    sortOrder: row.sortOrder,
    published: row.published,
  });
}

function metaWriteData(stored: LegalMetaRecord) {
  return {
    seoDesc: persistedBilingual(stored.seoDesc) as Prisma.InputJsonValue,
    glance: stored.glance.map(persistedBilingual) as Prisma.InputJsonValue,
    effectiveDate: fromIsoDate(stored.effectiveDate),
  };
}

function sectionWriteData(stored: LegalSectionRecord) {
  return {
    slug: stored.slug,
    kind: stored.kind,
    headingLevel: stored.headingLevel,
    title: persistedBilingual(stored.title) as Prisma.InputJsonValue,
    body: persistedBilingual(stored.body) as Prisma.InputJsonValue,
    bullets: stored.bullets.map(persistedBilingual) as Prisma.InputJsonValue,
    sortOrder: stored.sortOrder,
    published: stored.published,
  };
}

type MetaDelegate = {
  findUnique: (args: { where: { id: string } }) => Promise<{
    seoDesc: Prisma.JsonValue;
    glance: Prisma.JsonValue;
    effectiveDate: Date;
  } | null>;
  upsert: (args: {
    where: { id: string };
    create: {
      id: string;
      seoDesc: Prisma.InputJsonValue;
      glance: Prisma.InputJsonValue;
      effectiveDate: Date;
    };
    update: {
      seoDesc: Prisma.InputJsonValue;
      glance: Prisma.InputJsonValue;
      effectiveDate: Date;
    };
  }) => Promise<{
    seoDesc: Prisma.JsonValue;
    glance: Prisma.JsonValue;
    effectiveDate: Date;
  }>;
};

type SectionRow = {
  id: string;
  slug: string;
  kind: string;
  headingLevel: string;
  title: Prisma.JsonValue;
  body: Prisma.JsonValue;
  bullets: Prisma.JsonValue;
  sortOrder: number;
  published: boolean;
};

type SectionDelegate = {
  findMany: (args: {
    orderBy: Array<{ sortOrder: 'asc' } | { id: 'asc' }>;
  }) => Promise<SectionRow[]>;
  findUnique: (args: { where: { id: string } }) => Promise<SectionRow | null>;
  create: (args: {
    data: {
      slug: string;
      kind: string;
      headingLevel: string;
      title: Prisma.InputJsonValue;
      body: Prisma.InputJsonValue;
      bullets: Prisma.InputJsonValue;
      sortOrder: number;
      published: boolean;
    };
  }) => Promise<SectionRow>;
  createMany: (args: {
    data: Array<{
      slug: string;
      kind: string;
      headingLevel: string;
      title: Prisma.InputJsonValue;
      body: Prisma.InputJsonValue;
      bullets: Prisma.InputJsonValue;
      sortOrder: number;
      published: boolean;
    }>;
  }) => Promise<unknown>;
  update: (args: {
    where: { id: string };
    data: {
      slug: string;
      kind: string;
      headingLevel: string;
      title: Prisma.InputJsonValue;
      body: Prisma.InputJsonValue;
      bullets: Prisma.InputJsonValue;
      sortOrder: number;
      published: boolean;
    };
  }) => Promise<SectionRow>;
  delete: (args: { where: { id: string } }) => Promise<unknown>;
};

function delegates(
  prisma: PrismaClient,
  doc: LegalDoc,
): { id: string; meta: MetaDelegate; sections: SectionDelegate } {
  if (doc === 'privacy') {
    return {
      id: PRIVACY_META_ID,
      meta: prisma.privacyMeta as unknown as MetaDelegate,
      sections: prisma.privacySection as unknown as SectionDelegate,
    };
  }
  return {
    id: TERMS_META_ID,
    meta: prisma.termsMeta as unknown as MetaDelegate,
    sections: prisma.termsSection as unknown as SectionDelegate,
  };
}

export function createPrismaLegalStore(prisma: PrismaClient): LegalStore {
  return {
    async getMeta(doc) {
      const { id, meta } = delegates(prisma, doc);
      try {
        const row = await meta.findUnique({ where: { id } });
        if (row) return toMeta(row);
        const stored = defaultMetaFor(doc);
        const created = await meta.upsert({
          where: { id },
          create: { id, ...metaWriteData(stored) },
          update: metaWriteData(stored),
        });
        return toMeta(created);
      } catch (err) {
        if (isMissingTableError(err)) return defaultMetaFor(doc);
        throw err;
      }
    },
    async upsertMeta(doc, input) {
      const { id, meta } = delegates(prisma, doc);
      const stored = persistedMeta(input);
      const row = await meta.upsert({
        where: { id },
        create: { id, ...metaWriteData(stored) },
        update: metaWriteData(stored),
      });
      return toMeta(row);
    },
    async listSections(doc) {
      const { sections } = delegates(prisma, doc);
      try {
        const rows = await sections.findMany({
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        });
        if (rows.length > 0) return rows.map(toSection).sort(compareLegalSection);
        await sections.createMany({
          data: defaultSectionsFor(doc).map((row) => ({
            slug: row.slug,
            kind: row.kind,
            headingLevel: row.headingLevel,
            title: persistedBilingual(row.title) as Prisma.InputJsonValue,
            body: persistedBilingual(row.body) as Prisma.InputJsonValue,
            bullets: row.bullets.map(persistedBilingual) as Prisma.InputJsonValue,
            sortOrder: row.sortOrder,
            published: row.published,
          })),
        });
        const seeded = await sections.findMany({
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        });
        return seeded.map(toSection).sort(compareLegalSection);
      } catch (err) {
        if (isMissingTableError(err)) return seedSectionsFor(doc);
        throw err;
      }
    },
    async findSectionById(doc, id) {
      const { sections } = delegates(prisma, doc);
      const row = await sections.findUnique({ where: { id } });
      return row ? toSection(row) : null;
    },
    async createSection(doc, input: LegalSectionWrite) {
      const { sections } = delegates(prisma, doc);
      const pending = persistedSection({ id: 'pending', ...input });
      const row = await sections.create({ data: sectionWriteData(pending) });
      return toSection(row);
    },
    async updateSection(doc, id, patch: LegalSectionPatch) {
      const { sections } = delegates(prisma, doc);
      const current = await sections.findUnique({ where: { id } });
      if (!current) return null;
      const stored = persistedSection({ ...toSection(current), ...patch, id });
      const row = await sections.update({
        where: { id },
        data: sectionWriteData(stored),
      });
      return toSection(row);
    },
    async deleteSection(doc, id) {
      const { sections } = delegates(prisma, doc);
      try {
        await sections.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
  };
}
