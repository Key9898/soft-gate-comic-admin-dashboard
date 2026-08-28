import { describe, expect, it } from 'vitest';
import { canInviteRole, canManageTeam, canRemoveStaff, canWriteCatalog } from './rbac.js';

describe('staff RBAC', () => {
  it('locks Super Admin from invite and remove', () => {
    expect(canInviteRole('super_admin', 'super_admin')).toBe(false);
    expect(canRemoveStaff('super_admin', 'super_admin')).toBe(false);
    expect(canRemoveStaff('admin', 'super_admin')).toBe(false);
  });

  it('matches Admin mock invite rules', () => {
    expect(canInviteRole('super_admin', 'admin')).toBe(true);
    expect(canInviteRole('admin', 'admin')).toBe(false);
    expect(canInviteRole('admin', 'member')).toBe(true);
    expect(canInviteRole('member', 'viewer')).toBe(false);
    expect(canManageTeam('viewer')).toBe(false);
    expect(canManageTeam('admin')).toBe(true);
  });

  it('matches Admin mock catalog write rules', () => {
    expect(canWriteCatalog('super_admin')).toBe(true);
    expect(canWriteCatalog('admin')).toBe(true);
    expect(canWriteCatalog('member')).toBe(true);
    expect(canWriteCatalog('viewer')).toBe(false);
  });
});
