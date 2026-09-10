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
import { DEFAULT_ABOUT_TEAM_META } from './aboutTeamStore.js';
import { createMemoryAboutTeamStore } from './memoryAboutTeamStore.js';

const founder = {
  name: { en: 'Nandar Aye', mm: 'နန္ဒာအေး' },
  role: { en: 'Founder', mm: 'တည်ထောင်သူ' },
};

const editorial = {
  name: { en: 'Min Khant', mm: 'မင်းခန့်' },
  role: { en: 'Editorial', mm: 'အယ်ဒီတာ' },
};

function appWithTeam() {
  return createApp({
    store: createMemoryStaffStore(),
    catalog: createMemoryCatalogStore(),
    coinPackages: createMemoryCoinPackageStore(),
    comments: createMemoryCommentStore(),
    readerUsers: createMemoryReaderUserStore(),
    notifications: createMemoryNotificationStore(),
    settings: createMemoryPlatformSettingsStore(),
    aboutTeam: createMemoryAboutTeamStore(),
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

describe('about team routes', () => {
  it('rejects unauthenticated reads', async () => {
    const res = await request(appWithTeam()).get('/api/about/team');
    expect(res.status).toBe(401);
  });

  it('lets a member list and forbids member writes', async () => {
    const app = appWithTeam();
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

    const listed = await request(app).get('/api/about/team').set('Cookie', memberCookie);
    expect(listed.status).toBe(200);
    expect(listed.body.members).toEqual([]);

    const meta = await request(app).get('/api/about/team/meta').set('Cookie', memberCookie);
    expect(meta.status).toBe(200);
    expect(meta.body.meta).toEqual(DEFAULT_ABOUT_TEAM_META);

    const denied = await request(app)
      .post('/api/about/team')
      .set('Cookie', memberCookie)
      .send(founder);
    expect(denied.status).toBe(403);

    const deniedMeta = await request(app)
      .patch('/api/about/team/meta')
      .set('Cookie', memberCookie)
      .send(DEFAULT_ABOUT_TEAM_META);
    expect(deniedMeta.status).toBe(403);
  });

  it('requires bilingual copy and rejects blob photos', async () => {
    const app = appWithTeam();
    const cookie = await registerOwner(app);

    const missingMm = await request(app)
      .post('/api/about/team')
      .set('Cookie', cookie)
      .send({
        name: { en: 'Nandar Aye', mm: '   ' },
        role: founder.role,
      });
    expect(missingMm.status).toBe(400);

    const blob = await request(app)
      .post('/api/about/team')
      .set('Cookie', cookie)
      .send({
        ...founder,
        photoUrl: 'blob:http://localhost/photo',
      });
    expect(blob.status).toBe(400);
  });

  it('allows a photo on a second member', async () => {
    const app = appWithTeam();
    const cookie = await registerOwner(app);

    const first = await request(app)
      .post('/api/about/team')
      .set('Cookie', cookie)
      .send({ ...founder, photoUrl: 'https://cdn.example/founder.webp' });
    expect(first.status).toBe(201);
    expect(first.body.member.photoUrl).toBe('https://cdn.example/founder.webp');
    expect(first.body.member.sortOrder).toBe(0);
    expect(first.body.member.published).toBe(true);

    const second = await request(app)
      .post('/api/about/team')
      .set('Cookie', cookie)
      .send({ ...editorial, photoUrl: 'https://cdn.example/editorial.webp' });
    expect(second.status).toBe(201);
    expect(second.body.member.photoUrl).toBe('https://cdn.example/editorial.webp');

    const listed = await request(app).get('/api/about/team').set('Cookie', cookie);
    expect(listed.status).toBe(200);
    expect(listed.body.members).toHaveLength(2);
  });

  it('patches team meta and keeps GET fail-open copy until then', async () => {
    const app = appWithTeam();
    const cookie = await registerOwner(app);

    const before = await request(app).get('/api/about/team/meta').set('Cookie', cookie);
    expect(before.status).toBe(200);
    expect(before.body.meta).toEqual(DEFAULT_ABOUT_TEAM_META);

    const patched = await request(app)
      .patch('/api/about/team/meta')
      .set('Cookie', cookie)
      .send({
        deck: { en: 'Studio roster', mm: 'စတူဒီယို စာရင်း' },
        standInNote: { en: 'Stand-in note', mm: 'ယာယီ မှတ်ချက်' },
        standInVisible: false,
      });
    expect(patched.status).toBe(200);
    expect(patched.body.meta.standInVisible).toBe(false);
    expect(patched.body.meta.deck.en).toBe('Studio roster');

    const missingMm = await request(app)
      .patch('/api/about/team/meta')
      .set('Cookie', cookie)
      .send({
        deck: { en: 'Studio roster', mm: '   ' },
        standInNote: { en: 'Stand-in note', mm: 'ယာယီ မှတ်ချက်' },
        standInVisible: true,
      });
    expect(missingMm.status).toBe(400);
  });
});
