import { randomUUID } from 'node:crypto';
import {
  DEFAULT_ABOUT_TEAM_META,
  compareMember,
  persistedMember,
  publicMeta,
  type AboutTeamMemberPatch,
  type AboutTeamMemberRecord,
  type AboutTeamMemberWrite,
  type AboutTeamMetaRecord,
  type AboutTeamStore,
} from './aboutTeamStore.js';

export function createMemoryAboutTeamStore(): AboutTeamStore {
  const rows = new Map<string, AboutTeamMemberRecord>();
  let meta: AboutTeamMetaRecord | null = null;

  return {
    async list() {
      return [...rows.values()].map(persistedMember).sort(compareMember);
    },
    async findById(id) {
      const row = rows.get(id);
      return row ? persistedMember(row) : null;
    },
    async create(input: AboutTeamMemberWrite) {
      const row = persistedMember({ id: randomUUID(), ...input });
      rows.set(row.id, row);
      return persistedMember(row);
    },
    async update(id, patch: AboutTeamMemberPatch) {
      const current = rows.get(id);
      if (!current) return null;
      const merged = { ...current, ...patch, id };
      if (patch.photoUrl === '') merged.photoUrl = undefined;
      const row = persistedMember(merged);
      rows.set(id, row);
      return persistedMember(row);
    },
    async delete(id) {
      return rows.delete(id);
    },
    async getMeta() {
      return publicMeta(meta ?? DEFAULT_ABOUT_TEAM_META);
    },
    async upsertMeta(input: AboutTeamMetaRecord) {
      meta = publicMeta(input);
      return publicMeta(meta);
    },
  };
}
