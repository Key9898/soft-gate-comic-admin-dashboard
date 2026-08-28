import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ObjectStore } from './objectStore.js';

export type LocalDiskStoreOptions = {
  uploadDir?: string;
  publicBaseUrl?: string;
};

export function resolveUploadDir(uploadDir?: string): string {
  return path.resolve(uploadDir ?? process.env.MEDIA_UPLOAD_DIR ?? './uploads');
}

export function resolvePublicBaseUrl(publicBaseUrl?: string): string {
  return (publicBaseUrl ?? process.env.MEDIA_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
}

function assertSafeKey(key: string): void {
  if (!key || key.includes('..') || key.includes('/') || key.includes('\\') || key.includes('\0')) {
    throw new Error('Invalid object key');
  }
}

export function createLocalDiskStore(options: LocalDiskStoreOptions = {}): ObjectStore {
  const root = resolveUploadDir(options.uploadDir);
  const publicBaseUrl = resolvePublicBaseUrl(options.publicBaseUrl);

  return {
    async put({ key, body }) {
      assertSafeKey(key);
      const dest = path.resolve(root, key);
      if (!dest.startsWith(root + path.sep)) {
        throw new Error('Invalid object key');
      }
      await mkdir(root, { recursive: true });
      await writeFile(dest, body);
      return { url: `${publicBaseUrl}/uploads/${key}` };
    },
    async delete(key) {
      assertSafeKey(key);
      const dest = path.resolve(root, key);
      if (!dest.startsWith(root + path.sep)) {
        throw new Error('Invalid object key');
      }
      try {
        await unlink(dest);
      } catch (err) {
        const code = (err as NodeJS.ErrnoException).code;
        if (code !== 'ENOENT') throw err;
      }
    },
  };
}
