import 'dotenv/config';
import { createPrismaCatalogStore } from './catalog/prismaCatalogStore.js';
import { createPrismaStaffStore } from './auth/prismaStaffStore.js';
import { createApp } from './app.js';
import { getPrisma, hasDatabaseUrl } from './db.js';
import { createObjectStore } from './media/createObjectStore.js';
import { resolveUploadDir } from './media/localDiskStore.js';
import { createPrismaMediaAssetStore } from './media/prismaMediaAssetStore.js';

async function main() {
  if (!hasDatabaseUrl()) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || !jwtSecret.trim()) {
    console.error('JWT_SECRET is required');
    process.exit(1);
  }

  const prisma = getPrisma();
  if (!prisma) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  try {
    await prisma.$connect();
  } catch (err) {
    console.error('Failed to connect to the database', err);
    process.exit(1);
  }

  const port = Number(process.env.PORT) || 3000;
  const app = createApp({
    store: createPrismaStaffStore(prisma),
    catalog: createPrismaCatalogStore(prisma),
    media: {
      assets: createPrismaMediaAssetStore(prisma),
      objects: createObjectStore(),
      uploadDir: resolveUploadDir(),
    },
  });

  app.listen(port, () => {
    console.warn(`softgate-backend listening on ${port}`);
  });
}

void main();
