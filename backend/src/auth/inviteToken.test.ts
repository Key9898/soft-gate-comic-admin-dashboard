import { describe, expect, it } from 'vitest';
import { createInviteToken, hashInviteToken } from './inviteToken.js';

describe('invite tokens', () => {
  it('hashes with sha256 not bcrypt', () => {
    const raw = createInviteToken();
    const hashed = hashInviteToken(raw);
    expect(hashed).toHaveLength(64);
    expect(hashed).toBe(hashInviteToken(raw));
    expect(hashed).not.toBe(raw);
  });
});
