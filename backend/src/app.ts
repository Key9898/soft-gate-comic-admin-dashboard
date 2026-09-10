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
import { mountReaderUserRoutes } from './users/readerUserRoutes.js';
import type { ReaderUserStore } from './users/readerUserStore.js';
import { createPrismaReaderUserStore } from './users/prismaReaderUserStore.js';
import { mountNotificationRoutes } from './notifications/notificationRoutes.js';
import type { NotificationStore } from './notifications/notificationStore.js';
import { createPrismaNotificationStore } from './notifications/prismaNotificationStore.js';
import { mountReaderBroadcastRoutes } from './broadcasts/readerBroadcastRoutes.js';
import type { ReaderBroadcastStore } from './broadcasts/broadcastStore.js';
import { createPrismaBroadcastStore } from './broadcasts/prismaBroadcastStore.js';
import {
  createWebsiteBroadcastClientFromEnv,
  type WebsiteBroadcastClient,
} from './broadcasts/websiteBroadcastClient.js';
import { mountPlatformSettingsRoutes } from './settings/platformSettingsRoutes.js';
import type { PlatformSettingsStore } from './settings/platformSettingsStore.js';
import { createPrismaPlatformSettingsStore } from './settings/prismaPlatformSettingsStore.js';
import { mountAboutHistoryRoutes } from './about/aboutHistoryRoutes.js';
import type { AboutHistoryStore } from './about/aboutHistoryStore.js';
import { createPrismaAboutHistoryStore } from './about/prismaAboutHistoryStore.js';
import { mountAboutTeamRoutes } from './about/aboutTeamRoutes.js';
import type { AboutTeamStore } from './about/aboutTeamStore.js';
import { createPrismaAboutTeamStore } from './about/prismaAboutTeamStore.js';
import { mountPressRoutes } from './press/pressRoutes.js';
import type { PressStore } from './press/pressStore.js';
import { createPrismaPressStore } from './press/prismaPressStore.js';
import { mountFaqRoutes } from './faq/faqRoutes.js';
import type { FaqStore } from './faq/faqStore.js';
import { createPrismaFaqStore } from './faq/prismaFaqStore.js';
import { mountCookieRoutes } from './cookiePolicy/cookieRoutes.js';
import type { CookieStore } from './cookiePolicy/cookieStore.js';
import { createPrismaCookieStore } from './cookiePolicy/prismaCookieStore.js';
import { mountLegalRoutes } from './legal/legalRoutes.js';
import type { LegalStore } from './legal/legalStore.js';
import { createPrismaLegalStore } from './legal/prismaLegalStore.js';
import { getPrisma, pingDb } from './db.js';
import { createMailerFromEnv, type StaffMailer } from './mail/mailer.js';
import { createMediaServicesFromEnv } from './media/fromEnv.js';
import { mountMediaRoutes, type MediaServices } from './media/mediaRoutes.js';

export type CreateAppOptions = {
  store?: StaffStore;
  catalog?: CatalogStore;
  coinPackages?: CoinPackageStore;
  comments?: CommentStore;
  readerUsers?: ReaderUserStore;
  notifications?: NotificationStore;
  broadcasts?: ReaderBroadcastStore;
  websiteBroadcasts?: WebsiteBroadcastClient;
  settings?: PlatformSettingsStore;
  aboutHistory?: AboutHistoryStore;
  aboutTeam?: AboutTeamStore;
  press?: PressStore;
  faq?: FaqStore;
  cookies?: CookieStore;
  legal?: LegalStore;
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
  const readerUsers = options.readerUsers ?? prismaReaderUsersFromEnv();
  const notifications = options.notifications ?? prismaNotificationsFromEnv();
  const broadcasts = options.broadcasts ?? prismaBroadcastsFromEnv();
  const websiteBroadcasts = options.websiteBroadcasts ?? createWebsiteBroadcastClientFromEnv();
  const settings = options.settings ?? prismaSettingsFromEnv();
  const aboutHistory = options.aboutHistory ?? prismaAboutHistoryFromEnv();
  const aboutTeam = options.aboutTeam ?? prismaAboutTeamFromEnv();
  const press = options.press ?? prismaPressFromEnv();
  const faq = options.faq ?? prismaFaqFromEnv();
  const cookies = options.cookies ?? prismaCookiesFromEnv();
  const legal = options.legal ?? prismaLegalFromEnv();
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

  if (store && readerUsers) {
    mountReaderUserRoutes(app, store, readerUsers);
  } else {
    app.use('/api/users', (_req, res) => {
      res.status(503).json({ error: 'Users store unavailable' });
    });
  }

  if (store && notifications) {
    mountNotificationRoutes(app, store, notifications);
  } else {
    app.use('/api/notifications', (_req, res) => {
      res.status(503).json({ error: 'Notifications store unavailable' });
    });
  }

  if (store && broadcasts) {
    mountReaderBroadcastRoutes(app, store, broadcasts, websiteBroadcasts);
  } else {
    app.use('/api/reader-broadcasts', (_req, res) => {
      res.status(503).json({ error: 'Reader broadcasts unavailable' });
    });
  }

  if (store && settings) {
    mountPlatformSettingsRoutes(app, store, settings);
  } else {
    app.use('/api/settings', (_req, res) => {
      res.status(503).json({ error: 'Settings store unavailable' });
    });
  }

  if (store && aboutHistory) {
    mountAboutHistoryRoutes(app, store, aboutHistory);
  } else {
    app.use('/api/about/history', (_req, res) => {
      res.status(503).json({ error: 'About history unavailable' });
    });
  }

  if (store && aboutTeam) {
    mountAboutTeamRoutes(app, store, aboutTeam);
  } else {
    app.use('/api/about/team', (_req, res) => {
      res.status(503).json({ error: 'About team unavailable' });
    });
  }

  if (store && press) {
    mountPressRoutes(app, store, press);
  } else {
    app.use('/api/press', (_req, res) => {
      res.status(503).json({ error: 'Press store unavailable' });
    });
  }

  if (store && faq) {
    mountFaqRoutes(app, store, faq);
  } else {
    app.use('/api/faq', (_req, res) => {
      res.status(503).json({ error: 'FAQ store unavailable' });
    });
  }

  if (store && cookies) {
    mountCookieRoutes(app, store, cookies);
  } else {
    app.use('/api/cookies', (_req, res) => {
      res.status(503).json({ error: 'Cookie policy store unavailable' });
    });
  }

  if (store && legal) {
    mountLegalRoutes(app, store, legal);
  } else {
    app.use('/api/legal', (_req, res) => {
      res.status(503).json({ error: 'Legal store unavailable' });
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

function prismaReaderUsersFromEnv(): ReaderUserStore | undefined {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  return createPrismaReaderUserStore(prisma);
}

function prismaNotificationsFromEnv(): NotificationStore | undefined {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  return createPrismaNotificationStore(prisma);
}

function prismaBroadcastsFromEnv(): ReaderBroadcastStore | undefined {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  return createPrismaBroadcastStore(prisma);
}

function prismaSettingsFromEnv(): PlatformSettingsStore | undefined {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  return createPrismaPlatformSettingsStore(prisma);
}

function prismaAboutHistoryFromEnv(): AboutHistoryStore | undefined {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  return createPrismaAboutHistoryStore(prisma);
}

function prismaAboutTeamFromEnv(): AboutTeamStore | undefined {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  return createPrismaAboutTeamStore(prisma);
}

function prismaPressFromEnv(): PressStore | undefined {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  return createPrismaPressStore(prisma);
}

function prismaFaqFromEnv(): FaqStore | undefined {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  return createPrismaFaqStore(prisma);
}

function prismaCookiesFromEnv(): CookieStore | undefined {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  return createPrismaCookieStore(prisma);
}

function prismaLegalFromEnv(): LegalStore | undefined {
  const prisma = getPrisma();
  if (!prisma) return undefined;
  return createPrismaLegalStore(prisma);
}
