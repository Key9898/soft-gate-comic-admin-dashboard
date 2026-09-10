import type { Prisma, PrismaClient } from '@prisma/client';
import {
  ABOUT_TEAM_META_ID,
  DEFAULT_ABOUT_TEAM_META,
  persistedMember,
  publicMeta,
  type AboutTeamMemberPatch,
  type AboutTeamMemberRecord,
  type AboutTeamMemberWrite,
  type AboutTeamMetaRecord,
  type AboutTeamStore,
  type BilingualText,
} from './aboutTeamStore.js';

function asBilingual(value: Prisma.JsonValue): BilingualText {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const row = value as { en?: unknown; mm?: unknown };
    return {
      en: typeof row.en === 'string' ? row.en : '',
      mm: typeof row.mm === 'string' ? row.mm : '',
    };
  }
  return { en: '', mm: '' };
}

function toMember(row: {
  id: string;
  name: Prisma.JsonValue;
  role: Prisma.JsonValue;
  photoUrl: string | null;
  sortOrder: number;
  published: boolean;
}): AboutTeamMemberRecord {
  return persistedMember({
    id: row.id,
    name: asBilingual(row.name),
    role: asBilingual(row.role),
    photoUrl: row.photoUrl ?? undefined,
    sortOrder: row.sortOrder,
    published: row.published,
  });
}

function toMeta(row: {
  deck: Prisma.JsonValue;
  standInNote: Prisma.JsonValue;
  standInVisible: boolean;
}): AboutTeamMetaRecord {
  return publicMeta({
    deck: asBilingual(row.deck),
    standInNote: asBilingual(row.standInNote),
    standInVisible: row.standInVisible,
  });
}

export function createPrismaAboutTeamStore(prisma: PrismaClient): AboutTeamStore {
  return {
    async list() {
      const rows = await prisma.aboutTeamMember.findMany({
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      });
      return rows.map(toMember);
    },
    async findById(id) {
      const row = await prisma.aboutTeamMember.findUnique({ where: { id } });
      return row ? toMember(row) : null;
    },
    async create(input: AboutTeamMemberWrite) {
      const pending = persistedMember({ id: 'pending', ...input });
      const row = await prisma.aboutTeamMember.create({
        data: {
          name: pending.name,
          role: pending.role,
          photoUrl: pending.photoUrl ?? null,
          sortOrder: pending.sortOrder,
          published: pending.published,
        },
      });
      return toMember(row);
    },
    async update(id, patch: AboutTeamMemberPatch) {
      const current = await prisma.aboutTeamMember.findUnique({ where: { id } });
      if (!current) return null;
      const stored = persistedMember({ ...toMember(current), ...patch, id });
      if (patch.photoUrl === '') stored.photoUrl = undefined;
      const row = await prisma.aboutTeamMember.update({
        where: { id },
        data: {
          name: stored.name,
          role: stored.role,
          photoUrl: stored.photoUrl ?? null,
          sortOrder: stored.sortOrder,
          published: stored.published,
        },
      });
      return toMember(row);
    },
    async delete(id) {
      try {
        await prisma.aboutTeamMember.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
    async getMeta() {
      const row = await prisma.aboutTeamMeta.findUnique({
        where: { id: ABOUT_TEAM_META_ID },
      });
      return row ? toMeta(row) : publicMeta(DEFAULT_ABOUT_TEAM_META);
    },
    async upsertMeta(input: AboutTeamMetaRecord) {
      const stored = publicMeta(input);
      const row = await prisma.aboutTeamMeta.upsert({
        where: { id: ABOUT_TEAM_META_ID },
        create: {
          id: ABOUT_TEAM_META_ID,
          deck: stored.deck,
          standInNote: stored.standInNote,
          standInVisible: stored.standInVisible,
        },
        update: {
          deck: stored.deck,
          standInNote: stored.standInNote,
          standInVisible: stored.standInVisible,
        },
      });
      return toMeta(row);
    },
  };
}
