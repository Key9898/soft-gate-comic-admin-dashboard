import type { AdminUser } from '@softgate/shared';
import type { InviteRole, PublicStaffInvite, StaffAccount } from '@/lib/auth';
import { apiRequest, mapStaffUser } from './http';

export type ApiStaffUser = {
  id: string;
  email: string;
  displayName: string;
  role: AdminUser['role'];
  createdAt: string;
  totpEnabled?: boolean;
};

export type ApiStaffAuthOptions = {
  setupRequired: boolean;
  ssoEnabled: boolean;
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

export function completeStaffMfa(code: string) {
  return apiRequest<{ user: ApiStaffUser }>('/api/staff/login/mfa', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export function getStaffAuthOptions() {
  return apiRequest<ApiStaffAuthOptions>('/api/staff/auth-options');
}

export function setupStaff(input: { email: string; password: string; displayName: string }) {
  return apiRequest<{ user: ApiStaffUser }>('/api/staff/setup', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function registerStaff(input: { email: string; password: string; displayName: string }) {
  return setupStaff(input);
}

export function requestStaffForgot(email: string) {
  return apiRequest<{ ok: true }>('/api/staff/forgot', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function resetStaffPassword(token: string, password: string) {
  return apiRequest<{ ok: true }>('/api/staff/reset', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export function startStaffTotp() {
  return apiRequest<{ secret: string; otpauthUrl: string }>('/api/staff/me/totp/start', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function confirmStaffTotp(code: string) {
  return apiRequest<{ backupCodes: string[] }>('/api/staff/me/totp/confirm', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export function disableStaffTotp(password: string) {
  return apiRequest<{ ok: true }>('/api/staff/me/totp', {
    method: 'DELETE',
    body: JSON.stringify({ password }),
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
