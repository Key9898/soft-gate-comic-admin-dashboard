import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createMemoryStaffStore } from '../auth/memoryStaffStore.js';
import { createMemoryCatalogStore } from '../catalog/memoryCatalogStore.js';
import { createMemoryCoinPackageStore } from '../coins/memoryCoinPackageStore.js';
import { createMemoryCommentStore } from './memoryCommentStore.js';
import { createMemoryNotificationStore } from '../notifications/memoryNotificationStore.js';
import { createMemoryPlatformSettingsStore } from '../settings/memoryPlatformSettingsStore.js';
import type { CommentStore, CommentWrite } from './commentStore.js';

const sampleUser = {
  id: 'u1',
  email: 'reader@softgate.com',
  username: 'reader',
  displayName: 'Reader',
  coinBalance: 0,
  status: 'active' as const,
  createdAt: '2026-04-25T10:00:00.000Z',
};

const sampleWrite: CommentWrite = {
  userId: 'u1',
  user: sampleUser,
  webtoonId: 'w1',
  episodeId: 'e1',
  content: { en: 'Hello', mm: '' },
  likeCount: 2,
  status: 'visible',
};

function appWithComments(comments: CommentStore) {
  return createApp({
    store: createMemoryStaffStore(),
    catalog: createMemoryCatalogStore(),
    coinPackages: createMemoryCoinPackageStore(),
    comments,
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

describe('comment routes', () => {
  it('rejects unauthenticated reads', async () => {
    const app = appWithComments(createMemoryCommentStore());
    const res = await request(app).get('/api/comments');
    expect(res.status).toBe(401);
  });

  it('lets a member read and forbids member writes', async () => {
    const comments = createMemoryCommentStore();
    await comments.create(sampleWrite);
    const app = appWithComments(comments);
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

    const listed = await request(app).get('/api/comments').set('Cookie', memberCookie);
    expect(listed.status).toBe(200);
    expect(listed.body.comments).toHaveLength(1);

    const denied = await request(app)
      .patch(`/api/comments/${listed.body.comments[0].id}`)
      .set('Cookie', memberCookie)
      .send({ status: 'hidden' });
    expect(denied.status).toBe(403);
  });

  it('hides, shows, and soft-deletes for admin', async () => {
    const comments = createMemoryCommentStore();
    const seeded = await comments.create(sampleWrite);
    const app = appWithComments(comments);
    const cookie = await registerOwner(app);

    const hidden = await request(app)
      .patch(`/api/comments/${seeded.id}`)
      .set('Cookie', cookie)
      .send({ status: 'hidden' });
    expect(hidden.status).toBe(200);
    expect(hidden.body.comment.status).toBe('hidden');
    expect(hidden.body.comment.createdAt).toBe(seeded.createdAt);

    const shown = await request(app)
      .patch(`/api/comments/${seeded.id}`)
      .set('Cookie', cookie)
      .send({ status: 'visible' });
    expect(shown.status).toBe(200);
    expect(shown.body.comment.status).toBe('visible');

    const bad = await request(app)
      .patch(`/api/comments/${seeded.id}`)
      .set('Cookie', cookie)
      .send({ status: 'archived' });
    expect(bad.status).toBe(400);

    const missing = await request(app)
      .patch('/api/comments/missing')
      .set('Cookie', cookie)
      .send({ status: 'hidden' });
    expect(missing.status).toBe(404);

    const deleted = await request(app).delete(`/api/comments/${seeded.id}`).set('Cookie', cookie);
    expect(deleted.status).toBe(200);
    expect(deleted.body.ok).toBe(true);

    const listed = await request(app).get('/api/comments').set('Cookie', cookie);
    expect(listed.status).toBe(200);
    expect(listed.body.comments).toHaveLength(1);
    expect(listed.body.comments[0].status).toBe('deleted');

    const again = await request(app).delete(`/api/comments/${seeded.id}`).set('Cookie', cookie);
    expect(again.status).toBe(200);

    const gone = await request(app).delete('/api/comments/missing').set('Cookie', cookie);
    expect(gone.status).toBe(404);
  });
});
