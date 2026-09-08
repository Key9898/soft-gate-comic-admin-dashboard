import { getPrisma } from '../db.js';
import { createObjectStore } from './createObjectStore.js';
import { resolveUploadDir } from './localDiskStore.js';
import type { MediaServices } from './mediaRoutes.js';
import { createPrismaMediaAssetStore } from './prismaMediaAssetStore.js';
import { isR2Configured } from './r2Config.js';

export function createMediaServicesFromEnv(): MediaServices | undefined {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  return {
    assets: createPrismaMediaAssetStore(prisma),
    objects: createObjectStore(),
    uploadDir: isR2Configured() ? undefined : resolveUploadDir(),
  };
}
