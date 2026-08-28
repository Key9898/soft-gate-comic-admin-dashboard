import type { ObjectStore } from './objectStore.js';

export function createMemoryObjectStore(
  files: Map<string, { body: Buffer; contentType: string }> = new Map(),
): ObjectStore {
  return {
    async put({ key, body, contentType }) {
      files.set(key, { body, contentType });
      return { url: `memory://${key}` };
    },
    async delete(key) {
      files.delete(key);
    },
  };
}
