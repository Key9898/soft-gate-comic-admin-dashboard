import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { hashPassword, upsertAccount, writeCredential } from '@/lib/auth';
import {
  INVITES_STORAGE_KEY,
  INVITE_TTL_MS,
  consumeInvite,
  createInvite,
  deleteStaffAccount,
  hashInviteToken,
  listInvites,
  peekInvite,
  resendInvite,
  revokeInvite,
} from './staffInvite';

const superAdmin = { inviterId: '1', actorRole: 'super_admin' } as const;

const seedSuperAdmin = () => {
  const passwordHash = hashPassword('password1');
  upsertAccount({
    id: '1',
    email: 'admin@test.com',
    username: 'admin',
    displayName: 'Admin',
    role: 'super_admin',
    createdAt: '2026-08-23',
    passwordHash,
  });
  writeCredential('admin@test.com', passwordHash);
};

describe('staffInvite', () => {
  beforeEach(() => {
    localStorage.clear();
    seedSuperAdmin();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stores a hash, not the raw token', () => {
    const { rawToken, invite } = createInvite({
      email: 'editor@test.com',
      ...superAdmin,
    });
    const raw = localStorage.getItem(INVITES_STORAGE_KEY) || '';
    expect(raw).not.toContain(rawToken);
    expect(raw).toContain(hashInviteToken(rawToken));
    expect(invite.role).toBe('admin');
    expect(invite.email).toBe('editor@test.com');
    expect(peekInvite(rawToken)?.id).toBe(invite.id);
  });

  it('rejects inviting an existing staff email', () => {
    expect(() => createInvite({ email: 'admin@test.com', ...superAdmin })).toThrow('ALREADY_STAFF');
  });

  it('rejects super_admin as an invite role', () => {
    expect(() =>
      createInvite({ email: 'boss@test.com', ...superAdmin, role: 'super_admin' }),
    ).toThrow('ROLE_FORBIDDEN');
  });

  it('persists member and viewer invites', () => {
    const member = createInvite({ email: 'member@test.com', ...superAdmin, role: 'member' });
    const viewer = createInvite({ email: 'viewer@test.com', ...superAdmin, role: 'viewer' });
    expect(member.invite.role).toBe('member');
    expect(viewer.invite.role).toBe('viewer');
  });

  it('rejects an Admin actor inviting Admin', () => {
    expect(() =>
      createInvite({
        email: 'peer@test.com',
        inviterId: '2',
        actorRole: 'admin',
        role: 'admin',
      }),
    ).toThrow('ROLE_FORBIDDEN');
  });

  it('rotates a pending invite for the same email', () => {
    const first = createInvite({ email: 'editor@test.com', ...superAdmin });
    const second = createInvite({ email: 'editor@test.com', ...superAdmin });
    expect(peekInvite(first.rawToken)).toBeNull();
    expect(peekInvite(second.rawToken)?.email).toBe('editor@test.com');
    expect(listInvites().filter((row) => row.status === 'revoked')).toHaveLength(1);
  });

  it('consumes an invite once', () => {
    const { rawToken } = createInvite({ email: 'editor@test.com', ...superAdmin });
    expect(consumeInvite(rawToken).status).toBe('accepted');
    expect(peekInvite(rawToken)).toBeNull();
    expect(() => consumeInvite(rawToken)).toThrow('INVITE_INVALID');
  });

  it('expires pending invites after 48 hours', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-23T00:00:00.000Z'));
    const { rawToken } = createInvite({ email: 'editor@test.com', ...superAdmin });
    vi.setSystemTime(new Date(Date.parse('2026-08-23T00:00:00.000Z') + INVITE_TTL_MS + 1));
    expect(peekInvite(rawToken)).toBeNull();
  });

  it('resend keeps the original role and rotates the token', () => {
    const created = createInvite({ email: 'member@test.com', ...superAdmin, role: 'member' });
    const resent = resendInvite(created.invite.id, 'super_admin');
    expect(peekInvite(created.rawToken)).toBeNull();
    expect(peekInvite(resent.rawToken)?.email).toBe('member@test.com');
    expect(resent.invite.role).toBe('member');
    revokeInvite(resent.invite.id);
    expect(peekInvite(resent.rawToken)).toBeNull();
  });

  it('refuses to delete a super_admin', () => {
    expect(() => deleteStaffAccount('admin@test.com')).toThrow('SUPER_ADMIN_LOCKED');
  });
});
