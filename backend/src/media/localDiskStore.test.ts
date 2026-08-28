import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createLocalDiskStore } from './localDiskStore.js';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('local disk object store', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  async function tmpStore() {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'sg-media-'));
    dirs.push(dir);
    return {
      dir,
      store: createLocalDiskStore({
        uploadDir: dir,
        publicBaseUrl: 'http://localhost:3000',
      }),
    };
  }

  it('writes and deletes a file under tmpdir', async () => {
    const { dir, store } = await tmpStore();
    const key = '11111111-1111-1111-1111-111111111111.png';
    const put = await store.put({ key, body: PNG, contentType: 'image/png' });
    expect(put.url).toBe(`http://localhost:3000/uploads/${key}`);
    expect(await readFile(path.join(dir, key))).toEqual(PNG);

    await store.delete(key);
    await expect(readFile(path.join(dir, key))).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('rejects path traversal keys and is idempotent on missing delete', async () => {
    const { store } = await tmpStore();
    await expect(
      store.put({ key: '../escape.png', body: PNG, contentType: 'image/png' }),
    ).rejects.toThrow('Invalid object key');
    await expect(store.delete('missing.png')).resolves.toBeUndefined();
  });
});
