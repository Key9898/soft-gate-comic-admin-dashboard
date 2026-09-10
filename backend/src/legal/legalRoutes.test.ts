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
import { createMemoryLegalStore } from './memoryLegalStore.js';
import { DEFAULT_PRIVACY_META, DEFAULT_TERMS_META, type LegalStore } from './legalStore.js';

function appWithLegal(legal = createMemoryLegalStore()) {
  return createApp({
    store: createMemoryStaffStore(),
    catalog: createMemoryCatalogStore(),
    coinPackages: createMemoryCoinPackageStore(),
    comments: createMemoryCommentStore(),
    readerUsers: createMemoryReaderUserStore(),
    notifications: createMemoryNotificationStore(),
    settings: createMemoryPlatformSettingsStore(),
    legal,
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

const privacyBodySection = {
  slug: 'extra',
  kind: 'body',
  headingLevel: 'h2',
  title: { en: 'Extra heading', mm: 'အပို ခေါင်းစဉ်' },
  body: { en: 'Extra body copy.', mm: 'အပို စာသား။' },
};

describe('legal routes', () => {
  it('rejects unauthenticated reads', async () => {
    const res = await request(appWithLegal()).get('/api/legal/privacy');
    expect(res.status).toBe(401);
  });

  it('seeds today’s privacy and terms copy on first GET and forbids member writes', async () => {
    const app = appWithLegal();
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

    const privacy = await request(app).get('/api/legal/privacy').set('Cookie', memberCookie);
    expect(privacy.status).toBe(200);
    expect(privacy.body.meta.seoDesc.en).toBe(DEFAULT_PRIVACY_META.seoDesc.en);
    expect(privacy.body.meta.glance[0].en).toMatch(/does not send your data to any server/);
    expect(privacy.body.meta.effectiveDate).toBe('2026-09-10');

    const privacySections = await request(app)
      .get('/api/legal/privacy/sections')
      .set('Cookie', memberCookie);
    expect(privacySections.status).toBe(200);
    expect(privacySections.body.sections.map((row: { slug: string }) => row.slug)).toEqual([
      'collect',
      'personal',
      'usage',
      'reading',
      'use',
      'sharing',
      'security',
      'rights',
      'children',
    ]);

    const terms = await request(app).get('/api/legal/terms').set('Cookie', memberCookie);
    expect(terms.status).toBe(200);
    expect(terms.body.meta.seoDesc.en).toBe(DEFAULT_TERMS_META.seoDesc.en);

    const termsSections = await request(app)
      .get('/api/legal/terms/sections')
      .set('Cookie', memberCookie);
    expect(termsSections.status).toBe(200);
    expect(termsSections.body.sections.some((row: { slug: string }) => row.slug === 'coins')).toBe(
      true,
    );

    const denied = await request(app)
      .post('/api/legal/privacy/sections')
      .set('Cookie', memberCookie)
      .send(privacyBodySection);
    expect(denied.status).toBe(403);
  });

  it('rejects reserved slugs, HTML, empty mm, and privacy-rights on Terms', async () => {
    const app = appWithLegal();
    const cookie = await registerOwner(app);

    const reserved = await request(app)
      .post('/api/legal/privacy/sections')
      .set('Cookie', cookie)
      .send({ ...privacyBodySection, slug: 'glance' });
    expect(reserved.status).toBe(400);

    const html = await request(app)
      .post('/api/legal/privacy/sections')
      .set('Cookie', cookie)
      .send({
        ...privacyBodySection,
        body: { en: '<script>x</script>', mm: 'စာသား' },
      });
    expect(html.status).toBe(400);

    const missingMm = await request(app)
      .post('/api/legal/privacy/sections')
      .set('Cookie', cookie)
      .send({
        ...privacyBodySection,
        title: { en: 'Extra heading', mm: '   ' },
      });
    expect(missingMm.status).toBe(400);

    const termsRights = await request(app)
      .post('/api/legal/terms/sections')
      .set('Cookie', cookie)
      .send({
        ...privacyBodySection,
        slug: 'rights-extra',
        kind: 'privacy-rights',
        bullets: [
          { en: 'Profile', mm: 'ပရိုဖိုင်' },
          { en: 'Delete', mm: 'ဖျက်' },
          { en: 'Clear', mm: 'ရှင်း' },
          { en: 'Guest', mm: 'ဧည့်သည်' },
        ],
      });
    expect(termsRights.status).toBe(400);
  });

  it('lets an admin save meta and sections', async () => {
    const app = appWithLegal();
    const cookie = await registerOwner(app);

    const patched = await request(app)
      .patch('/api/legal/privacy')
      .set('Cookie', cookie)
      .send({
        ...DEFAULT_PRIVACY_META,
        glance: [
          ...DEFAULT_PRIVACY_META.glance.slice(0, 4),
          { en: 'Guests still have no account to delete.', mm: 'ဧည့်သည်များတွင် အကောင့် မရှိပါ။' },
        ],
      });
    expect(patched.status).toBe(200);
    expect(patched.body.meta.glance[4].en).toMatch(/Guests still have no account/);

    const created = await request(app)
      .post('/api/legal/privacy/sections')
      .set('Cookie', cookie)
      .send(privacyBodySection);
    expect(created.status).toBe(201);
    expect(created.body.item.slug).toBe('extra');
    expect(created.body.item.published).toBe(true);

    const duplicate = await request(app)
      .post('/api/legal/privacy/sections')
      .set('Cookie', cookie)
      .send(privacyBodySection);
    expect(duplicate.status).toBe(400);

    const deleted = await request(app)
      .delete(`/api/legal/privacy/sections/${created.body.item.id}`)
      .set('Cookie', cookie);
    expect(deleted.status).toBe(200);
    expect(deleted.body.ok).toBe(true);
  });

  it('returns seed meta and sections when legal tables are missing', async () => {
    const legal: LegalStore = {
      ...createMemoryLegalStore(),
      getMeta: async () => {
        throw { code: 'P2021' };
      },
      listSections: async () => {
        throw { code: 'P2021' };
      },
    };
    const app = appWithLegal(legal);
    const cookie = await registerOwner(app);

    const meta = await request(app).get('/api/legal/privacy').set('Cookie', cookie);
    expect(meta.status).toBe(200);
    expect(meta.body.meta.glance[0].en).toMatch(/does not send your data to any server/);

    const sections = await request(app).get('/api/legal/privacy/sections').set('Cookie', cookie);
    expect(sections.status).toBe(200);
    expect(sections.body.sections[0].slug).toBe('collect');
  });
});
