import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { createPrismaStaffStore } from './auth/prismaStaffStore.js';
import { parseCorsOrigins } from './auth/corsOrigins.js';
import { createStaffRouter } from './auth/staffRoutes.js';
import type { StaffStore } from './auth/staffStore.js';
import { mountCatalogRoutes } from './catalog/catalogRoutes.js';
import type { CatalogStore } from './catalog/catalogStore.js';
import { createPrismaCatalogStore } from './catalog/prismaCatalogStore.js';
import { mountCoinPackageRoutes } from './coins/coinPackageRoutes.js';
import type { CoinPackageStore } from './coins/coinPackageStore.js';
import { createPrismaCoinPackageStore } from './coins/prismaCoinPackageStore.js';
import { mountCommentRoutes } from './comments/commentRoutes.js';
import type { CommentStore } from './comments/commentStore.js';
import { createPrismaCommentStore } from './comments/prismaCommentStore.js';
import { mountNotificationRoutes } from './notifications/notificationRoutes.js';
import type { NotificationStore } from './notifications/notificationStore.js';
import { createPrismaNotificationStore } from './notifications/prismaNotificationStore.js';
import { mountPlatformSettingsRoutes } from './settings/platformSettingsRoutes.js';
import type { PlatformSettingsStore } from './settings/platformSettingsStore.js';
import { createPrismaPlatformSettingsStore } from './settings/prismaPlatformSettingsStore.js';
import { getPrisma, pingDb } from './db.js';
import { createMailerFromEnv, type StaffMailer } from './mail/mailer.js';
import { createMediaServicesFromEnv } from './media/fromEnv.js';
import { mountMediaRoutes, type MediaServices } from './media/mediaRoutes.js';

export type CreateAppOptions = {
  store?: StaffStore;
  catalog?: CatalogStore;
  coinPackages?: CoinPackageStore;
  comments?: CommentStore;
  notifications?: NotificationStore;
  settings?: PlatformSettingsStore;
  media?: MediaServices;
  mailer?: StaffMailer;
};

const CATALOG_PREFIXES = ['/api/authors', '/api/genres', '/api/webtoons', '/api/episodes'] as const;

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const store = options.store ?? prismaStaffFromEnv();
  const catalog = options.catalog ?? prismaCatalogFromEnv();
  const coinPackages = options.coinPackages ?? prismaCoinPackagesFromEnv();
  const comments = options.comments ?? prismaCommentsFromEnv();
  const notifications = options.notifications ?? prismaNotificationsFromEnv();
  const settings = options.settings ?? prismaSettingsFromEnv();
  const media = options.media ?? createMediaServicesFromEnv();

  const allowedOrigins = parseCorsOrigins();
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }
        callback(null, allowedOrigins.includes(origin));
      },
      credentials: true,
    }),
  );
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
    const mailer = options.mailer ?? createMailerFromEnv();
    app.use('/api/staff', createStaffRouter(store, mailer));
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

  if (store && coinPackages) {
    mountCoinPackageRoutes(app, store, coinPackages);
  } else {
    app.use('/api/coin-packages', (_req, res) => {
      res.status(503).json({ error: 'Coin packages store unavailable' });
    });
  }

  if (store && comments) {
    mountCommentRoutes(app, store, comments);
  } else {
    app.use('/api/comments', (_req, res) => {
      res.status(503).json({ error: 'Comments store unavailable' });
    });
  }

  if (store && notifications) {
    mountNotificationRoutes(app, store, notifications);
  } else {
    app.use('/api/notifications', (_req, res) => {
      res.status(503).json({ error: 'Notifications store unavailable' });
    });
  }

  if (store && settings) {
    mountPlatformSettingsRoutes(app, store, settings);
  } else {
    app.use('/api/settings', (_req, res) => {
      res.status(503).json({ error: 'Settings store unavailable' });
    });
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

function prismaCoinPackagesFromEnv(): CoinPackageStore | undefined {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  return createPrismaCoinPackageStore(prisma);
}

function prismaCommentsFromEnv(): CommentStore | undefined {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  return createPrismaCommentStore(prisma);
}

function prismaNotificationsFromEnv(): NotificationStore | undefined {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  return createPrismaNotificationStore(prisma);
}

function prismaSettingsFromEnv(): PlatformSettingsStore | undefined {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  return createPrismaPlatformSettingsStore(prisma);
}
