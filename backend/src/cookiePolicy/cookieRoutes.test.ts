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
import { createMemoryCookieStore } from './memoryCookieStore.js';
import { DEFAULT_COOKIE_META, DEFAULT_COOKIE_ROWS, type CookieStore } from './cookieStore.js';

function appWithCookies(cookies = createMemoryCookieStore()) {
  return createApp({
    store: createMemoryStaffStore(),
    catalog: createMemoryCatalogStore(),
    coinPackages: createMemoryCoinPackageStore(),
    comments: createMemoryCommentStore(),
    readerUsers: createMemoryReaderUserStore(),
    notifications: createMemoryNotificationStore(),
    settings: createMemoryPlatformSettingsStore(),
    cookies,
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

describe('cookie policy routes', () => {
  it('rejects unauthenticated reads', async () => {
    const res = await request(appWithCookies()).get('/api/cookies');
    expect(res.status).toBe(401);
  });

  it('seeds meta and 16 rows on first GET and forbids member writes', async () => {
    const app = appWithCookies();
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

    const listed = await request(app).get('/api/cookies').set('Cookie', memberCookie);
    expect(listed.status).toBe(200);
    expect(listed.body.meta.copy.cookiesTitle.en).toBe(DEFAULT_COOKIE_META.copy.cookiesTitle.en);
    expect(listed.body.meta.glance).toHaveLength(5);
    expect(listed.body.rows).toHaveLength(16);
    expect(listed.body.rows[0].storageKey).toBe('i18nextLng');
    expect(listed.body.meta.copy.analyticsCookiesDesc.en.startsWith('None.')).toBe(true);

    const denied = await request(app)
      .patch('/api/cookies')
      .set('Cookie', memberCookie)
      .send(DEFAULT_COOKIE_META);
    expect(denied.status).toBe(403);
  });

  it('requires bilingual copy, frozen storage keys, and immutable storageKey', async () => {
    const app = appWithCookies();
    const cookie = await registerOwner(app);
    await request(app).get('/api/cookies').set('Cookie', cookie);

    const missingMm = await request(app)
      .patch('/api/cookies')
      .set('Cookie', cookie)
      .send({
        ...DEFAULT_COOKIE_META,
        copy: {
          ...DEFAULT_COOKIE_META.copy,
          cookiesTitle: { en: 'Cookie Policy', mm: '   ' },
        },
      });
    expect(missingMm.status).toBe(400);

    const invented = await request(app)
      .post('/api/cookies/rows')
      .set('Cookie', cookie)
      .send({
        storageKey: 'tracking_pixel',
        label: { en: 'Track', mm: 'ခြေရာ' },
        description: { en: 'No', mm: 'မရှိ' },
        sortOrder: 99,
      });
    expect(invented.status).toBe(400);

    const duplicate = await request(app).post('/api/cookies/rows').set('Cookie', cookie).send({
      storageKey: 'i18nextLng',
      label: DEFAULT_COOKIE_ROWS[0]!.label,
      description: DEFAULT_COOKIE_ROWS[0]!.description,
      sortOrder: 99,
    });
    expect(duplicate.status).toBe(400);

    const immutable = await request(app)
      .patch('/api/cookies/rows/lang')
      .set('Cookie', cookie)
      .send({ storageKey: 'softgate_user' });
    expect(immutable.status).toBe(400);
  });

  it('lets an admin save meta, delete a row, and keep the list empty', async () => {
    const app = appWithCookies();
    const cookie = await registerOwner(app);

    const patched = await request(app)
      .patch('/api/cookies')
      .set('Cookie', cookie)
      .send({
        ...DEFAULT_COOKIE_META,
        effectiveDate: '2026-09-11',
      });
    expect(patched.status).toBe(200);
    expect(patched.body.meta.effectiveDate).toBe('2026-09-11');

    const listed = await request(app).get('/api/cookies').set('Cookie', cookie);
    for (const row of listed.body.rows as Array<{ id: string }>) {
      const deleted = await request(app)
        .delete(`/api/cookies/rows/${row.id}`)
        .set('Cookie', cookie);
      expect(deleted.status).toBe(200);
    }

    const empty = await request(app).get('/api/cookies').set('Cookie', cookie);
    expect(empty.body.rows).toEqual([]);
    expect(empty.body.meta.effectiveDate).toBe('2026-09-11');

    const restored = await request(app).post('/api/cookies/rows').set('Cookie', cookie).send({
      storageKey: 'i18nextLng',
      label: DEFAULT_COOKIE_ROWS[0]!.label,
      description: DEFAULT_COOKIE_ROWS[0]!.description,
      sortOrder: 1,
    });
    expect(restored.status).toBe(201);
    expect(restored.body.item.id).toBe('lang');
  });

  it('returns seed meta and rows when cookie tables are missing', async () => {
    const cookies: CookieStore = {
      ...createMemoryCookieStore(),
      getMeta: async () => {
        throw { code: 'P2021' };
      },
      listRows: async () => {
        throw { code: 'P2021' };
      },
    };
    const app = appWithCookies(cookies);
    const cookie = await registerOwner(app);
    const listed = await request(app).get('/api/cookies').set('Cookie', cookie);
    expect(listed.status).toBe(200);
    expect(listed.body.rows).toHaveLength(16);
    expect(listed.body.meta.copy.cookiesTitle.en).toBe('Cookie Policy');
  });
});
