import { describe, expect, it } from 'vitest';
import { isMissingTableError } from './prismaMissingTable.js';

describe('isMissingTableError', () => {
  it('matches Prisma P2021', () => {
    expect(isMissingTableError({ code: 'P2021' })).toBe(true);
  });

  it('does not match other Prisma codes or plain errors', () => {
    expect(isMissingTableError({ code: 'P2025' })).toBe(false);
    expect(isMissingTableError(new Error('boom'))).toBe(false);
    expect(isMissingTableError(null)).toBe(false);
  });
});
