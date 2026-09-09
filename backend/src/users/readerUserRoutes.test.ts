import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createMemoryStaffStore } from '../auth/memoryStaffStore.js';
import { createMemoryCatalogStore } from '../catalog/memoryCatalogStore.js';
import { createMemoryCoinPackageStore } from '../coins/memoryCoinPackageStore.js';
import { createMemoryCommentStore } from '../comments/memoryCommentStore.js';
import { createMemoryNotificationStore } from '../notifications/memoryNotificationStore.js';
import { createMemoryPlatformSettingsStore } from '../settings/memoryPlatformSettingsStore.js';
import { createMemoryReaderUserStore } from './memoryReaderUserStore.js';
import type { ReaderUserStore, ReaderUserWrite } from './readerUserStore.js';

const sampleWrite: ReaderUserWrite = {
  email: 'reader@softgate.com',
  username: 'reader1',
  displayName: 'Reader One',
  bio: 'Hi',
  passwordHash: 'hash',
  coinBalance: 40,
};

function appWithUsers(users: ReaderUserStore) {
  return createApp({
    store: createMemoryStaffStore(),
    catalog: createMemoryCatalogStore(),
    coinPackages: createMemoryCoinPackageStore(),
    comments: createMemoryCommentStore(),
    notifications: createMemoryNotificationStore(),
    settings: createMemoryPlatformSettingsStore(),
    readerUsers: users,
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

describe('reader user routes', () => {
  it('rejects unauthenticated reads', async () => {
    const app = appWithUsers(createMemoryReaderUserStore());
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('lets a member read and forbids member writes', async () => {
    const users = createMemoryReaderUserStore();
    await users.create(sampleWrite);
    const app = appWithUsers(users);
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

    const listed = await request(app).get('/api/users').set('Cookie', memberCookie);
    expect(listed.status).toBe(200);
    expect(listed.body.users).toHaveLength(1);
    expect(listed.body.users[0].passwordHash).toBeUndefined();
    expect(listed.body.users[0].displayName).toBe('Reader One');
    expect(listed.body.users[0].coinBalance).toBe(40);

    const denied = await request(app)
      .patch(`/api/users/${listed.body.users[0].id}`)
      .set('Cookie', memberCookie)
      .send({ displayName: 'Nope' });
    expect(denied.status).toBe(403);
  });

  it('patches profile, rejects banned status, and hard-deletes for admin', async () => {
    const users = createMemoryReaderUserStore();
    const seeded = await users.create(sampleWrite);
    const other = await users.create({
      email: 'taken@softgate.com',
      username: 'taken',
      displayName: 'Taken',
      passwordHash: 'hash',
    });
    const app = appWithUsers(users);
    const cookie = await registerOwner(app);

    const renamed = await request(app)
      .patch(`/api/users/${seeded.id}`)
      .set('Cookie', cookie)
      .send({ displayName: 'New Name', email: '  Reader@softgate.com  ' });
    expect(renamed.status).toBe(200);
    expect(renamed.body.user.displayName).toBe('New Name');
    expect(renamed.body.user.email).toBe('reader@softgate.com');
    expect(renamed.body.user.passwordHash).toBeUndefined();

    const clash = await request(app)
      .patch(`/api/users/${seeded.id}`)
      .set('Cookie', cookie)
      .send({ email: 'taken@softgate.com' });
    expect(clash.status).toBe(400);
    expect(clash.body.error).toBe('Email taken');
    expect(other.email).toBe('taken@softgate.com');

    const bad = await request(app)
      .patch(`/api/users/${seeded.id}`)
      .set('Cookie', cookie)
      .send({ status: 'banned' });
    expect(bad.status).toBe(400);

    const missing = await request(app)
      .patch('/api/users/missing')
      .set('Cookie', cookie)
      .send({ displayName: 'Ghost' });
    expect(missing.status).toBe(404);

    const deleted = await request(app).delete(`/api/users/${seeded.id}`).set('Cookie', cookie);
    expect(deleted.status).toBe(200);
    expect(deleted.body.ok).toBe(true);

    const listed = await request(app).get('/api/users').set('Cookie', cookie);
    expect(listed.status).toBe(200);
    expect(listed.body.users).toHaveLength(1);
    expect(listed.body.users[0].id).toBe(other.id);

    const again = await request(app).delete(`/api/users/${seeded.id}`).set('Cookie', cookie);
    expect(again.status).toBe(404);
  });
});
