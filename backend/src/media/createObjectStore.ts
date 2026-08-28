import { createLocalDiskStore, type LocalDiskStoreOptions } from './localDiskStore.js';
import type { ObjectStore } from './objectStore.js';

/** Always local disk this Impl. Remote driver TBD — do not branch on R2_* or Cloudinary env. */
export function createObjectStore(options: LocalDiskStoreOptions = {}): ObjectStore {
  return createLocalDiskStore(options);
}
