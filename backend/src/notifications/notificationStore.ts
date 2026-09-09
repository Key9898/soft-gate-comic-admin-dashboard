export const STAFF_NOTIFICATION_TYPES = ['system', 'report', 'payment', 'content'] as const;

export type StaffNotificationType = (typeof STAFF_NOTIFICATION_TYPES)[number];

export type NotificationRecord = {
  id: string;
  type: StaffNotificationType;
  title: { en: string; mm: string };
  message: { en: string; mm: string };
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
};

export type NotificationWrite = {
  type: StaffNotificationType;
  title: { en: string; mm: string };
  message: { en: string; mm: string };
  isRead?: boolean;
  actionUrl?: string;
};

export type NotificationStore = {
  list: () => Promise<NotificationRecord[]>;
  findById: (id: string) => Promise<NotificationRecord | null>;
  create: (input: NotificationWrite) => Promise<NotificationRecord>;
  markRead: (id: string) => Promise<NotificationRecord | null>;
  markAllRead: () => Promise<void>;
  delete: (id: string) => Promise<boolean>;
};

export function isStaffNotificationType(value: unknown): value is StaffNotificationType {
  return value === 'system' || value === 'report' || value === 'payment' || value === 'content';
}

export function readBilingual(value: unknown): { en: string; mm: string } | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as { en?: unknown; mm?: unknown };
  const en = typeof row.en === 'string' ? row.en : '';
  const mm = typeof row.mm === 'string' ? row.mm : '';
  return { en, mm };
}

export function publicNotification(row: NotificationRecord): NotificationRecord {
  const next: NotificationRecord = {
    id: row.id,
    type: row.type,
    title: { en: row.title.en, mm: row.title.mm },
    message: { en: row.message.en, mm: row.message.mm },
    isRead: row.isRead,
    createdAt: row.createdAt,
  };
  if (row.actionUrl) next.actionUrl = row.actionUrl;
  return next;
}
