import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createMemoryStaffStore } from '../auth/memoryStaffStore.js';
import { createMemoryCatalogStore } from '../catalog/memoryCatalogStore.js';
import { createMemoryCoinPackageStore } from '../coins/memoryCoinPackageStore.js';
import { createMemoryCommentStore } from '../comments/memoryCommentStore.js';
import { createMemoryNotificationStore } from '../notifications/memoryNotificationStore.js';
import { createMemoryPlatformSettingsStore } from '../settings/memoryPlatformSettingsStore.js';
import { createMemoryReaderUserStore } from '../users/memoryReaderUserStore.js';
import { createMemoryBroadcastStore } from './memoryBroadcastStore.js';
import {
  unconfiguredWebsiteClient,
  type BroadcastSendInput,
  type WebsiteBroadcastClient,
} from './websiteBroadcastClient.js';

const validBody = {
  type: 'system',
  title: { en: 'Maintenance tonight', mm: 'ဒီည ပြုပြင်မည်' },
  message: { en: 'The reader site will pause.', mm: 'ဖတ်ရှုစာမျက်နှာ ရပ်နားမည်။' },
  href: '/help',
  audience: { all: true },
};

function mockWebsite(overrides: Partial<WebsiteBroadcastClient> = {}): WebsiteBroadcastClient {
  return {
    configured: true,
    async searchReaders() {
      return [{ id: 'r1', email: 'reader@softgate.com', displayName: 'Reader' }];
    },
    async preview() {
      return { readers: 2, withEmail: 2, withPush: 1 };
    },
    async send(input: BroadcastSendInput) {
      return {
        campaignId: input.campaignId,
        inbox: 2,
        emailed: 2,
        pushed: 1,
        skippedPref: 0,
      };
    },
    ...overrides,
  };
}

function appWithBroadcasts(website: WebsiteBroadcastClient = mockWebsite()) {
  return createApp({
    store: createMemoryStaffStore(),
    catalog: createMemoryCatalogStore(),
    coinPackages: createMemoryCoinPackageStore(),
    comments: createMemoryCommentStore(),
    readerUsers: createMemoryReaderUserStore(),
    notifications: createMemoryNotificationStore(),
    broadcasts: createMemoryBroadcastStore(),
    websiteBroadcasts: website,
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

describe('reader broadcast routes', () => {
  it('rejects unauthenticated reads', async () => {
    const res = await request(appWithBroadcasts()).get('/api/reader-broadcasts');
    expect(res.status).toBe(401);
  });

  it('lets a member list and forbids member writes', async () => {
    const app = appWithBroadcasts();
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

    const listed = await request(app).get('/api/reader-broadcasts').set('Cookie', memberCookie);
    expect(listed.status).toBe(200);
    expect(listed.body.broadcasts).toEqual([]);

    const denied = await request(app)
      .post('/api/reader-broadcasts')
      .set('Cookie', memberCookie)
      .send(validBody);
    expect(denied.status).toBe(403);

    const deniedPreview = await request(app)
      .post('/api/reader-broadcasts/preview')
      .set('Cookie', memberCookie)
      .send({ audience: { all: true } });
    expect(deniedPreview.status).toBe(403);
  });

  it('returns 503 when the website service is not configured', async () => {
    const app = appWithBroadcasts(unconfiguredWebsiteClient());
    const cookie = await registerOwner(app);
    const listed = await request(app).get('/api/reader-broadcasts').set('Cookie', cookie);
    expect(listed.status).toBe(200);
    expect(listed.body.broadcasts).toEqual([]);

    const preview = await request(app)
      .post('/api/reader-broadcasts/preview')
      .set('Cookie', cookie)
      .send({ audience: { all: true } });
    expect(preview.status).toBe(503);

    const res = await request(app)
      .post('/api/reader-broadcasts')
      .set('Cookie', cookie)
      .send(validBody);
    expect(res.status).toBe(503);
    expect(res.body.error).toBe('Reader broadcast is not configured');
  });

  it('rejects missing mm copy', async () => {
    const app = appWithBroadcasts();
    const cookie = await registerOwner(app);
    const res = await request(app)
      .post('/api/reader-broadcasts')
      .set('Cookie', cookie)
      .send({
        ...validBody,
        title: { en: 'Maintenance tonight', mm: '  ' },
      });
    expect(res.status).toBe(400);
  });

  it('sends for admin and stores counts', async () => {
    const app = appWithBroadcasts();
    const cookie = await registerOwner(app);
    const res = await request(app)
      .post('/api/reader-broadcasts')
      .set('Cookie', cookie)
      .send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.broadcast.status).toBe('sent');
    expect(res.body.broadcast.title.mm).toBe('ဒီည ပြုပြင်မည်');
    expect(res.body.broadcast.inboxCount).toBe(2);
    expect(res.body.broadcast.pushed).toBe(1);
    expect(res.body.broadcast.href).toBe('/help');

    const listed = await request(app).get('/api/reader-broadcasts').set('Cookie', cookie);
    expect(listed.body.broadcasts).toHaveLength(1);
    expect(listed.body.broadcasts[0].status).toBe('sent');
  });

  it('stores failed when the website send fails', async () => {
    const app = appWithBroadcasts(
      mockWebsite({
        async send() {
          throw new Error('Website down');
        },
      }),
    );
    const cookie = await registerOwner(app);
    const res = await request(app)
      .post('/api/reader-broadcasts')
      .set('Cookie', cookie)
      .send(validBody);
    expect(res.status).toBe(502);
    expect(res.body.error).toBe('Website down');
    expect(res.body.broadcast.status).toBe('failed');

    const listed = await request(app).get('/api/reader-broadcasts').set('Cookie', cookie);
    expect(listed.body.broadcasts[0].status).toBe('failed');
    expect(listed.body.broadcasts[0].failureReason).toBe('Website down');
  });
});
