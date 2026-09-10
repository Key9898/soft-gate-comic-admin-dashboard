import type { AboutTeamMember, AboutTeamMeta } from '@softgate/shared';
import { mockAboutTeamMembers, mockAboutTeamMeta } from '@softgate/shared';

export const ABOUT_TEAM_STORAGE_KEY = 'softgate_admin_about_team_v1';
export const ABOUT_TEAM_SCHEMA_VERSION = 1;

export function persistedMember(row: AboutTeamMember): AboutTeamMember {
  const next: AboutTeamMember = {
    id: row.id,
    name: { en: row.name.en, mm: row.name.mm },
    role: { en: row.role.en, mm: row.role.mm },
    sortOrder: row.sortOrder,
    published: row.published,
  };
  if (row.photoUrl) next.photoUrl = row.photoUrl;
  return next;
}

export function publicMeta(row: AboutTeamMeta): AboutTeamMeta {
  return {
    deck: { en: row.deck.en, mm: row.deck.mm },
    standInNote: { en: row.standInNote.en, mm: row.standInNote.mm },
    standInVisible: row.standInVisible,
  };
}

export function compareMember(a: AboutTeamMember, b: AboutTeamMember): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.id.localeCompare(b.id);
}

export function sortMembers(rows: AboutTeamMember[]): AboutTeamMember[] {
  return rows.slice().sort(compareMember);
}

export function nextAboutTeamMemberId(rows: AboutTeamMember[]): string {
  let max = 0;
  for (const row of rows) {
    const match = /^m(\d+)$/.exec(row.id);
    const n = match ? Number(match[1]) : /^\d+$/.test(row.id) ? Number(row.id) : null;
    if (n != null && n > max) max = n;
  }
  return `m${max + 1}`;
}

export type AboutTeamSnapshot = {
  members: AboutTeamMember[];
  meta: AboutTeamMeta;
};

export function loadAboutTeam(): AboutTeamSnapshot {
  const raw = localStorage.getItem(ABOUT_TEAM_STORAGE_KEY);
  if (!raw) return { members: mockAboutTeamMembers, meta: mockAboutTeamMeta };
  try {
    const parsed = JSON.parse(raw) as {
      schemaVersion?: number;
      members?: unknown;
      meta?: unknown;
    };
    if (parsed.schemaVersion !== ABOUT_TEAM_SCHEMA_VERSION || !Array.isArray(parsed.members)) {
      return { members: mockAboutTeamMembers, meta: mockAboutTeamMeta };
    }
    const meta =
      parsed.meta && typeof parsed.meta === 'object'
        ? publicMeta(parsed.meta as AboutTeamMeta)
        : mockAboutTeamMeta;
    return { members: parsed.members as AboutTeamMember[], meta };
  } catch {
    return { members: mockAboutTeamMembers, meta: mockAboutTeamMeta };
  }
}

export function saveAboutTeam(members: AboutTeamMember[], meta: AboutTeamMeta): void {
  localStorage.setItem(
    ABOUT_TEAM_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: ABOUT_TEAM_SCHEMA_VERSION,
      members,
      meta: publicMeta(meta),
    }),
  );
}
