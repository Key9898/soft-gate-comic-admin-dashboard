import type { AboutTeamMember, AboutTeamMeta } from '@softgate/shared';
import { apiRequest } from './http';

export type AboutTeamMemberWriteBody = {
  name: { en: string; mm: string };
  role: { en: string; mm: string };
  photoUrl?: string;
  sortOrder: number;
  published: boolean;
};

export type AboutTeamMetaWriteBody = {
  deck: { en: string; mm: string };
  standInNote: { en: string; mm: string };
  standInVisible: boolean;
};

export function listAboutTeamMembers() {
  return apiRequest<{ members: AboutTeamMember[] }>('/api/about/team');
}

export function createAboutTeamMember(body: AboutTeamMemberWriteBody) {
  return apiRequest<{ member: AboutTeamMember }>('/api/about/team', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateAboutTeamMember(id: string, body: Partial<AboutTeamMemberWriteBody>) {
  return apiRequest<{ member: AboutTeamMember }>(`/api/about/team/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteAboutTeamMember(id: string) {
  return apiRequest<{ ok: true }>(`/api/about/team/${id}`, { method: 'DELETE' });
}

export function getAboutTeamMeta() {
  return apiRequest<{ meta: AboutTeamMeta }>('/api/about/team/meta');
}

export function updateAboutTeamMeta(body: AboutTeamMetaWriteBody) {
  return apiRequest<{ meta: AboutTeamMeta }>('/api/about/team/meta', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
