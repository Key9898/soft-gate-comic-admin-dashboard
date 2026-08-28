import type { AdminUser } from '@softgate/shared';
import {
  ACCOUNTS_STORAGE_KEY,
  AUTH_SCHEMA_VERSION,
  CREDENTIALS_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  type StaffAccount,
  type StaffAccountsStore,
} from './types';

const LEGACY_EMAIL_DOMAIN = '@webpad.com';
const SOFTGATE_EMAIL_DOMAIN = '@softgatecomic.com';

type CredentialMap = Record<string, string>;

function emptyAccounts(): StaffAccountsStore {
  return { schemaVersion: AUTH_SCHEMA_VERSION, byEmail: {} };
}

export const migrateLegacyEmail = (adminUser: AdminUser): AdminUser => {
  const email = adminUser.email.toLowerCase();
  if (!email.endsWith(LEGACY_EMAIL_DOMAIN)) {
    return adminUser;
  }

  const localPart = adminUser.email.split('@')[0];
  const migratedEmail = `${localPart}${SOFTGATE_EMAIL_DOMAIN}`;
  const username = localPart;
  const displayName = localPart.charAt(0).toUpperCase() + localPart.slice(1);

  return {
    ...adminUser,
    email: migratedEmail,
    username,
    displayName:
      adminUser.displayName === 'Admin' ||
      adminUser.displayName.toLowerCase() === localPart.toLowerCase() ||
      adminUser.email.startsWith(adminUser.displayName.toLowerCase())
        ? displayName
        : adminUser.displayName,
  };
};

export const normalizeEmailOnLogin = (email: string): string => {
  const trimmed = email.trim();
  if (trimmed.toLowerCase().endsWith(LEGACY_EMAIL_DOMAIN)) {
    return `${trimmed.split('@')[0]}${SOFTGATE_EMAIL_DOMAIN}`;
  }
  return trimmed.toLowerCase();
};

export function readCredentials(): CredentialMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CredentialMap) : {};
  } catch {
    return {};
  }
}

export function writeCredential(email: string, passwordHash: string): void {
  if (typeof window === 'undefined') return;
  const next = { ...readCredentials(), [email.toLowerCase()]: passwordHash };
  window.localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(next));
}

export function removeCredential(email: string): void {
  if (typeof window === 'undefined') return;
  const next = { ...readCredentials() };
  delete next[email.trim().toLowerCase()];
  window.localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(next));
}

export function persistSession(adminUser: AdminUser | null): void {
  if (typeof window === 'undefined') return;
  if (!adminUser) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(adminUser));
}

export function readSession(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminUser;
    if (!parsed?.email) return null;
    return migrateLegacyEmail(parsed);
  } catch {
    return null;
  }
}

export function readAccounts(): StaffAccountsStore {
  if (typeof window === 'undefined') return emptyAccounts();
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return emptyAccounts();
    const parsed = JSON.parse(raw) as Partial<StaffAccountsStore>;
    if (parsed.schemaVersion !== AUTH_SCHEMA_VERSION || !parsed.byEmail) return emptyAccounts();
    return { schemaVersion: AUTH_SCHEMA_VERSION, byEmail: parsed.byEmail };
  } catch {
    return emptyAccounts();
  }
}

export function writeAccounts(store: StaffAccountsStore): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(store));
}

export function upsertAccount(account: StaffAccount): void {
  const store = readAccounts();
  store.byEmail[account.email.trim().toLowerCase()] = account;
  writeAccounts(store);
}

export function getAccountByEmail(email: string): StaffAccount | null {
  return readAccounts().byEmail[email.trim().toLowerCase()] ?? null;
}

export function listStaffAccounts(): StaffAccount[] {
  return Object.values(readAccounts().byEmail).sort((a, b) => {
    if (a.role === 'super_admin' && b.role !== 'super_admin') return -1;
    if (a.role !== 'super_admin' && b.role === 'super_admin') return 1;
    return a.email.localeCompare(b.email);
  });
}

export function nextStaffId(): string {
  const ids = Object.values(readAccounts().byEmail).map((account) =>
    Number.parseInt(account.id, 10),
  );
  const max = ids.reduce((acc, id) => (Number.isFinite(id) && id > acc ? id : acc), 0);
  return String(max + 1);
}

export function getAccountByUsername(username: string): StaffAccount | null {
  const needle = username.trim().toLowerCase();
  if (!needle) return null;
  return (
    Object.values(readAccounts().byEmail).find(
      (account) => account.username.trim().toLowerCase() === needle,
    ) ?? null
  );
}

export function hasStaffAccount(): boolean {
  return Object.keys(readAccounts().byEmail).length > 0;
}

export function toPublicUser(account: StaffAccount): AdminUser {
  return {
    id: account.id,
    email: account.email,
    username: account.username,
    displayName: account.displayName,
    avatar: account.avatar,
    role: account.role,
    createdAt: account.createdAt,
    passwordHash: account.passwordHash,
  };
}

/** One-shot: empty accounts + existing session → seed that one staff row. */
export function seedAccountFromSessionIfNeeded(): void {
  if (hasStaffAccount()) return;
  const session = readSession();
  if (!session) return;
  const email = session.email.trim().toLowerCase();
  const fromCredentials = readCredentials()[email];
  const passwordHash = session.passwordHash || fromCredentials;
  if (!passwordHash) {
    const account: StaffAccount = {
      ...session,
      email,
      passwordHash: '',
    };
    upsertAccount(account);
    return;
  }
  upsertAccount({
    ...session,
    email,
    passwordHash,
  });
  writeCredential(email, passwordHash);
}
