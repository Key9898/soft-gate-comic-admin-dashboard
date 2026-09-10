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
import { PHOTO_FIRST_OF_YEAR_ERROR } from './aboutHistoryStore.js';
import type { AboutHistoryStore } from './aboutHistoryStore.js';
import { createMemoryAboutHistoryStore } from './memoryAboutHistoryStore.js';

const founded = {
  year: 2026,
  month: 1,
  title: { en: 'Founded', mm: 'တည်ထောင်ခြင်း' },
  description: {
    en: 'A Myanmar-first webtoon studio starts building a local reading portal.',
    mm: 'မြန်မာဦးစားပေး webtoon စတူဒီယိုက ဒေသခံ ဖတ်ရှုရေး portal တည်ဆောက်ရန် စတင်သည်။',
  },
};

const portal = {
  year: 2026,
  month: 3,
  title: { en: 'Portal', mm: 'Portal' },
  description: {
    en: 'Catalog, episode reader, and English plus Myanmar ship in the same product.',
    mm: 'Catalog၊ အပိုင်းဖတ်ရှုခြင်းနှင့် အင်္ဂလိပ်-မြန်မာကို ထုတ်ကုန်တစ်ခုတည်းတွင် တင်ဆက်သည်။',
  },
};

function appWithHistory() {
  return createApp({
    store: createMemoryStaffStore(),
    catalog: createMemoryCatalogStore(),
    coinPackages: createMemoryCoinPackageStore(),
    comments: createMemoryCommentStore(),
    readerUsers: createMemoryReaderUserStore(),
    notifications: createMemoryNotificationStore(),
    settings: createMemoryPlatformSettingsStore(),
    aboutHistory: createMemoryAboutHistoryStore(),
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

describe('about history routes', () => {
  it('rejects unauthenticated reads', async () => {
    const res = await request(appWithHistory()).get('/api/about/history');
    expect(res.status).toBe(401);
  });

  it('lets a member list and forbids member writes', async () => {
    const app = appWithHistory();
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

    const listed = await request(app).get('/api/about/history').set('Cookie', memberCookie);
    expect(listed.status).toBe(200);
    expect(listed.body.histories).toEqual([]);

    const denied = await request(app)
      .post('/api/about/history')
      .set('Cookie', memberCookie)
      .send(founded);
    expect(denied.status).toBe(403);
  });

  it('requires bilingual copy and a month from 1 to 12', async () => {
    const app = appWithHistory();
    const cookie = await registerOwner(app);

    const missingMm = await request(app)
      .post('/api/about/history')
      .set('Cookie', cookie)
      .send({
        year: 2026,
        month: 1,
        title: { en: 'Founded', mm: '   ' },
        description: founded.description,
      });
    expect(missingMm.status).toBe(400);

    const badMonth = await request(app)
      .post('/api/about/history')
      .set('Cookie', cookie)
      .send({
        ...founded,
        month: 13,
      });
    expect(badMonth.status).toBe(400);
  });

  it('allows a photo on the first published row and rejects it on the second', async () => {
    const app = appWithHistory();
    const cookie = await registerOwner(app);

    const first = await request(app)
      .post('/api/about/history')
      .set('Cookie', cookie)
      .send({ ...founded, photoUrl: 'https://cdn.example/founded.webp' });
    expect(first.status).toBe(201);
    expect(first.body.history.photoUrl).toBe('https://cdn.example/founded.webp');

    const second = await request(app)
      .post('/api/about/history')
      .set('Cookie', cookie)
      .send({ ...portal, photoUrl: 'https://cdn.example/portal.webp' });
    expect(second.status).toBe(400);
    expect(second.body.error).toBe(PHOTO_FIRST_OF_YEAR_ERROR);

    const okSecond = await request(app)
      .post('/api/about/history')
      .set('Cookie', cookie)
      .send(portal);
    expect(okSecond.status).toBe(201);
    expect(okSecond.body.history.photoUrl).toBeUndefined();
  });

  it('strips the photo when a reorder demotes the first row', async () => {
    const app = appWithHistory();
    const cookie = await registerOwner(app);

    const first = await request(app)
      .post('/api/about/history')
      .set('Cookie', cookie)
      .send({ ...founded, photoUrl: 'https://cdn.example/founded.webp' });
    const later = await request(app).post('/api/about/history').set('Cookie', cookie).send(portal);

    const demoted = await request(app)
      .patch(`/api/about/history/${first.body.history.id}`)
      .set('Cookie', cookie)
      .send({ month: 6 });
    expect(demoted.status).toBe(200);
    expect(demoted.body.history.photoUrl).toBeUndefined();
    expect(demoted.body.history.month).toBe(6);

    const listed = await request(app).get('/api/about/history').set('Cookie', cookie);
    const rows = listed.body.histories as Array<{ id: string; photoUrl?: string; month: number }>;
    expect(rows[0]?.id).toBe(later.body.history.id);
    expect(rows[0]?.photoUrl).toBeUndefined();
    expect(rows.find((row) => row.id === first.body.history.id)?.photoUrl).toBeUndefined();
  });

  it('rejects blob photo URLs and deletes a row', async () => {
    const app = appWithHistory();
    const cookie = await registerOwner(app);

    const blob = await request(app)
      .post('/api/about/history')
      .set('Cookie', cookie)
      .send({ ...founded, photoUrl: 'blob:https://localhost/1' });
    expect(blob.status).toBe(400);

    const created = await request(app)
      .post('/api/about/history')
      .set('Cookie', cookie)
      .send(founded);
    const deleted = await request(app)
      .delete(`/api/about/history/${created.body.history.id}`)
      .set('Cookie', cookie);
    expect(deleted.status).toBe(200);
    expect(deleted.body.ok).toBe(true);
  });

  it('returns an empty list when AboutHistory is missing', async () => {
    const aboutHistory: AboutHistoryStore = {
      ...createMemoryAboutHistoryStore(),
      list: async () => {
        throw { code: 'P2021' };
      },
    };
    const app = createApp({
      store: createMemoryStaffStore(),
      catalog: createMemoryCatalogStore(),
      coinPackages: createMemoryCoinPackageStore(),
      comments: createMemoryCommentStore(),
      readerUsers: createMemoryReaderUserStore(),
      notifications: createMemoryNotificationStore(),
      settings: createMemoryPlatformSettingsStore(),
      aboutHistory,
    });
    const cookie = await registerOwner(app);
    const listed = await request(app).get('/api/about/history').set('Cookie', cookie);
    expect(listed.status).toBe(200);
    expect(listed.body.histories).toEqual([]);
  });
});
