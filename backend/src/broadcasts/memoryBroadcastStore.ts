import { randomUUID } from 'node:crypto';
import {
  publicBroadcast,
  type ReaderBroadcastCounts,
  type ReaderBroadcastRecord,
  type ReaderBroadcastStore,
  type ReaderBroadcastWrite,
} from './broadcastStore.js';

export function createMemoryBroadcastStore(): ReaderBroadcastStore {
  const rows = new Map<string, ReaderBroadcastRecord>();

  return {
    async list() {
      return [...rows.values()]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))
        .map(publicBroadcast);
    },
    async findById(id) {
      const row = rows.get(id);
      return row ? publicBroadcast(row) : null;
    },
    async createSending(input: ReaderBroadcastWrite) {
      const existing = [...rows.values()].map((row) => Date.parse(row.createdAt));
      const latest = existing.length > 0 ? Math.max(...existing) : 0;
      const createdAt = new Date(Math.max(Date.now(), latest + 1)).toISOString();
      const row = publicBroadcast({
        id: input.id ?? randomUUID(),
        type: input.type,
        title: input.title,
        message: input.message,
        href: input.href,
        audience: input.audience,
        readerIds: input.readerIds,
        status: 'sending',
        createdById: input.createdById,
        inboxCount: 0,
        emailed: 0,
        pushed: 0,
        skippedPref: 0,
        createdAt,
      });
      rows.set(row.id, row);
      return publicBroadcast(row);
    },
    async markSent(id: string, counts: ReaderBroadcastCounts) {
      const current = rows.get(id);
      if (!current) return null;
      const row = publicBroadcast({
        ...current,
        status: 'sent',
        inboxCount: counts.inboxCount,
        emailed: counts.emailed,
        pushed: counts.pushed,
        skippedPref: counts.skippedPref,
      });
      delete row.failureReason;
      rows.set(id, row);
      return publicBroadcast(row);
    },
    async markFailed(id: string, reason: string) {
      const current = rows.get(id);
      if (!current) return null;
      const row = publicBroadcast({
        ...current,
        status: 'failed',
        failureReason: reason,
      });
      rows.set(id, row);
      return publicBroadcast(row);
    },
  };
}
