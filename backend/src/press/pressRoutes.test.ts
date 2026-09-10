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
import { createMemoryPressStore } from './memoryPressStore.js';
import { DEFAULT_PRESS_META, type PressStore } from './pressStore.js';

function appWithPress(press = createMemoryPressStore()) {
  return createApp({
    store: createMemoryStaffStore(),
    catalog: createMemoryCatalogStore(),
    coinPackages: createMemoryCoinPackageStore(),
    comments: createMemoryCommentStore(),
    readerUsers: createMemoryReaderUserStore(),
    notifications: createMemoryNotificationStore(),
    settings: createMemoryPlatformSettingsStore(),
    press,
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

const newsBody = {
  title: { en: 'Launch note', mm: 'စတင်မှု မှတ်ချက်' },
  body: {
    en: 'A public note when one exists.',
    mm: 'အများသုံး မှတ်ချက် ရှိလာသောအခါ။',
  },
};

const stillBody = {
  title: { en: 'Home', mm: 'ပင်မစာမျက်နှာ' },
  imageUrl: 'https://cdn.example/still-home.webp',
};

describe('press routes', () => {
  it('rejects unauthenticated reads', async () => {
    const res = await request(appWithPress()).get('/api/press');
    expect(res.status).toBe(401);
  });

  it('seeds today’s kit copy on first GET and forbids member writes', async () => {
    const app = appWithPress();
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

    const listed = await request(app).get('/api/press').set('Cookie', memberCookie);
    expect(listed.status).toBe(200);
    expect(listed.body.meta.copy.boilerplate.en).toBe(DEFAULT_PRESS_META.copy.boilerplate.en);
    expect(listed.body.meta.zipUrl).toBe('/press-kit/softgate-comic-press-kit.zip');
    expect(listed.body.meta.contactEmail).toBe('press@softgatecomic.com');

    const news = await request(app).get('/api/press/news').set('Cookie', memberCookie);
    expect(news.status).toBe(200);
    expect(news.body.news).toEqual([]);

    const denied = await request(app)
      .post('/api/press/news')
      .set('Cookie', memberCookie)
      .send(newsBody);
    expect(denied.status).toBe(403);
  });

  it('requires bilingual copy and rejects blob URLs', async () => {
    const app = appWithPress();
    const cookie = await registerOwner(app);

    const missingMm = await request(app)
      .post('/api/press/news')
      .set('Cookie', cookie)
      .send({
        title: { en: 'Launch note', mm: '   ' },
        body: newsBody.body,
      });
    expect(missingMm.status).toBe(400);

    const blobZip = await request(app)
      .patch('/api/press')
      .set('Cookie', cookie)
      .send({
        ...DEFAULT_PRESS_META,
        zipUrl: 'blob:https://localhost/1',
      });
    expect(blobZip.status).toBe(400);

    const blobStill = await request(app)
      .post('/api/press/stills')
      .set('Cookie', cookie)
      .send({ ...stillBody, imageUrl: 'blob:https://localhost/1' });
    expect(blobStill.status).toBe(400);
  });

  it('lets an admin save meta, news, and stills', async () => {
    const app = appWithPress();
    const cookie = await registerOwner(app);

    const patched = await request(app)
      .patch('/api/press')
      .set('Cookie', cookie)
      .send({
        ...DEFAULT_PRESS_META,
        contactEmail: 'desk@softgatecomic.com',
        spokespersonMemberId: 'member-1',
      });
    expect(patched.status).toBe(200);
    expect(patched.body.meta.contactEmail).toBe('desk@softgatecomic.com');
    expect(patched.body.meta.spokespersonMemberId).toBe('member-1');

    const createdNews = await request(app)
      .post('/api/press/news')
      .set('Cookie', cookie)
      .send(newsBody);
    expect(createdNews.status).toBe(201);
    expect(createdNews.body.item.title.en).toBe('Launch note');
    expect(createdNews.body.item.published).toBe(true);

    const createdStill = await request(app)
      .post('/api/press/stills')
      .set('Cookie', cookie)
      .send(stillBody);
    expect(createdStill.status).toBe(201);
    expect(createdStill.body.item.imageUrl).toBe('https://cdn.example/still-home.webp');

    const deleted = await request(app)
      .delete(`/api/press/news/${createdNews.body.item.id}`)
      .set('Cookie', cookie);
    expect(deleted.status).toBe(200);
    expect(deleted.body.ok).toBe(true);
  });

  it('returns seed meta and empty lists when Press tables are missing', async () => {
    const press: PressStore = {
      ...createMemoryPressStore(),
      getMeta: async () => {
        throw { code: 'P2021' };
      },
      listNews: async () => {
        throw { code: 'P2021' };
      },
      listStills: async () => {
        throw { code: 'P2021' };
      },
    };
    const app = appWithPress(press);
    const cookie = await registerOwner(app);

    const meta = await request(app).get('/api/press').set('Cookie', cookie);
    expect(meta.status).toBe(200);
    expect(meta.body.meta.copy.boilerplateTitle.en).toBe('About SoftGate Comic');

    const news = await request(app).get('/api/press/news').set('Cookie', cookie);
    expect(news.status).toBe(200);
    expect(news.body.news).toEqual([]);

    const stills = await request(app).get('/api/press/stills').set('Cookie', cookie);
    expect(stills.status).toBe(200);
    expect(stills.body.stills).toEqual([]);
  });
});
