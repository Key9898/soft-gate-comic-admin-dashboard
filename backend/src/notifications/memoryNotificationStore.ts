import { randomUUID } from 'node:crypto';
import {
  publicNotification,
  type NotificationRecord,
  type NotificationStore,
  type NotificationWrite,
} from './notificationStore.js';

export function createMemoryNotificationStore(): NotificationStore {
  const rows = new Map<string, NotificationRecord>();

  return {
    async list() {
      return [...rows.values()]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))
        .map(publicNotification);
    },
    async findById(id) {
      const row = rows.get(id);
      return row ? publicNotification(row) : null;
    },
    async create(input: NotificationWrite) {
      const existing = [...rows.values()].map((row) => Date.parse(row.createdAt));
      const latest = existing.length > 0 ? Math.max(...existing) : 0;
      const createdAt = new Date(Math.max(Date.now(), latest + 1)).toISOString();
      const row = publicNotification({
        id: randomUUID(),
        type: input.type,
        title: input.title,
        message: input.message,
        isRead: input.isRead ?? false,
        createdAt,
        actionUrl: input.actionUrl,
      });
      rows.set(row.id, row);
      return publicNotification(row);
    },
    async markRead(id) {
      const current = rows.get(id);
      if (!current) return null;
      const row = publicNotification({ ...current, isRead: true });
      rows.set(id, row);
      return publicNotification(row);
    },
    async markAllRead() {
      for (const [id, current] of rows) {
        rows.set(id, publicNotification({ ...current, isRead: true }));
      }
    },
    async delete(id) {
      return rows.delete(id);
    },
  };
}
