import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createObjectStore } from './createObjectStore.js';
import { createR2ObjectStore } from './r2ObjectStore.js';

vi.mock('./r2ObjectStore.js', () => ({
  createR2ObjectStore: vi.fn(() => ({
    put: vi.fn(async ({ key }: { key: string }) => ({ url: `r2://${key}` })),
    delete: vi.fn(),
  })),
}));

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('createObjectStore', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.mocked(createR2ObjectStore).mockClear();
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it('uses local disk when R2 env is fake or missing', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'sg-factory-'));
    dirs.push(dir);
    const store = createObjectStore({
      uploadDir: dir,
      publicBaseUrl: 'http://localhost:3000',
    });
    const key = '11111111-1111-1111-1111-111111111111.png';
    const put = await store.put({ key, body: PNG, contentType: 'image/png' });
    expect(put.url).toBe(`http://localhost:3000/uploads/${key}`);
    expect(await readFile(path.join(dir, key))).toEqual(PNG);
    expect(createR2ObjectStore).not.toHaveBeenCalled();
  });

  it('uses the R2 driver when real credentials are present', () => {
    vi.stubEnv('R2_ACCOUNT_ID', 'acct123');
    vi.stubEnv('R2_ACCESS_KEY_ID', 'akid');
    vi.stubEnv('R2_SECRET_ACCESS_KEY', 'secret');
    vi.stubEnv('R2_BUCKET', 'media');
    vi.stubEnv('R2_PUBLIC_BASE_URL', 'https://pub.example');
    createObjectStore();
    expect(createR2ObjectStore).toHaveBeenCalledTimes(1);
  });
});
