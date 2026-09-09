import type { InviteRole, InviteStatus, StaffRole } from './rbac.js';

export interface StaffUserRecord {
  id: string;
  email: string;
  displayName: string;
  role: StaffRole;
  passwordHash: string;
  totpEnabled: boolean;
  totpSecret: string | null;
  totpBackupHashes: string[];
  createdAt: Date;
}

export interface StaffInviteRecord {
  id: string;
  email: string;
  role: InviteRole;
  tokenHash: string;
  status: InviteStatus;
  inviterId: string;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
}

export interface StaffPasswordResetRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  consumedAt?: Date;
  createdAt: Date;
}

export type StaffUserPatch = Partial<
  Pick<StaffUserRecord, 'passwordHash' | 'totpEnabled' | 'totpSecret' | 'totpBackupHashes'>
>;

export interface StaffStore {
  countUsers(): Promise<number>;
  findUserById(id: string): Promise<StaffUserRecord | null>;
  findUserByEmail(email: string): Promise<StaffUserRecord | null>;
  listUsers(): Promise<StaffUserRecord[]>;
  createUser(input: {
    id: string;
    email: string;
    displayName: string;
    role: StaffRole;
    passwordHash: string;
  }): Promise<StaffUserRecord>;
  updateUser(id: string, patch: StaffUserPatch): Promise<StaffUserRecord | null>;
  deleteUser(id: string): Promise<boolean>;
  createInvite(input: {
    id: string;
    email: string;
    role: InviteRole;
    tokenHash: string;
    inviterId: string;
    expiresAt: Date;
  }): Promise<StaffInviteRecord>;
  findInviteById(id: string): Promise<StaffInviteRecord | null>;
  findInviteByTokenHash(tokenHash: string): Promise<StaffInviteRecord | null>;
  listInvites(): Promise<StaffInviteRecord[]>;
  updateInvite(
    id: string,
    patch: Partial<Pick<StaffInviteRecord, 'tokenHash' | 'status' | 'expiresAt' | 'acceptedAt'>>,
  ): Promise<StaffInviteRecord | null>;
  createPasswordReset(input: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<StaffPasswordResetRecord>;
  findPasswordResetByTokenHash(tokenHash: string): Promise<StaffPasswordResetRecord | null>;
  consumePasswordReset(id: string): Promise<StaffPasswordResetRecord | null>;
}

export function publicUser(user: StaffUserRecord) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    totpEnabled: user.totpEnabled,
    createdAt: user.createdAt.toISOString(),
  };
}

export function publicInvite(invite: StaffInviteRecord) {
  const expired = invite.status === 'pending' && invite.expiresAt.getTime() < Date.now();
  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    status: expired ? 'expired' : invite.status,
    createdAt: invite.createdAt.toISOString(),
    expiresAt: invite.expiresAt.toISOString(),
  };
}
