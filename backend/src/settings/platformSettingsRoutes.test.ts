import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createMemoryStaffStore } from '../auth/memoryStaffStore.js';
import { createMemoryCatalogStore } from '../catalog/memoryCatalogStore.js';
import { createMemoryCoinPackageStore } from '../coins/memoryCoinPackageStore.js';
import { createMemoryCommentStore } from '../comments/memoryCommentStore.js';
import { createMemoryNotificationStore } from '../notifications/memoryNotificationStore.js';
import { createMemoryPlatformSettingsStore } from './memoryPlatformSettingsStore.js';
import { DEFAULT_PLATFORM_SETTINGS, type PlatformSettingsStore } from './platformSettingsStore.js';

function appWithSettings(settings: PlatformSettingsStore) {
  return createApp({
    store: createMemoryStaffStore(),
    catalog: createMemoryCatalogStore(),
    coinPackages: createMemoryCoinPackageStore(),
    comments: createMemoryCommentStore(),
    notifications: createMemoryNotificationStore(),
    settings,
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

const sampleWrite = {
  maintenanceMode: true,
  allowRegistration: false,
  contactEmail: 'ops@softgatecomic.com',
  defaultLanguage: 'mm' as const,
};

describe('platform settings routes', () => {
  it('rejects unauthenticated reads', async () => {
    const app = appWithSettings(createMemoryPlatformSettingsStore());
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(401);
  });

  it('returns fail-open defaults when empty and forbids member writes', async () => {
    const settings = createMemoryPlatformSettingsStore();
    const app = appWithSettings(settings);
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

    const listed = await request(app).get('/api/settings').set('Cookie', memberCookie);
    expect(listed.status).toBe(200);
    expect(listed.body.settings).toEqual(DEFAULT_PLATFORM_SETTINGS);

    const denied = await request(app)
      .patch('/api/settings')
      .set('Cookie', memberCookie)
      .send(sampleWrite);
    expect(denied.status).toBe(403);
  });

  it('upserts for admin and rejects invalid bodies', async () => {
    const app = appWithSettings(createMemoryPlatformSettingsStore());
    const cookie = await registerOwner(app);

    const saved = await request(app).patch('/api/settings').set('Cookie', cookie).send(sampleWrite);
    expect(saved.status).toBe(200);
    expect(saved.body.settings).toEqual(sampleWrite);

    const listed = await request(app).get('/api/settings').set('Cookie', cookie);
    expect(listed.status).toBe(200);
    expect(listed.body.settings).toEqual(sampleWrite);

    const myanmar = await request(app)
      .patch('/api/settings')
      .set('Cookie', cookie)
      .send({ ...sampleWrite, defaultLanguage: 'my', contactEmail: '' });
    expect(myanmar.status).toBe(200);
    expect(myanmar.body.settings.defaultLanguage).toBe('mm');
    expect(myanmar.body.settings.contactEmail).toBe('');

    const badLang = await request(app)
      .patch('/api/settings')
      .set('Cookie', cookie)
      .send({ ...sampleWrite, defaultLanguage: 'fr' });
    expect(badLang.status).toBe(400);

    const badBool = await request(app)
      .patch('/api/settings')
      .set('Cookie', cookie)
      .send({ ...sampleWrite, maintenanceMode: 'true' });
    expect(badBool.status).toBe(400);

    const junk = await request(app)
      .patch('/api/settings')
      .set('Cookie', cookie)
      .send({ isRead: true });
    expect(junk.status).toBe(400);
  });
});
