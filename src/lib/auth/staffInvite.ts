import { hashPassword } from './passwordHash';
import { canInviteRole, type InviteRole } from './staffAccess';
import {
  getAccountByEmail,
  listStaffAccounts,
  nextStaffId,
  readAccounts,
  removeCredential,
  writeAccounts,
} from './storage';

export const INVITES_STORAGE_KEY = 'softgate_admin_invites_v1';
export const INVITE_SCHEMA_VERSION = 1;
export const INVITE_TTL_MS = 48 * 60 * 60 * 1000;

export type StaffInviteStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export interface StaffInviteRecord {
  id: string;
  email: string;
  role: InviteRole;
  tokenHash: string;
  status: StaffInviteStatus;
  inviterId: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

interface StaffInviteStore {
  schemaVersion: number;
  invites: StaffInviteRecord[];
}

export interface PublicStaffInvite {
  id: string;
  email: string;
  role: InviteRole;
  status: StaffInviteStatus;
  createdAt: string;
  expiresAt: string;
}

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `invite-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function emptyStore(): StaffInviteStore {
  return { schemaVersion: INVITE_SCHEMA_VERSION, invites: [] };
}

export function hashInviteToken(rawToken: string): string {
  return hashPassword(rawToken);
}

export function createInviteToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function readStore(): StaffInviteStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = window.localStorage.getItem(INVITES_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<StaffInviteStore>;
    if (parsed.schemaVersion !== INVITE_SCHEMA_VERSION || !Array.isArray(parsed.invites)) {
      return emptyStore();
    }
    return { schemaVersion: INVITE_SCHEMA_VERSION, invites: parsed.invites };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: StaffInviteStore): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(store));
}

function expireStale(store: StaffInviteStore, now = Date.now()): StaffInviteStore {
  const invites = store.invites.map((invite) => {
    if (invite.status === 'pending' && Date.parse(invite.expiresAt) <= now) {
      return { ...invite, status: 'expired' as const };
    }
    return invite;
  });
  return { ...store, invites };
}

function persist(store: StaffInviteStore): StaffInviteStore {
  const next = expireStale(store);
  writeStore(next);
  return next;
}

function toPublic(invite: StaffInviteRecord): PublicStaffInvite {
  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    status: invite.status,
    createdAt: invite.createdAt,
    expiresAt: invite.expiresAt,
  };
}

export function listInvites(): PublicStaffInvite[] {
  return persist(readStore()).invites.map(toPublic);
}

export function listPendingInvites(): PublicStaffInvite[] {
  return listInvites().filter((invite) => invite.status === 'pending');
}

export { listStaffAccounts, nextStaffId };

export function deleteStaffAccount(email: string): void {
  const normalized = email.trim().toLowerCase();
  const account = getAccountByEmail(normalized);
  if (!account) {
    throw new Error('NOT_FOUND');
  }
  if (account.role === 'super_admin') {
    throw new Error('SUPER_ADMIN_LOCKED');
  }
  const store = readAccounts();
  delete store.byEmail[normalized];
  writeAccounts(store);
  removeCredential(normalized);
}

export function createInvite(input: {
  email: string;
  inviterId: string;
  actorRole: string;
  role?: string;
}): { rawToken: string; invite: PublicStaffInvite } {
  const role = (input.role ?? 'admin') as string;
  if (!canInviteRole(input.actorRole, role)) {
    throw new Error('ROLE_FORBIDDEN');
  }
  const email = input.email.trim().toLowerCase();
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    throw new Error('INVALID_EMAIL');
  }
  if (getAccountByEmail(email)) {
    throw new Error('ALREADY_STAFF');
  }

  const store = persist(readStore());
  const now = Date.now();
  const invites = store.invites.map((invite) =>
    invite.email === email && invite.status === 'pending'
      ? { ...invite, status: 'revoked' as const }
      : invite,
  );
  const rawToken = createInviteToken();
  const record: StaffInviteRecord = {
    id: createId(),
    email,
    role: role as InviteRole,
    tokenHash: hashInviteToken(rawToken),
    status: 'pending',
    inviterId: input.inviterId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + INVITE_TTL_MS).toISOString(),
  };
  persist({ ...store, invites: [record, ...invites] });
  return { rawToken, invite: toPublic(record) };
}

function findByRawToken(rawToken: string, now = Date.now()): StaffInviteRecord | null {
  const tokenHash = hashInviteToken(rawToken);
  const store = persist(readStore());
  const invite = store.invites.find((item) => item.tokenHash === tokenHash);
  if (!invite) return null;
  if (invite.status === 'pending' && Date.parse(invite.expiresAt) <= now) {
    return { ...invite, status: 'expired' };
  }
  return invite;
}

export function peekInvite(rawToken: string): PublicStaffInvite | null {
  const invite = findByRawToken(rawToken);
  if (!invite || invite.status !== 'pending') return null;
  return toPublic(invite);
}

export function resendInvite(
  id: string,
  actorRole: string,
): { rawToken: string; invite: PublicStaffInvite } {
  const store = persist(readStore());
  const current = store.invites.find((invite) => invite.id === id);
  if (!current || current.status !== 'pending') {
    throw new Error('INVITE_INVALID');
  }
  return createInvite({
    email: current.email,
    inviterId: current.inviterId,
    actorRole,
    role: current.role,
  });
}

export function revokeInvite(id: string): void {
  const store = persist(readStore());
  const invites = store.invites.map((invite) =>
    invite.id === id && invite.status === 'pending'
      ? { ...invite, status: 'revoked' as const }
      : invite,
  );
  persist({ ...store, invites });
}

export function consumeInvite(rawToken: string): PublicStaffInvite {
  const invite = findByRawToken(rawToken);
  if (!invite || invite.status !== 'pending') {
    throw new Error('INVITE_INVALID');
  }
  const acceptedAt = new Date().toISOString();
  const store = persist(readStore());
  const invites = store.invites.map((item) =>
    item.id === invite.id ? { ...item, status: 'accepted' as const, acceptedAt } : item,
  );
  persist({ ...store, invites });
  return { ...toPublic(invite), status: 'accepted' };
}
