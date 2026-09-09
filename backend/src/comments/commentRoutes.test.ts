import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createMemoryStaffStore } from '../auth/memoryStaffStore.js';
import { createMemoryCatalogStore } from '../catalog/memoryCatalogStore.js';
import { createMemoryCoinPackageStore } from '../coins/memoryCoinPackageStore.js';
import { createMemoryCommentStore } from './memoryCommentStore.js';
import { createMemoryNotificationStore } from '../notifications/memoryNotificationStore.js';
import { createMemoryPlatformSettingsStore } from '../settings/memoryPlatformSettingsStore.js';
import { createMemoryReaderUserStore } from '../users/memoryReaderUserStore.js';
import type { CommentStore, CommentWrite } from './commentStore.js';

const sampleWrite: CommentWrite = {
  episodeKey: 'series-1:1',
  userId: 'u1',
  content: 'Hello',
  reported: true,
};

function appWithComments(comments: CommentStore) {
  return createApp({
    store: createMemoryStaffStore(),
    catalog: createMemoryCatalogStore(),
    coinPackages: createMemoryCoinPackageStore(),
    comments,
    readerUsers: createMemoryReaderUserStore(),
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
    expect(listed.body.comments[0].reported).toBe(true);

    const denied = await request(app)
      .patch(`/api/comments/${listed.body.comments[0].id}`)
      .set('Cookie', memberCookie)
      .send({ reported: false });
    expect(denied.status).toBe(403);
  });

  it('toggles reported and hard-deletes for admin', async () => {
    const comments = createMemoryCommentStore();
    const seeded = await comments.create(sampleWrite);
    const app = appWithComments(comments);
    const cookie = await registerOwner(app);

    const cleared = await request(app)
      .patch(`/api/comments/${seeded.id}`)
      .set('Cookie', cookie)
      .send({ reported: false });
    expect(cleared.status).toBe(200);
    expect(cleared.body.comment.reported).toBe(false);
    expect(cleared.body.comment.createdAt).toBe(seeded.createdAt);
    expect(cleared.body.comment.content).toBe('Hello');

    const flagged = await request(app)
      .patch(`/api/comments/${seeded.id}`)
      .set('Cookie', cookie)
      .send({ reported: true });
    expect(flagged.status).toBe(200);
    expect(flagged.body.comment.reported).toBe(true);

    const reportedOnly = await request(app)
      .get('/api/comments?reported=true')
      .set('Cookie', cookie);
    expect(reportedOnly.status).toBe(200);
    expect(reportedOnly.body.comments).toHaveLength(1);

    const bad = await request(app)
      .patch(`/api/comments/${seeded.id}`)
      .set('Cookie', cookie)
      .send({ status: 'hidden' });
    expect(bad.status).toBe(400);

    const missing = await request(app)
      .patch('/api/comments/missing')
      .set('Cookie', cookie)
      .send({ reported: true });
    expect(missing.status).toBe(404);

    const deleted = await request(app).delete(`/api/comments/${seeded.id}`).set('Cookie', cookie);
    expect(deleted.status).toBe(200);
    expect(deleted.body.ok).toBe(true);

    const listed = await request(app).get('/api/comments').set('Cookie', cookie);
    expect(listed.status).toBe(200);
    expect(listed.body.comments).toHaveLength(0);

    const again = await request(app).delete(`/api/comments/${seeded.id}`).set('Cookie', cookie);
    expect(again.status).toBe(404);

    const gone = await request(app).delete('/api/comments/missing').set('Cookie', cookie);
    expect(gone.status).toBe(404);
  });
});
