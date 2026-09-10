import type { Prisma, PrismaClient } from '@prisma/client';
import { readBilingual } from '../notifications/notificationStore.js';
import {
  isReaderBroadcastType,
  publicBroadcast,
  type ReaderBroadcastAudienceKind,
  type ReaderBroadcastCounts,
  type ReaderBroadcastRecord,
  type ReaderBroadcastStatus,
  type ReaderBroadcastStore,
  type ReaderBroadcastWrite,
} from './broadcastStore.js';

function readIds(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function toRecord(row: {
  id: string;
  type: string;
  title: Prisma.JsonValue;
  message: Prisma.JsonValue;
  href: string | null;
  audience: ReaderBroadcastAudienceKind;
  readerIds: Prisma.JsonValue;
  status: ReaderBroadcastStatus;
  createdById: string;
  inboxCount: number;
  emailed: number;
  pushed: number;
  skippedPref: number;
  failureReason: string | null;
  createdAt: Date;
}): ReaderBroadcastRecord {
  const title = readBilingual(row.title);
  const message = readBilingual(row.message);
  return publicBroadcast({
    id: row.id,
    type: isReaderBroadcastType(row.type) ? row.type : 'system',
    title: title ?? { en: '', mm: '' },
    message: message ?? { en: '', mm: '' },
    href: row.href ?? undefined,
    audience: row.audience,
    readerIds: readIds(row.readerIds),
    status: row.status,
    createdById: row.createdById,
    inboxCount: row.inboxCount,
    emailed: row.emailed,
    pushed: row.pushed,
    skippedPref: row.skippedPref,
    failureReason: row.failureReason ?? undefined,
    createdAt: row.createdAt.toISOString(),
  });
}

export function createPrismaBroadcastStore(prisma: PrismaClient): ReaderBroadcastStore {
  return {
    async list() {
      const rows = await prisma.readerBroadcast.findMany({
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      });
      return rows.map(toRecord);
    },
    async findById(id) {
      const row = await prisma.readerBroadcast.findUnique({ where: { id } });
      return row ? toRecord(row) : null;
    },
    async createSending(input: ReaderBroadcastWrite) {
      const stored = publicBroadcast({
        id: input.id ?? 'pending',
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
        createdAt: new Date().toISOString(),
      });
      const row = await prisma.readerBroadcast.create({
        data: {
          ...(input.id ? { id: input.id } : {}),
          type: stored.type,
          title: stored.title,
          message: stored.message,
          href: stored.href ?? null,
          audience: stored.audience,
          readerIds: stored.readerIds,
          status: 'sending',
          createdById: stored.createdById,
        },
      });
      return toRecord(row);
    },
    async markSent(id: string, counts: ReaderBroadcastCounts) {
      const current = await prisma.readerBroadcast.findUnique({ where: { id } });
      if (!current) return null;
      const row = await prisma.readerBroadcast.update({
        where: { id },
        data: {
          status: 'sent',
          inboxCount: counts.inboxCount,
          emailed: counts.emailed,
          pushed: counts.pushed,
          skippedPref: counts.skippedPref,
          failureReason: null,
        },
      });
      return toRecord(row);
    },
    async markFailed(id: string, reason: string) {
      const current = await prisma.readerBroadcast.findUnique({ where: { id } });
      if (!current) return null;
      const row = await prisma.readerBroadcast.update({
        where: { id },
        data: { status: 'failed', failureReason: reason },
      });
      return toRecord(row);
    },
  };
}
