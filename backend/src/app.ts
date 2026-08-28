import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { createPrismaStaffStore } from './auth/prismaStaffStore.js';
import { createStaffRouter } from './auth/staffRoutes.js';
import type { StaffStore } from './auth/staffStore.js';
import { mountCatalogRoutes } from './catalog/catalogRoutes.js';
import type { CatalogStore } from './catalog/catalogStore.js';
import { createPrismaCatalogStore } from './catalog/prismaCatalogStore.js';
import { getPrisma, pingDb } from './db.js';
import { createObjectStore } from './media/createObjectStore.js';
import { resolveUploadDir } from './media/localDiskStore.js';
import { mountMediaRoutes, type MediaServices } from './media/mediaRoutes.js';
import { createPrismaMediaAssetStore } from './media/prismaMediaAssetStore.js';

export type CreateAppOptions = {
  store?: StaffStore;
  catalog?: CatalogStore;
  media?: MediaServices;
};

const CATALOG_PREFIXES = ['/api/authors', '/api/genres', '/api/webtoons', '/api/episodes'] as const;

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const store = options.store ?? prismaStaffFromEnv();
  const catalog = options.catalog ?? prismaCatalogFromEnv();
  const media = options.media ?? prismaMediaFromEnv();

  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/health', async (_req, res) => {
    const db = (await pingDb()) ? 'up' : 'down';
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db,
    });
  });

  if (store) {
    app.use('/api/staff', createStaffRouter(store));
  } else {
    app.use('/api/staff', (_req, res) => {
      res.status(503).json({ error: 'Staff store unavailable' });
    });
  }

  if (store && catalog) {
    mountCatalogRoutes(app, store, catalog);
  } else {
    const unavailable = (_req: express.Request, res: express.Response) => {
      res.status(503).json({ error: 'Catalog store unavailable' });
    };
    for (const prefix of CATALOG_PREFIXES) {
      app.use(prefix, unavailable);
    }
  }

  if (store && media) {
    mountMediaRoutes(app, store, media);
  } else {
    app.use('/api/media', (_req, res) => {
      res.status(503).json({ error: 'Media store unavailable' });
    });
  }

  return app;
}

function prismaStaffFromEnv(): StaffStore | undefined {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  return createPrismaStaffStore(prisma);
}

function prismaCatalogFromEnv(): CatalogStore | undefined {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  return createPrismaCatalogStore(prisma);
}

function prismaMediaFromEnv(): MediaServices | undefined {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  return {
    assets: createPrismaMediaAssetStore(prisma),
    objects: createObjectStore(),
    uploadDir: resolveUploadDir(),
  };
}
