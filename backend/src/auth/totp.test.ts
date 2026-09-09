import { describe, expect, it } from 'vitest';
import { generateTotpCode, generateTotpSecret, verifyTotpCode } from './totp.js';

describe('totp', () => {
  it('verifies a code generated for the same secret', () => {
    const secret = generateTotpSecret();
    const code = generateTotpCode(secret);
    expect(verifyTotpCode(secret, code)).toBe(true);
    expect(verifyTotpCode(secret, '000000')).toBe(false);
  });
});
