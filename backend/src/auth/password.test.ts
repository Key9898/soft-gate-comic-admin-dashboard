import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password.js';

describe('password hash', () => {
  it('hashes with bcrypt not sgmock', async () => {
    const hash = await hashPassword('password1');
    expect(hash.startsWith('sgmock:')).toBe(false);
    expect(hash.startsWith('$2')).toBe(true);
    expect(await verifyPassword('password1', hash)).toBe(true);
    expect(await verifyPassword('wrongpass', hash)).toBe(false);
  });
});
