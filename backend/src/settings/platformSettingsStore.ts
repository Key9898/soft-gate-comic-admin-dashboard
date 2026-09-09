export const PLATFORM_SETTINGS_ID = 'platform';

export type PlatformLanguage = 'en' | 'mm';

export type PlatformSettingsRecord = {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  contactEmail: string;
  defaultLanguage: PlatformLanguage;
};

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettingsRecord = {
  maintenanceMode: false,
  allowRegistration: true,
  contactEmail: 'admin@softgatecomic.com',
  defaultLanguage: 'en',
};

export type PlatformSettingsStore = {
  get: () => Promise<PlatformSettingsRecord>;
  upsert: (input: PlatformSettingsRecord) => Promise<PlatformSettingsRecord>;
};

export function readPlatformLanguage(value: unknown): PlatformLanguage | null {
  if (value === 'mm' || value === 'my') return 'mm';
  if (value === 'en') return 'en';
  return null;
}

export function publicSettings(row: PlatformSettingsRecord): PlatformSettingsRecord {
  return {
    maintenanceMode: row.maintenanceMode,
    allowRegistration: row.allowRegistration,
    contactEmail: row.contactEmail,
    defaultLanguage: row.defaultLanguage,
  };
}
