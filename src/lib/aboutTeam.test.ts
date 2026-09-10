import { mockAboutTeamMembers, mockAboutTeamMeta } from '@softgate/shared';
import { describe, expect, it } from 'vitest';
import { nextAboutTeamMemberId, sortMembers } from './aboutTeam';

describe('aboutTeam helpers', () => {
  it('sorts by sortOrder then id', () => {
    const sorted = sortMembers([mockAboutTeamMembers[3], mockAboutTeamMembers[0]]);
    expect(sorted.map((row) => row.id)).toEqual(['m1', 'm4']);
  });

  it('allocates the next mock member id', () => {
    expect(nextAboutTeamMemberId(mockAboutTeamMembers)).toBe('m5');
  });

  it('keeps the portal stand-in visible by default', () => {
    expect(mockAboutTeamMeta.standInVisible).toBe(true);
    expect(mockAboutTeamMembers).toHaveLength(4);
    expect(mockAboutTeamMembers.every((row) => !row.photoUrl)).toBe(true);
  });
});
