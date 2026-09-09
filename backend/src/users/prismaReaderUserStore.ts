import { Prisma, type PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import {
  EmailTakenError,
  publicUser,
  type ReaderUserProfilePatch,
  type ReaderUserRecord,
  type ReaderUserStore,
  type ReaderUserWrite,
} from './readerUserStore.js';

function toRecord(row: {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string;
  createdAt: Date;
  lastLoginAt: Date | null;
  wallet: { balance: number } | null;
}): ReaderUserRecord {
  return publicUser({
    id: row.id,
    email: row.email,
    username: row.username,
    displayName: row.displayName,
    avatar: row.avatar ?? undefined,
    bio: row.bio,
    createdAt: row.createdAt.toISOString(),
    lastLoginAt: row.lastLoginAt?.toISOString(),
    coinBalance: row.wallet?.balance ?? 0,
  });
}

export function createPrismaReaderUserStore(prisma: PrismaClient): ReaderUserStore {
  return {
    async list() {
      const rows = await prisma.readerUser.findMany({
        include: { wallet: true },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      });
      return rows.map(toRecord);
    },
    async findById(id) {
      const row = await prisma.readerUser.findUnique({
        where: { id },
        include: { wallet: true },
      });
      return row ? toRecord(row) : null;
    },
    async create(input: ReaderUserWrite) {
      const email = input.email.trim().toLowerCase();
      try {
        const row = await prisma.readerUser.create({
          data: {
            id: input.id ?? randomUUID(),
            email,
            username: input.username,
            displayName: input.displayName,
            avatar: input.avatar ?? null,
            bio: input.bio ?? '',
            passwordHash: input.passwordHash ?? 'x',
            createdAt: input.createdAt ? new Date(input.createdAt) : new Date(),
            lastLoginAt: input.lastLoginAt ? new Date(input.lastLoginAt) : null,
          },
          include: { wallet: true },
        });
        return toRecord(row);
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new EmailTakenError();
        }
        throw error;
      }
    },
    async updateProfile(id, patch: ReaderUserProfilePatch) {
      const current = await prisma.readerUser.findUnique({ where: { id } });
      if (!current) return null;
      const data: Prisma.ReaderUserUpdateInput = {};
      if (patch.displayName !== undefined) data.displayName = patch.displayName;
      if (patch.bio !== undefined) data.bio = patch.bio;
      if (patch.avatar !== undefined) data.avatar = patch.avatar;
      if (patch.email !== undefined) {
        const nextEmail = patch.email.trim().toLowerCase();
        if (nextEmail !== current.email) {
          const taken = await prisma.readerUser.findFirst({
            where: { email: nextEmail, NOT: { id } },
          });
          if (taken) throw new EmailTakenError();
          data.email = nextEmail;
        }
      }
      try {
        const row = await prisma.readerUser.update({
          where: { id },
          data,
          include: { wallet: true },
        });
        return toRecord(row);
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new EmailTakenError();
        }
        throw error;
      }
    },
    async delete(id) {
      const current = await prisma.readerUser.findUnique({ where: { id } });
      if (!current) return false;
      const own = await prisma.readerComment.findMany({
        where: { userId: id },
        select: { id: true },
      });
      const ownIds = own.map((row) => row.id);
      await prisma.$transaction([
        prisma.readerCommentLike.deleteMany({
          where: { OR: [{ userId: id }, { commentId: { in: ownIds } }] },
        }),
        prisma.readerComment.deleteMany({
          where: { OR: [{ userId: id }, { parentId: { in: ownIds } }] },
        }),
        prisma.readerPasswordReset.deleteMany({ where: { userId: id } }),
        prisma.readerNotification.deleteMany({ where: { userId: id } }),
        prisma.readerPushSubscription.deleteMany({ where: { userId: id } }),
        prisma.readerUserPrefs.deleteMany({ where: { userId: id } }),
        prisma.libraryLike.deleteMany({ where: { userId: id } }),
        prisma.libraryHistory.deleteMany({ where: { userId: id } }),
        prisma.librarySubscribe.deleteMany({ where: { userId: id } }),
        prisma.walletUnlock.deleteMany({ where: { userId: id } }),
        prisma.walletTransaction.deleteMany({ where: { userId: id } }),
        prisma.refreshToken.deleteMany({ where: { userId: id } }),
        prisma.wallet.deleteMany({ where: { userId: id } }),
        prisma.readerUser.deleteMany({ where: { id } }),
      ]);
      return true;
    },
  };
}
