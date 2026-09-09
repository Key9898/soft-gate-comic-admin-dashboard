import { hashPassword } from './password.js';
import { newId } from './memoryStaffStore.js';
import type { StaffStore } from './staffStore.js';
import type { EnvMap } from './corsOrigins.js';

function read(env: EnvMap, key: string): string {
  return (env[key] ?? '').trim();
}

function isFake(value: string): boolean {
  return value.toLowerCase() === 'fake';
}

export async function maybeBootstrapAdmin(
  store: StaffStore,
  env: EnvMap = process.env,
): Promise<boolean> {
  const email = read(env, 'BOOTSTRAP_ADMIN_EMAIL').toLowerCase();
  const password = read(env, 'BOOTSTRAP_ADMIN_PASSWORD');
  if (!email.includes('@') || !password) return false;
  if (isFake(email) || isFake(password)) return false;
  if ((await store.countUsers()) > 0) return false;
  const displayName = read(env, 'BOOTSTRAP_ADMIN_DISPLAY_NAME') || email.split('@')[0] || 'Admin';
  await store.createUser({
    id: newId(),
    email,
    displayName,
    role: 'super_admin',
    passwordHash: await hashPassword(password),
  });
  return true;
}
