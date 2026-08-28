import type { AdminUser } from '@softgate/shared';

export const AUTH_SCHEMA_VERSION = 1;
export const ACCOUNTS_STORAGE_KEY = 'softgate_admin_accounts_v1';
export const SESSION_STORAGE_KEY = 'softgate_admin_user';
export const CREDENTIALS_STORAGE_KEY = 'softgate_admin_credentials';

export type StaffAccount = AdminUser & {
  passwordHash: string;
};

export interface StaffAccountsStore {
  schemaVersion: number;
  byEmail: Record<string, StaffAccount>;
}
