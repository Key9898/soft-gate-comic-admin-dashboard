import { randomUUID } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';
import {
  publicComment,
  type CommentRecord,
  type CommentStore,
  type CommentWrite,
} from './commentStore.js';

function toRecord(row: {
  id: string;
  episodeKey: string;
  userId: string;
  content: string;
  parentId: string | null;
  spoiler: boolean;
  reported: boolean;
  isEdited: boolean;
  createdAt: Date;
}): CommentRecord {
  return publicComment({
    id: row.id,
    episodeKey: row.episodeKey,
    userId: row.userId,
    content: row.content,
    parentId: row.parentId ?? undefined,
    spoiler: row.spoiler,
    reported: row.reported,
    isEdited: row.isEdited,
    createdAt: row.createdAt.toISOString(),
  });
}

export function createPrismaCommentStore(prisma: PrismaClient): CommentStore {
  return {
    async list(filter) {
      const rows = await prisma.readerComment.findMany({
        where: filter?.reported === undefined ? undefined : { reported: filter.reported },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      });
      return rows.map(toRecord);
    },
    async findById(id) {
      const row = await prisma.readerComment.findUnique({ where: { id } });
      return row ? toRecord(row) : null;
    },
    async create(input: CommentWrite) {
      const stored = publicComment({
        id: input.id ?? randomUUID(),
        episodeKey: input.episodeKey,
        userId: input.userId,
        content: input.content,
        parentId: input.parentId,
        spoiler: input.spoiler ?? false,
        reported: input.reported ?? false,
        isEdited: input.isEdited ?? false,
        createdAt: input.createdAt ?? new Date().toISOString(),
      });
      const row = await prisma.readerComment.create({
        data: {
          id: stored.id,
          episodeKey: stored.episodeKey,
          userId: stored.userId,
          content: stored.content,
          parentId: stored.parentId ?? null,
          spoiler: stored.spoiler,
          reported: stored.reported,
          isEdited: stored.isEdited,
          createdAt: new Date(stored.createdAt),
        },
      });
      return toRecord(row);
    },
    async updateReported(id, reported) {
      const current = await prisma.readerComment.findUnique({ where: { id } });
      if (!current) return null;
      const row = await prisma.readerComment.update({
        where: { id },
        data: { reported },
      });
      return toRecord(row);
    },
    async delete(id) {
      const current = await prisma.readerComment.findUnique({ where: { id } });
      if (!current) return false;
      await prisma.readerComment.delete({ where: { id } });
      return true;
    },
  };
}
