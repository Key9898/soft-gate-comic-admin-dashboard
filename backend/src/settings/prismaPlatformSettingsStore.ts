import type { PrismaClient } from '@prisma/client';
import {
  DEFAULT_PLATFORM_SETTINGS,
  PLATFORM_SETTINGS_ID,
  publicSettings,
  type PlatformSettingsRecord,
  type PlatformSettingsStore,
} from './platformSettingsStore.js';

function toRecord(row: {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  contactEmail: string;
  defaultLanguage: PlatformSettingsRecord['defaultLanguage'];
}): PlatformSettingsRecord {
  return publicSettings({
    maintenanceMode: row.maintenanceMode,
    allowRegistration: row.allowRegistration,
    contactEmail: row.contactEmail,
    defaultLanguage: row.defaultLanguage,
  });
}

export function createPrismaPlatformSettingsStore(prisma: PrismaClient): PlatformSettingsStore {
  return {
    async get() {
      const row = await prisma.platformSettings.findUnique({
        where: { id: PLATFORM_SETTINGS_ID },
      });
      return row ? toRecord(row) : publicSettings(DEFAULT_PLATFORM_SETTINGS);
    },
    async upsert(input: PlatformSettingsRecord) {
      const stored = publicSettings(input);
      const row = await prisma.platformSettings.upsert({
        where: { id: PLATFORM_SETTINGS_ID },
        create: {
          id: PLATFORM_SETTINGS_ID,
          ...stored,
        },
        update: stored,
      });
      return toRecord(row);
    },
  };
}
