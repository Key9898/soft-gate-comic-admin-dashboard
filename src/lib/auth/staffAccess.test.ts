import { describe, it, expect } from 'vitest';
import {
  canInviteRole,
  canManageTeam,
  canRemoveStaff,
  canWriteBusiness,
  canWriteCatalog,
  canWriteCommunity,
  canWriteSettings,
  inviteRolesFor,
  ROLE_BLURBS,
  STAFF_ROLE_GUIDE,
  SUPER_ADMIN_BLURB,
} from './staffAccess';

const roles = ['super_admin', 'admin', 'member', 'viewer', undefined, 'unknown'] as const;

describe('staffAccess', () => {
  it('gates catalog write to super_admin, admin, and member', () => {
    expect(roles.map((role) => canWriteCatalog(role))).toEqual([
      true,
      true,
      true,
      false,
      false,
      false,
    ]);
  });

  it('gates community, business, settings, and team to super_admin and admin', () => {
    for (const helper of [canWriteCommunity, canWriteBusiness, canWriteSettings, canManageTeam]) {
      expect(roles.map((role) => helper(role))).toEqual([true, true, false, false, false, false]);
    }
  });

  it('lets Super Admin invite admin, member, and viewer only', () => {
    expect(canInviteRole('super_admin', 'admin')).toBe(true);
    expect(canInviteRole('super_admin', 'member')).toBe(true);
    expect(canInviteRole('super_admin', 'viewer')).toBe(true);
    expect(canInviteRole('super_admin', 'super_admin')).toBe(false);
    expect(inviteRolesFor('super_admin')).toEqual(['admin', 'member', 'viewer']);
  });

  it('lets Admin invite member and viewer only', () => {
    expect(canInviteRole('admin', 'admin')).toBe(false);
    expect(canInviteRole('admin', 'member')).toBe(true);
    expect(canInviteRole('admin', 'viewer')).toBe(true);
    expect(canInviteRole('admin', 'super_admin')).toBe(false);
    expect(inviteRolesFor('admin')).toEqual(['member', 'viewer']);
  });

  it('forbids member and viewer from inviting', () => {
    expect(canInviteRole('member', 'viewer')).toBe(false);
    expect(canInviteRole('viewer', 'member')).toBe(false);
    expect(inviteRolesFor('member')).toEqual([]);
    expect(inviteRolesFor('viewer')).toEqual([]);
  });

  it('never allows removing Super Admin', () => {
    expect(canRemoveStaff('super_admin', 'super_admin')).toBe(false);
    expect(canRemoveStaff('admin', 'super_admin')).toBe(false);
  });

  it('lets Super Admin remove admin, member, and viewer', () => {
    expect(canRemoveStaff('super_admin', 'admin')).toBe(true);
    expect(canRemoveStaff('super_admin', 'member')).toBe(true);
    expect(canRemoveStaff('super_admin', 'viewer')).toBe(true);
  });

  it('lets Admin remove member and viewer only', () => {
    expect(canRemoveStaff('admin', 'admin')).toBe(false);
    expect(canRemoveStaff('admin', 'member')).toBe(true);
    expect(canRemoveStaff('admin', 'viewer')).toBe(true);
    expect(canRemoveStaff('member', 'viewer')).toBe(false);
  });

  it('lists Super Admin through Viewer in STAFF_ROLE_GUIDE', () => {
    expect(STAFF_ROLE_GUIDE.map((entry) => entry.role)).toEqual([
      'super_admin',
      'admin',
      'member',
      'viewer',
    ]);
    expect(STAFF_ROLE_GUIDE[0].blurb).toBe(SUPER_ADMIN_BLURB);
    expect(STAFF_ROLE_GUIDE[1].blurb).toBe(ROLE_BLURBS.admin);
    expect(STAFF_ROLE_GUIDE[2].blurb).toBe(ROLE_BLURBS.member);
    expect(STAFF_ROLE_GUIDE[3].blurb).toBe(ROLE_BLURBS.viewer);
  });
});
