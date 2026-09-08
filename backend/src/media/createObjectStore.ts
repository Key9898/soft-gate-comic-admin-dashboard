import { createLocalDiskStore, type LocalDiskStoreOptions } from './localDiskStore.js';
import type { ObjectStore } from './objectStore.js';
import { isR2Configured } from './r2Config.js';
import { createR2ObjectStore } from './r2ObjectStore.js';

export function createObjectStore(options: LocalDiskStoreOptions = {}): ObjectStore {
  if (isR2Configured()) {
    return createR2ObjectStore();
  }
  return createLocalDiskStore(options);
}
