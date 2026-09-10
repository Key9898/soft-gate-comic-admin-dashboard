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
import { createMemoryFaqStore } from './memoryFaqStore.js';
import { DEFAULT_FAQ_ITEMS, type FaqStore } from './faqStore.js';

function appWithFaq(faq = createMemoryFaqStore()) {
  return createApp({
    store: createMemoryStaffStore(),
    catalog: createMemoryCatalogStore(),
    coinPackages: createMemoryCoinPackageStore(),
    comments: createMemoryCommentStore(),
    readerUsers: createMemoryReaderUserStore(),
    notifications: createMemoryNotificationStore(),
    settings: createMemoryPlatformSettingsStore(),
    faq,
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

const itemBody = {
  category: 'general',
  question: { en: 'New question', mm: 'မေးခွန်းအသစ်' },
  answer: { en: 'New answer', mm: 'အဖြေအသစ်' },
  sortOrder: 21,
  published: true,
};

describe('faq routes', () => {
  it('rejects unauthenticated reads', async () => {
    const res = await request(appWithFaq()).get('/api/faq');
    expect(res.status).toBe(401);
  });

  it('seeds q1–q20 on first GET and forbids member writes', async () => {
    const app = appWithFaq();
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

    const listed = await request(app).get('/api/faq').set('Cookie', memberCookie);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(20);
    expect(listed.body.items[0].id).toBe('q1');
    expect(listed.body.items[0].question.en).toBe(DEFAULT_FAQ_ITEMS[0]?.question.en);

    const denied = await request(app).post('/api/faq').set('Cookie', memberCookie).send(itemBody);
    expect(denied.status).toBe(403);
  });

  it('requires bilingual copy and rejects unknown relatedTo', async () => {
    const app = appWithFaq();
    const cookie = await registerOwner(app);

    const missingMm = await request(app)
      .post('/api/faq')
      .set('Cookie', cookie)
      .send({
        ...itemBody,
        question: { en: 'New question', mm: '   ' },
      });
    expect(missingMm.status).toBe(400);

    const badRelated = await request(app)
      .post('/api/faq')
      .set('Cookie', cookie)
      .send({ ...itemBody, relatedTo: '/admin' });
    expect(badRelated.status).toBe(400);
  });

  it('lets an admin create, patch, delete, and keeps an empty list empty', async () => {
    const app = appWithFaq();
    const cookie = await registerOwner(app);

    const listed = await request(app).get('/api/faq').set('Cookie', cookie);
    expect(listed.status).toBe(200);
    const ids = listed.body.items.map((row: { id: string }) => row.id) as string[];

    for (const id of ids) {
      const deleted = await request(app).delete(`/api/faq/${id}`).set('Cookie', cookie);
      expect(deleted.status).toBe(200);
    }

    const empty = await request(app).get('/api/faq').set('Cookie', cookie);
    expect(empty.status).toBe(200);
    expect(empty.body.items).toEqual([]);

    const created = await request(app).post('/api/faq').set('Cookie', cookie).send(itemBody);
    expect(created.status).toBe(201);
    expect(created.body.item.id).toBe('q21');
    expect(created.body.item.question.en).toBe('New question');

    const patched = await request(app)
      .patch('/api/faq/q21')
      .set('Cookie', cookie)
      .send({
        relatedTo: '/coins',
        relatedLabel: { en: 'Coins', mm: 'ဒင်္ဂါး' },
      });
    expect(patched.status).toBe(200);
    expect(patched.body.item.relatedTo).toBe('/coins');

    const removed = await request(app).delete('/api/faq/q21').set('Cookie', cookie);
    expect(removed.status).toBe(200);
    const after = await request(app).get('/api/faq').set('Cookie', cookie);
    expect(after.body.items).toEqual([]);
  });

  it('returns seed items when FAQ tables are missing', async () => {
    const faq: FaqStore = {
      ...createMemoryFaqStore(),
      listItems: async () => {
        throw { code: 'P2021' };
      },
    };
    const app = appWithFaq(faq);
    const cookie = await registerOwner(app);
    const listed = await request(app).get('/api/faq').set('Cookie', cookie);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(20);
    expect(listed.body.items[0].id).toBe('q1');
  });
});
