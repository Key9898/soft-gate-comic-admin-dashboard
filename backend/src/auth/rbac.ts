export type StaffRole = 'super_admin' | 'admin' | 'member' | 'viewer';
export type InviteRole = 'admin' | 'member' | 'viewer';
export type InviteStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export const INVITE_ROLES = ['admin', 'member', 'viewer'] as const;

const isInviteRole = (role: string | null | undefined): role is InviteRole =>
  role === 'admin' || role === 'member' || role === 'viewer';

export function canWriteCatalog(role?: string | null): boolean {
  return role === 'super_admin' || role === 'admin' || role === 'member';
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
