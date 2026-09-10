import { randomUUID } from 'node:crypto';
import {
  compareLegalSection,
  defaultMetaFor,
  persistedMeta,
  persistedSection,
  seedSectionsFor,
  type LegalDoc,
  type LegalMetaRecord,
  type LegalSectionPatch,
  type LegalSectionRecord,
  type LegalSectionWrite,
  type LegalStore,
} from './legalStore.js';

export function createMemoryLegalStore(): LegalStore {
  const meta = new Map<LegalDoc, LegalMetaRecord>();
  const sections = new Map<LegalDoc, Map<string, LegalSectionRecord>>([
    ['privacy', new Map()],
    ['terms', new Map()],
  ]);

  const sectionMap = (doc: LegalDoc) => {
    const current = sections.get(doc);
    if (current) return current;
    const next = new Map<string, LegalSectionRecord>();
    sections.set(doc, next);
    return next;
  };

  const seedDocSections = (doc: LegalDoc) => {
    const map = sectionMap(doc);
    if (map.size > 0) return;
    for (const row of seedSectionsFor(doc)) {
      map.set(row.id, persistedSection(row));
    }
  };

  return {
    async getMeta(doc) {
      const current = meta.get(doc);
      if (current) return persistedMeta(current);
      const seeded = defaultMetaFor(doc);
      meta.set(doc, seeded);
      return persistedMeta(seeded);
    },
    async upsertMeta(doc, input) {
      const stored = persistedMeta(input);
      meta.set(doc, stored);
      return persistedMeta(stored);
    },
    async listSections(doc) {
      seedDocSections(doc);
      return [...sectionMap(doc).values()].map(persistedSection).sort(compareLegalSection);
    },
    async findSectionById(doc, id) {
      const row = sectionMap(doc).get(id);
      return row ? persistedSection(row) : null;
    },
    async createSection(doc, input: LegalSectionWrite) {
      seedDocSections(doc);
      const row = persistedSection({ id: randomUUID(), ...input });
      sectionMap(doc).set(row.id, row);
      return persistedSection(row);
    },
    async updateSection(doc, id, patch: LegalSectionPatch) {
      const map = sectionMap(doc);
      const current = map.get(id);
      if (!current) return null;
      const row = persistedSection({ ...current, ...patch, id });
      map.set(id, row);
      return persistedSection(row);
    },
    async deleteSection(doc, id) {
      return sectionMap(doc).delete(id);
    },
  };
}
