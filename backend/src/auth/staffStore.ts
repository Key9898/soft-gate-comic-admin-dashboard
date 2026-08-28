import type { InviteRole, InviteStatus, StaffRole } from './rbac.js';

export interface StaffUserRecord {
  id: string;
  email: string;
  displayName: string;
  role: StaffRole;
  passwordHash: string;
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
}

export function publicUser(user: StaffUserRecord) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
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
