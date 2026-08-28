import { createHash, randomBytes } from 'node:crypto';

export function createInviteToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashInviteToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}
