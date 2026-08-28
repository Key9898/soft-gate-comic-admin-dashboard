import type { AdminUser } from '@softgate/shared';
import type { InviteRole, PublicStaffInvite, StaffAccount } from '@/lib/auth';
import { apiRequest, mapStaffUser } from './http';

export type ApiStaffUser = {
  id: string;
  email: string;
  displayName: string;
  role: AdminUser['role'];
  createdAt: string;
};

export type ApiStaffInvite = PublicStaffInvite;

export function toStaffAccount(user: ApiStaffUser): StaffAccount {
  return {
    ...mapStaffUser(user),
    passwordHash: '',
  };
}

export function loginStaff(email: string, password: string) {
  return apiRequest<{ user: ApiStaffUser }>('/api/staff/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function registerStaff(input: { email: string; password: string; displayName: string }) {
  return apiRequest<{ user: ApiStaffUser }>('/api/staff/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function logoutStaff() {
  return apiRequest<{ ok: true }>('/api/staff/logout', { method: 'POST' });
}

export function getStaffMe() {
  return apiRequest<{ user: ApiStaffUser }>('/api/staff/me');
}

export function acceptStaffInvite(input: { token: string; password: string; displayName: string }) {
  return apiRequest<{ user: ApiStaffUser }>('/api/staff/invites/accept', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listStaffUsers() {
  return apiRequest<{ users: ApiStaffUser[] }>('/api/staff');
}

export function listStaffInvites() {
  return apiRequest<{ invites: ApiStaffInvite[] }>('/api/staff/invites');
}

export function createStaffInvite(input: { email: string; role: InviteRole }) {
  return apiRequest<{ invite: ApiStaffInvite; token: string }>('/api/staff/invites', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function resendStaffInvite(id: string) {
  return apiRequest<{ invite: ApiStaffInvite; token: string }>(`/api/staff/invites/${id}/resend`, {
    method: 'POST',
  });
}

export function deleteStaffUser(id: string) {
  return apiRequest<{ ok: true }>(`/api/staff/${id}`, { method: 'DELETE' });
}
