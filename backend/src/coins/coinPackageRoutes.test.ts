import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createMemoryStaffStore } from '../auth/memoryStaffStore.js';
import { createMemoryCatalogStore } from '../catalog/memoryCatalogStore.js';
import { createMemoryCoinPackageStore } from './memoryCoinPackageStore.js';
import { createMemoryCommentStore } from '../comments/memoryCommentStore.js';
import { createMemoryNotificationStore } from '../notifications/memoryNotificationStore.js';
import { createMemoryPlatformSettingsStore } from '../settings/memoryPlatformSettingsStore.js';
import { createMemoryReaderUserStore } from '../users/memoryReaderUserStore.js';

function appWithCoins() {
  return createApp({
    store: createMemoryStaffStore(),
    catalog: createMemoryCatalogStore(),
    coinPackages: createMemoryCoinPackageStore(),
    comments: createMemoryCommentStore(),
    readerUsers: createMemoryReaderUserStore(),
    notifications: createMemoryNotificationStore(),
    settings: createMemoryPlatformSettingsStore(),
  });
}

async function registerOwner(app: ReturnType<typeof createApp>) {
  const res = await request(app).post('/api/staff/register').send({
    email: 'owner@softgate.com',
    password: 'password1',
    displayName: 'Owner',
  });
  expect(res.status).toBe(201);
  return res.headers['set-cookie'] as string[];
}

describe('coin package routes', () => {
  it('rejects unauthenticated reads', async () => {
    const app = appWithCoins();
    const res = await request(app).get('/api/coin-packages');
    expect(res.status).toBe(401);
  });

  it('lets a member read and forbids member writes', async () => {
    const app = appWithCoins();
    const ownerCookie = await registerOwner(app);
    const invited = await request(app)
      .post('/api/staff/invites')
      .set('Cookie', ownerCookie)
      .send({ email: 'member@softgate.com', role: 'member' });
    const accepted = await request(app).post('/api/staff/invites/accept').send({
      token: invited.body.token,
      password: 'password1',
      displayName: 'Member',
    });
    const memberCookie = accepted.headers['set-cookie'] as string[];

    const listed = await request(app).get('/api/coin-packages').set('Cookie', memberCookie);
    expect(listed.status).toBe(200);
    expect(listed.body.coinPackages).toEqual([]);

    const denied = await request(app)
      .post('/api/coin-packages')
      .set('Cookie', memberCookie)
      .send({ coins: 100, price: 1000 });
    expect(denied.status).toBe(403);
  });

  it('creates, exclusives badges, and deletes for admin', async () => {
    const app = appWithCoins();
    const cookie = await registerOwner(app);

    const both = await request(app)
      .post('/api/coin-packages')
      .set('Cookie', cookie)
      .send({ coins: 100, price: 1000, popular: true, bestValue: true });
    expect(both.status).toBe(400);

    const first = await request(app)
      .post('/api/coin-packages')
      .set('Cookie', cookie)
      .send({ coins: 100, price: 1000, popular: true });
    expect(first.status).toBe(201);
    expect(first.body.coinPackage.popular).toBe(true);
    expect(first.body.coinPackage.bestValue).toBeUndefined();

    const second = await request(app)
      .post('/api/coin-packages')
      .set('Cookie', cookie)
      .send({ coins: 300, price: 2500, bonus: 20, popular: true });
    expect(second.status).toBe(201);
    expect(second.body.coinPackage.popular).toBe(true);

    const listed = await request(app).get('/api/coin-packages').set('Cookie', cookie);
    expect(listed.status).toBe(200);
    const packs = listed.body.coinPackages as Array<{ id: string; popular?: boolean }>;
    const popularCount = packs.filter((pack) => pack.popular).length;
    expect(popularCount).toBe(1);
    expect(packs.find((pack) => pack.id === first.body.coinPackage.id)?.popular).toBeUndefined();

    const missing = await request(app)
      .patch('/api/coin-packages/missing')
      .set('Cookie', cookie)
      .send({ coins: 50, price: 500 });
    expect(missing.status).toBe(404);

    const deleted = await request(app)
      .delete(`/api/coin-packages/${second.body.coinPackage.id}`)
      .set('Cookie', cookie);
    expect(deleted.status).toBe(200);
    expect(deleted.body.ok).toBe(true);
  });
});
