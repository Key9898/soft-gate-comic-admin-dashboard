import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createMemoryStaffStore } from '../auth/memoryStaffStore.js';
import { createLocalDiskStore } from './localDiskStore.js';
import type { MediaAssetStore } from './mediaAssetStore.js';
import { createMemoryMediaAssetStore } from './memoryMediaAssetStore.js';
import { createMemoryObjectStore } from './memoryObjectStore.js';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const PDF = Buffer.from('%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<>\n%%EOF\n');

function appWithMedia(
  extras: {
    assets?: MediaAssetStore;
    files?: Map<string, { body: Buffer; contentType: string }>;
    uploadDir?: string;
  } = {},
) {
  const files = extras.files ?? new Map<string, { body: Buffer; contentType: string }>();
  const objects = extras.uploadDir
    ? createLocalDiskStore({ uploadDir: extras.uploadDir, publicBaseUrl: 'http://localhost:3000' })
    : createMemoryObjectStore(files);
  return createApp({
    store: createMemoryStaffStore(),
    media: {
      assets: extras.assets ?? createMemoryMediaAssetStore(),
      objects,
      uploadDir: extras.uploadDir,
    },
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

describe('media routes', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it('returns 503 when media is not injected', async () => {
    const app = createApp({ store: createMemoryStaffStore() });
    const cookie = await registerOwner(app);
    const res = await request(app).get('/api/media').set('Cookie', cookie);
    expect(res.status).toBe(503);
  });

  it('lists files for any staff and forbids viewer writes', async () => {
    const app = appWithMedia();
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

    const listed = await request(app).get('/api/media').set('Cookie', viewerCookie);
    expect(listed.status).toBe(200);
    expect(listed.body.files).toEqual([]);

    const denied = await request(app)
      .post('/api/media')
      .set('Cookie', viewerCookie)
      .attach('file', PNG, { filename: 'dot.png', contentType: 'image/png' });
    expect(denied.status).toBe(403);

    const created = await request(app)
      .post('/api/media')
      .set('Cookie', ownerCookie)
      .field('category', 'covers')
      .attach('file', PNG, { filename: 'dot.png', contentType: 'image/png' });
    expect(created.status).toBe(201);
    expect(created.body.file.name).toBe('dot.png');
    expect(created.body.file.type).toBe('image');
    expect(created.body.file.category).toBe('covers');
    expect(created.body.file.size).toBe(PNG.length);

    const viewerDelete = await request(app)
      .delete(`/api/media/${created.body.file.id}`)
      .set('Cookie', viewerCookie);
    expect(viewerDelete.status).toBe(403);
  });

  it('rejects svg, oversized images, and missing files', async () => {
    const app = appWithMedia();
    const cookie = await registerOwner(app);

    const svg = await request(app)
      .post('/api/media')
      .set('Cookie', cookie)
      .attach('file', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), {
        filename: 'x.svg',
        contentType: 'image/svg+xml',
      });
    expect(svg.status).toBe(400);

    const big = await request(app)
      .post('/api/media')
      .set('Cookie', cookie)
      .attach('file', Buffer.alloc(2 * 1024 * 1024 + 1), {
        filename: 'big.png',
        contentType: 'image/png',
      });
    expect(big.status).toBe(400);

    const missing = await request(app)
      .post('/api/media')
      .set('Cookie', cookie)
      .field('category', 'general');
    expect(missing.status).toBe(400);

    const pdf = await request(app)
      .post('/api/media')
      .set('Cookie', cookie)
      .attach('file', PDF, { filename: 'note.pdf', contentType: 'application/pdf' });
    expect(pdf.status).toBe(201);
    expect(pdf.body.file.type).toBe('pdf');
  });

  it('deletes the object then the row and 404s only when the row is missing', async () => {
    const files = new Map<string, { body: Buffer; contentType: string }>();
    const assets = createMemoryMediaAssetStore();
    const app = appWithMedia({ assets, files });
    const cookie = await registerOwner(app);

    const created = await request(app)
      .post('/api/media')
      .set('Cookie', cookie)
      .attach('file', PNG, { filename: 'dot.png', contentType: 'image/png' });
    expect(files.size).toBe(1);

    const removed = await request(app)
      .delete(`/api/media/${created.body.file.id}`)
      .set('Cookie', cookie);
    expect(removed.status).toBe(200);
    expect(removed.body.ok).toBe(true);
    expect(files.size).toBe(0);

    const again = await request(app)
      .delete(`/api/media/${created.body.file.id}`)
      .set('Cookie', cookie);
    expect(again.status).toBe(404);

    const orphan = await assets.create({
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      key: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb.png',
      url: 'memory://missing',
      name: 'gone.png',
      contentType: 'image/png',
      kind: 'image',
      size: 1,
      category: 'general',
    });
    const idempotent = await request(app).delete(`/api/media/${orphan.id}`).set('Cookie', cookie);
    expect(idempotent.status).toBe(200);
  });

  it('deletes the object when the metadata insert fails', async () => {
    const files = new Map<string, { body: Buffer; contentType: string }>();
    const inner = createMemoryMediaAssetStore();
    const assets: MediaAssetStore = {
      list: inner.list.bind(inner),
      findById: inner.findById.bind(inner),
      delete: inner.delete.bind(inner),
      async create() {
        throw new Error('insert fail');
      },
    };
    const app = appWithMedia({ assets, files });
    const cookie = await registerOwner(app);

    const res = await request(app)
      .post('/api/media')
      .set('Cookie', cookie)
      .attach('file', PNG, { filename: 'dot.png', contentType: 'image/png' });
    expect(res.status).toBe(500);
    expect(files.size).toBe(0);
  });

  it('serves local-disk files at GET /uploads without a cookie', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'sg-media-http-'));
    dirs.push(dir);
    const app = appWithMedia({ uploadDir: dir });
    const cookie = await registerOwner(app);

    const created = await request(app)
      .post('/api/media')
      .set('Cookie', cookie)
      .attach('file', PNG, { filename: 'dot.png', contentType: 'image/png' });
    expect(created.status).toBe(201);
    const url = new URL(created.body.file.url);
    expect(url.pathname.startsWith('/uploads/')).toBe(true);

    const served = await request(app).get(url.pathname);
    expect(served.status).toBe(200);
    expect(Buffer.from(served.body)).toEqual(PNG);
  });
});
