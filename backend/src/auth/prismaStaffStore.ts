import type { PrismaClient } from '@prisma/client';
import type {
  StaffInviteRecord,
  StaffPasswordResetRecord,
  StaffStore,
  StaffUserRecord,
} from './staffStore.js';

function toUser(row: {
  id: string;
  email: string;
  displayName: string;
  role: StaffUserRecord['role'];
  passwordHash: string;
  totpEnabled: boolean;
  totpSecret: string | null;
  totpBackupHashes: string[];
  createdAt: Date;
}): StaffUserRecord {
  return row;
}

function toInvite(row: {
  id: string;
  email: string;
  role: StaffInviteRecord['role'];
  tokenHash: string;
  status: StaffInviteRecord['status'];
  inviterId: string;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt: Date | null;
}): StaffInviteRecord {
  return {
    ...row,
    acceptedAt: row.acceptedAt ?? undefined,
  };
}

function toReset(row: {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
}): StaffPasswordResetRecord {
  return {
    ...row,
    consumedAt: row.consumedAt ?? undefined,
  };
}

export function createPrismaStaffStore(prisma: PrismaClient): StaffStore {
  return {
    async countUsers() {
      return prisma.staffUser.count();
    },
    async findUserById(id) {
      const row = await prisma.staffUser.findUnique({ where: { id } });
      return row ? toUser(row) : null;
    },
    async findUserByEmail(email) {
      const row = await prisma.staffUser.findUnique({ where: { email: email.toLowerCase() } });
      return row ? toUser(row) : null;
    },
    async listUsers() {
      const rows = await prisma.staffUser.findMany({ orderBy: { createdAt: 'asc' } });
      return rows.map(toUser);
    },
    async createUser(input) {
      const row = await prisma.staffUser.create({
        data: {
          id: input.id,
          email: input.email.toLowerCase(),
          displayName: input.displayName,
          role: input.role,
          passwordHash: input.passwordHash,
        },
      });
      return toUser(row);
    },
    async updateUser(id, patch) {
      try {
        const row = await prisma.staffUser.update({
          where: { id },
          data: patch,
        });
        return toUser(row);
      } catch {
        return null;
      }
    },
    async deleteUser(id) {
      try {
        await prisma.staffUser.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
    async createInvite(input) {
      const row = await prisma.staffInvite.create({
        data: {
          id: input.id,
          email: input.email.toLowerCase(),
          role: input.role,
          tokenHash: input.tokenHash,
          inviterId: input.inviterId,
          expiresAt: input.expiresAt,
        },
      });
      return toInvite(row);
    },
    async findInviteById(id) {
      const row = await prisma.staffInvite.findUnique({ where: { id } });
      return row ? toInvite(row) : null;
    },
    async findInviteByTokenHash(tokenHash) {
      const row = await prisma.staffInvite.findFirst({ where: { tokenHash } });
      return row ? toInvite(row) : null;
    },
    async listInvites() {
      const rows = await prisma.staffInvite.findMany({ orderBy: { createdAt: 'desc' } });
      return rows.map(toInvite);
    },
    async updateInvite(id, patch) {
      try {
        const row = await prisma.staffInvite.update({
          where: { id },
          data: patch,
        });
        return toInvite(row);
      } catch {
        return null;
      }
    },
    async createPasswordReset(input) {
      const row = await prisma.staffPasswordReset.create({
        data: {
          id: input.id,
          userId: input.userId,
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
        },
      });
      return toReset(row);
    },
    async findPasswordResetByTokenHash(tokenHash) {
      const row = await prisma.staffPasswordReset.findUnique({ where: { tokenHash } });
      return row ? toReset(row) : null;
    },
    async consumePasswordReset(id) {
      try {
        const row = await prisma.staffPasswordReset.update({
          where: { id },
          data: { consumedAt: new Date() },
        });
        return toReset(row);
      } catch {
        return null;
      }
    },
  };
}
