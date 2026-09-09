import { randomUUID } from 'node:crypto';
import {
  EmailTakenError,
  publicUser,
  type ReaderUserProfilePatch,
  type ReaderUserRecord,
  type ReaderUserStore,
  type ReaderUserWrite,
} from './readerUserStore.js';

export { EmailTakenError };

type Stored = ReaderUserRecord & { passwordHash: string };

export function createMemoryReaderUserStore(): ReaderUserStore {
  const rows = new Map<string, Stored>();

  return {
    async list() {
      return [...rows.values()]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id))
        .map(publicUser);
    },
    async findById(id) {
      const row = rows.get(id);
      return row ? publicUser(row) : null;
    },
    async create(input: ReaderUserWrite) {
      const email = input.email.trim().toLowerCase();
      for (const row of rows.values()) {
        if (row.email === email) throw new EmailTakenError();
      }
      const stored: Stored = {
        id: input.id ?? randomUUID(),
        email,
        username: input.username,
        displayName: input.displayName,
        avatar: input.avatar,
        bio: input.bio ?? '',
        passwordHash: input.passwordHash ?? 'x',
        createdAt: input.createdAt ?? new Date().toISOString(),
        lastLoginAt: input.lastLoginAt,
        coinBalance: input.coinBalance ?? 0,
      };
      rows.set(stored.id, stored);
      return publicUser(stored);
    },
    async updateProfile(id, patch: ReaderUserProfilePatch) {
      const current = rows.get(id);
      if (!current) return null;
      let email = current.email;
      if (patch.email !== undefined) {
        email = patch.email.trim().toLowerCase();
        for (const row of rows.values()) {
          if (row.id !== id && row.email === email) throw new EmailTakenError();
        }
      }
      const next: Stored = {
        ...current,
        email,
        displayName: patch.displayName ?? current.displayName,
        bio: patch.bio ?? current.bio,
        avatar: patch.avatar === undefined ? current.avatar : (patch.avatar ?? undefined),
      };
      rows.set(id, next);
      return publicUser(next);
    },
    async delete(id) {
      return rows.delete(id);
    },
  };
}
