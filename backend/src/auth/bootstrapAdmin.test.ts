import { describe, expect, it } from 'vitest';
import { maybeBootstrapAdmin } from './bootstrapAdmin.js';
import { createMemoryStaffStore } from './memoryStaffStore.js';

describe('maybeBootstrapAdmin', () => {
  it('creates the first super admin from real env once', async () => {
    const store = createMemoryStaffStore();
    const env = {
      BOOTSTRAP_ADMIN_EMAIL: 'Owner@Softgate.com',
      BOOTSTRAP_ADMIN_PASSWORD: 'password1',
    };
    expect(await maybeBootstrapAdmin(store, env)).toBe(true);
    expect(await store.countUsers()).toBe(1);
    expect((await store.findUserByEmail('owner@softgate.com'))?.role).toBe('super_admin');
    expect(await maybeBootstrapAdmin(store, env)).toBe(false);
  });

  it('skips fake or empty env', async () => {
    const store = createMemoryStaffStore();
    expect(
      await maybeBootstrapAdmin(store, {
        BOOTSTRAP_ADMIN_EMAIL: 'fake',
        BOOTSTRAP_ADMIN_PASSWORD: 'password1',
      }),
    ).toBe(false);
    expect(await store.countUsers()).toBe(0);
  });
});
