import { randomUUID } from 'node:crypto';
import {
  publicComment,
  type CommentRecord,
  type CommentStatus,
  type CommentStore,
  type CommentWrite,
} from './commentStore.js';

export function createMemoryCommentStore(): CommentStore {
  const rows = new Map<string, CommentRecord>();

  return {
    async list() {
      return [...rows.values()]
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))
        .map(publicComment);
    },
    async findById(id) {
      const row = rows.get(id);
      return row ? publicComment(row) : null;
    },
    async create(input: CommentWrite) {
      const row = publicComment({
        id: randomUUID(),
        userId: input.userId,
        user: input.user,
        webtoonId: input.webtoonId,
        episodeId: input.episodeId,
        content: input.content,
        likeCount: input.likeCount ?? 0,
        status: input.status ?? 'visible',
        createdAt: new Date().toISOString(),
      });
      rows.set(row.id, row);
      return publicComment(row);
    },
    async updateStatus(id, status: CommentStatus) {
      const current = rows.get(id);
      if (!current) return null;
      const row = publicComment({ ...current, status });
      rows.set(id, row);
      return publicComment(row);
    },
  };
}
