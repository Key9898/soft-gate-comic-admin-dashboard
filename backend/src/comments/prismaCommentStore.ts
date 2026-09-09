import type { Prisma, PrismaClient } from '@prisma/client';
import {
  publicComment,
  readCommentContent,
  readUserSnapshot,
  type CommentRecord,
  type CommentStatus,
  type CommentStore,
  type CommentWrite,
} from './commentStore.js';

function toRecord(row: {
  id: string;
  userId: string;
  user: Prisma.JsonValue;
  webtoonId: string;
  episodeId: string;
  content: Prisma.JsonValue;
  likeCount: number;
  status: CommentStatus;
  createdAt: Date;
}): CommentRecord {
  const user = readUserSnapshot(row.user);
  const content = readCommentContent(row.content);
  return publicComment({
    id: row.id,
    userId: row.userId,
    user: user ?? {
      id: row.userId,
      email: '',
      username: 'unknown',
      displayName: 'Unknown',
      coinBalance: 0,
      status: 'active',
      createdAt: row.createdAt.toISOString(),
    },
    webtoonId: row.webtoonId,
    episodeId: row.episodeId,
    content: content ?? { en: '', mm: '' },
    likeCount: row.likeCount,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  });
}

export function createPrismaCommentStore(prisma: PrismaClient): CommentStore {
  return {
    async list() {
      const rows = await prisma.comment.findMany({ orderBy: { createdAt: 'asc' } });
      return rows.map(toRecord);
    },
    async findById(id) {
      const row = await prisma.comment.findUnique({ where: { id } });
      return row ? toRecord(row) : null;
    },
    async create(input: CommentWrite) {
      const stored = publicComment({
        id: 'pending',
        userId: input.userId,
        user: input.user,
        webtoonId: input.webtoonId,
        episodeId: input.episodeId,
        content: input.content,
        likeCount: input.likeCount ?? 0,
        status: input.status ?? 'visible',
        createdAt: new Date().toISOString(),
      });
      const row = await prisma.comment.create({
        data: {
          userId: stored.userId,
          user: stored.user,
          webtoonId: stored.webtoonId,
          episodeId: stored.episodeId,
          content: stored.content,
          likeCount: stored.likeCount,
          status: stored.status,
        },
      });
      return toRecord(row);
    },
    async updateStatus(id, status: CommentStatus) {
      const current = await prisma.comment.findUnique({ where: { id } });
      if (!current) return null;
      const row = await prisma.comment.update({
        where: { id },
        data: { status },
      });
      return toRecord(row);
    },
  };
}
