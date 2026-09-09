import type { Prisma, PrismaClient } from '@prisma/client';
import {
  isStaffNotificationType,
  publicNotification,
  readBilingual,
  type NotificationRecord,
  type NotificationStore,
  type NotificationWrite,
  type StaffNotificationType,
} from './notificationStore.js';

function toRecord(row: {
  id: string;
  type: StaffNotificationType;
  title: Prisma.JsonValue;
  message: Prisma.JsonValue;
  isRead: boolean;
  createdAt: Date;
  actionUrl: string | null;
}): NotificationRecord {
  const title = readBilingual(row.title);
  const message = readBilingual(row.message);
  return publicNotification({
    id: row.id,
    type: isStaffNotificationType(row.type) ? row.type : 'system',
    title: title ?? { en: '', mm: '' },
    message: message ?? { en: '', mm: '' },
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
    actionUrl: row.actionUrl ?? undefined,
  });
}

export function createPrismaNotificationStore(prisma: PrismaClient): NotificationStore {
  return {
    async list() {
      const rows = await prisma.staffNotification.findMany({
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      });
      return rows.map(toRecord);
    },
    async findById(id) {
      const row = await prisma.staffNotification.findUnique({ where: { id } });
      return row ? toRecord(row) : null;
    },
    async create(input: NotificationWrite) {
      const stored = publicNotification({
        id: 'pending',
        type: input.type,
        title: input.title,
        message: input.message,
        isRead: input.isRead ?? false,
        createdAt: new Date().toISOString(),
        actionUrl: input.actionUrl,
      });
      const row = await prisma.staffNotification.create({
        data: {
          type: stored.type,
          title: stored.title,
          message: stored.message,
          isRead: stored.isRead,
          actionUrl: stored.actionUrl ?? null,
        },
      });
      return toRecord(row);
    },
    async markRead(id) {
      const current = await prisma.staffNotification.findUnique({ where: { id } });
      if (!current) return null;
      const row = await prisma.staffNotification.update({
        where: { id },
        data: { isRead: true },
      });
      return toRecord(row);
    },
    async markAllRead() {
      await prisma.staffNotification.updateMany({ data: { isRead: true } });
    },
    async delete(id) {
      const current = await prisma.staffNotification.findUnique({ where: { id } });
      if (!current) return false;
      await prisma.staffNotification.delete({ where: { id } });
      return true;
    },
  };
}
