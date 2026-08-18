import type { ActivityLog, AdminUser, BilingualText } from '@softgate/shared';
import type { Dispatch, SetStateAction } from 'react';

export type ActivityTargetType = ActivityLog['targetType'];

type AppendInput = {
  action: ActivityLog['action'];
  targetType: ActivityTargetType;
  targetId: string;
  targetName: BilingualText | string;
  details?: BilingualText | string;
  admin?: Pick<AdminUser, 'id' | 'displayName'> | null;
};

const toBilingual = (value: BilingualText | string | undefined): BilingualText | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return { en: value, mm: value };
  return value;
};

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** Prepend an activity log entry into SharedData via setActivityLogs. */
export const appendActivityLog = (
  setActivityLogs: Dispatch<SetStateAction<ActivityLog[]>>,
  input: AppendInput,
) => {
  const entry: ActivityLog = {
    id: createId(),
    adminId: input.admin?.id || 'admin',
    adminName: input.admin?.displayName || 'Admin',
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    targetName: toBilingual(input.targetName) || { en: input.targetId, mm: input.targetId },
    details: toBilingual(input.details),
    createdAt: new Date().toISOString(),
  };

  setActivityLogs((prev) => [entry, ...prev]);
};
