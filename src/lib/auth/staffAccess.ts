import type { AdminUser } from '@softgate/shared';
import { useAuth } from '@/features/auth/useAuth';

export type StaffRole = AdminUser['role'];
export type InviteRole = 'admin' | 'member' | 'viewer';

export const INVITE_ROLES = ['admin', 'member', 'viewer'] as const;

export const ROLE_BLURBS: Record<InviteRole, string> = {
  admin: 'Same desk as Super Admin, except Team: invite and remove Member and Viewer only.',
  member: 'Can edit catalog. Community, business, Team, and Settings are view-only.',
  viewer: 'Can open every page to learn the desk. Cannot save, delete, ban, or invite.',
};

export const SUPER_ADMIN_BLURB =
  'Full desk, including inviting Admins. Cannot be invited or removed.';

export const STAFF_ROLE_GUIDE: ReadonlyArray<{ role: StaffRole; blurb: string }> = [
  { role: 'super_admin', blurb: SUPER_ADMIN_BLURB },
  { role: 'admin', blurb: ROLE_BLURBS.admin },
  { role: 'member', blurb: ROLE_BLURBS.member },
  { role: 'viewer', blurb: ROLE_BLURBS.viewer },
];

const isInviteRole = (role: string | null | undefined): role is InviteRole =>
  role === 'admin' || role === 'member' || role === 'viewer';

export function canWriteCatalog(role?: string | null): boolean {
  return role === 'super_admin' || role === 'admin' || role === 'member';
}

export function canWriteCommunity(role?: string | null): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function canWriteBusiness(role?: string | null): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function canWriteSettings(role?: string | null): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function canManageTeam(role?: string | null): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function canInviteRole(actor?: string | null, target?: string | null): boolean {
  if (!isInviteRole(target)) return false;
  if (actor === 'super_admin') return true;
  if (actor === 'admin') return target === 'member' || target === 'viewer';
  return false;
}

export function canRemoveStaff(actor?: string | null, target?: string | null): boolean {
  if (!target || target === 'super_admin') return false;
  if (actor === 'super_admin')
    return target === 'admin' || target === 'member' || target === 'viewer';
  if (actor === 'admin') return target === 'member' || target === 'viewer';
  return false;
}

export function inviteRolesFor(actor?: string | null): InviteRole[] {
  return INVITE_ROLES.filter((role) => canInviteRole(actor, role));
}

export function useStaffAccess() {
  const { user } = useAuth();
  const role = user?.role;
  return {
    role,
    canWriteCatalog: canWriteCatalog(role),
    canWriteCommunity: canWriteCommunity(role),
    canWriteBusiness: canWriteBusiness(role),
    canWriteSettings: canWriteSettings(role),
    canManageTeam: canManageTeam(role),
    canInviteRole: (target: string | null | undefined) => canInviteRole(role, target),
    canRemoveStaff: (target: string | null | undefined) => canRemoveStaff(role, target),
    inviteRoles: inviteRolesFor(role),
  };
}
