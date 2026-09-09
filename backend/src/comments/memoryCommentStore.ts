import { randomUUID } from 'node:crypto';
import {
  publicComment,
  type CommentRecord,
  type CommentStore,
  type CommentWrite,
} from './commentStore.js';

export function createMemoryCommentStore(): CommentStore {
  const rows = new Map<string, CommentRecord>();

  return {
    async list(filter) {
      return [...rows.values()]
        .filter((row) => (filter?.reported === undefined ? true : row.reported === filter.reported))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id))
        .map(publicComment);
    },
    async findById(id) {
      const row = rows.get(id);
      return row ? publicComment(row) : null;
    },
    async create(input: CommentWrite) {
      const row = publicComment({
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
      rows.set(row.id, row);
      return publicComment(row);
    },
    async updateReported(id, reported) {
      const current = rows.get(id);
      if (!current) return null;
      const row = publicComment({ ...current, reported });
      rows.set(id, row);
      return publicComment(row);
    },
    async delete(id) {
      return rows.delete(id);
    },
  };
}
