import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createMemoryStaffStore } from '../auth/memoryStaffStore.js';
import { createMemoryCatalogStore } from './memoryCatalogStore.js';

function appWithCatalog() {
  return createApp({ store: createMemoryStaffStore(), catalog: createMemoryCatalogStore() });
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

describe('catalog routes', () => {
  it('lets a member write catalog and a viewer only read', async () => {
    const app = appWithCatalog();
    const ownerCookie = await registerOwner(app);

    const invited = await request(app)
      .post('/api/staff/invites')
      .set('Cookie', ownerCookie)
      .send({ email: 'viewer@softgate.com', role: 'viewer' });
    const accepted = await request(app).post('/api/staff/invites/accept').send({
      token: invited.body.token,
      password: 'password1',
      displayName: 'Viewer',
    });
    const viewerCookie = accepted.headers['set-cookie'] as string[];

    const listed = await request(app).get('/api/authors').set('Cookie', viewerCookie);
    expect(listed.status).toBe(200);
    expect(listed.body.authors).toEqual([]);

    const denied = await request(app)
      .post('/api/authors')
      .set('Cookie', viewerCookie)
      .send({ name: { en: 'Nope', mm: '' } });
    expect(denied.status).toBe(403);

    const created = await request(app)
      .post('/api/authors')
      .set('Cookie', ownerCookie)
      .send({ name: { en: 'Ko Myint', mm: 'ကိုမြင့်' } });
    expect(created.status).toBe(201);
    expect(created.body.author.name.en).toBe('Ko Myint');
    expect(created.body.author.followerCount).toBe(0);
    expect(created.body.author.webtoonCount).toBe(0);
  });

  it('enforces genre, spotlight, schedule, and delete guards', async () => {
    const app = appWithCatalog();
    const cookie = await registerOwner(app);

    const author = await request(app)
      .post('/api/authors')
      .set('Cookie', cookie)
      .send({ name: { en: 'Author', mm: '' } });
    const genre = await request(app)
      .post('/api/genres')
      .set('Cookie', cookie)
      .send({ name: { en: 'Action', mm: '' }, slug: 'Action' });
    expect(genre.status).toBe(201);
    expect(genre.body.genre.slug).toBe('action');

    const slugLocked = await request(app)
      .patch(`/api/genres/${genre.body.genre.id}`)
      .set('Cookie', cookie)
      .send({ slug: 'drama' });
    expect(slugLocked.status).toBe(400);

    const unknownGenre = await request(app)
      .post('/api/webtoons')
      .set('Cookie', cookie)
      .send({
        title: { en: 'Title', mm: '' },
        authorId: author.body.author.id,
        contentRating: 'all',
        status: 'ongoing',
        genres: ['missing'],
      });
    expect(unknownGenre.status).toBe(400);

    const webtoon = await request(app)
      .post('/api/webtoons')
      .set('Cookie', cookie)
      .send({
        title: { en: 'Flagged', mm: '' },
        authorId: author.body.author.id,
        contentRating: '13',
        status: 'ongoing',
        genres: ['action'],
        spotlight: true,
        spotlightOrder: 1,
      });
    expect(webtoon.status).toBe(201);
    expect(webtoon.body.webtoon.genres).toEqual(['action']);
    expect(webtoon.body.webtoon.spotlightOrder).toBe(1);
    expect(webtoon.body.webtoon.rating).toBe(0);

    const takenOrder = await request(app)
      .post('/api/webtoons')
      .set('Cookie', cookie)
      .send({
        title: { en: 'Also flagged', mm: '' },
        authorId: author.body.author.id,
        contentRating: 'all',
        status: 'draft',
        spotlight: true,
        spotlightOrder: 1,
      });
    expect(takenOrder.status).toBe(409);

    const assignedGenre = await request(app)
      .delete(`/api/genres/${genre.body.genre.id}`)
      .set('Cookie', cookie);
    expect(assignedGenre.status).toBe(409);

    const scheduledMissing = await request(app)
      .post('/api/episodes')
      .set('Cookie', cookie)
      .send({
        webtoonId: webtoon.body.webtoon.id,
        title: { en: 'Ep 1', mm: '' },
        status: 'scheduled',
      });
    expect(scheduledMissing.status).toBe(400);

    const episode = await request(app)
      .post('/api/episodes')
      .set('Cookie', cookie)
      .send({
        webtoonId: webtoon.body.webtoon.id,
        title: { en: 'Ep 1', mm: '' },
        status: 'scheduled',
        scheduledAt: '2026-08-24T10:00:00.000Z',
      });
    expect(episode.status).toBe(201);
    expect(episode.body.episode.episodeNumber).toBe(1);
    expect(episode.body.episode.webtoonTitle.en).toBe('Flagged');
    expect(episode.body.episode.scheduledAt).toBe('2026-08-24T10:00:00.000Z');

    const blockedWebtoon = await request(app)
      .delete(`/api/webtoons/${webtoon.body.webtoon.id}`)
      .set('Cookie', cookie);
    expect(blockedWebtoon.status).toBe(409);

    const unscheduled = await request(app)
      .patch(`/api/episodes/${episode.body.episode.id}`)
      .set('Cookie', cookie)
      .send({ status: 'draft' });
    expect(unscheduled.status).toBe(200);
    expect(unscheduled.body.episode.status).toBe('draft');
    expect(unscheduled.body.episode.scheduledAt).toBeUndefined();

    const move = await request(app)
      .patch(`/api/episodes/${episode.body.episode.id}`)
      .set('Cookie', cookie)
      .send({ webtoonId: 'other' });
    expect(move.status).toBe(400);

    await request(app).delete(`/api/episodes/${episode.body.episode.id}`).set('Cookie', cookie);
    const deletedWebtoon = await request(app)
      .delete(`/api/webtoons/${webtoon.body.webtoon.id}`)
      .set('Cookie', cookie);
    expect(deletedWebtoon.status).toBe(200);

    const blob = await request(app).put('/api/data').send({ hello: true });
    expect(blob.status).toBe(404);
  });

  it('returns 503 on catalog prefixes when only a staff store is provided', async () => {
    const app = createApp({ store: createMemoryStaffStore() });
    const cookie = await registerOwner(app);
    const res = await request(app).get('/api/authors').set('Cookie', cookie);
    expect(res.status).toBe(503);
  });
});
