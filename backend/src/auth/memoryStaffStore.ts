import { randomUUID } from 'node:crypto';
import type { StaffInviteRecord, StaffStore, StaffUserRecord } from './staffStore.js';

export function createMemoryStaffStore(): StaffStore {
  const users = new Map<string, StaffUserRecord>();
  const invites = new Map<string, StaffInviteRecord>();

  return {
    async countUsers() {
      return users.size;
    },
    async findUserById(id) {
      return users.get(id) ?? null;
    },
    async findUserByEmail(email) {
      const normalized = email.toLowerCase();
      for (const user of users.values()) {
        if (user.email === normalized) return user;
      }
      return null;
    },
    async listUsers() {
      return [...users.values()];
    },
    async createUser(input) {
      const user: StaffUserRecord = {
        ...input,
        email: input.email.toLowerCase(),
        createdAt: new Date(),
      };
      users.set(user.id, user);
      return user;
    },
    async deleteUser(id) {
      return users.delete(id);
    },
    async createInvite(input) {
      const invite: StaffInviteRecord = {
        ...input,
        email: input.email.toLowerCase(),
        status: 'pending',
        createdAt: new Date(),
      };
      invites.set(invite.id, invite);
      return invite;
    },
    async findInviteById(id) {
      return invites.get(id) ?? null;
    },
    async findInviteByTokenHash(tokenHash) {
      for (const invite of invites.values()) {
        if (invite.tokenHash === tokenHash) return invite;
      }
      return null;
    },
    async listInvites() {
      return [...invites.values()];
    },
    async updateInvite(id, patch) {
      const current = invites.get(id);
      if (!current) return null;
      const next = { ...current, ...patch };
      invites.set(id, next);
      return next;
    },
  };
}

export function newId(): string {
  return randomUUID();
}
