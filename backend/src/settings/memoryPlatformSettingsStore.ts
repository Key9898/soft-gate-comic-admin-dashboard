import {
  DEFAULT_PLATFORM_SETTINGS,
  publicSettings,
  type PlatformSettingsRecord,
  type PlatformSettingsStore,
} from './platformSettingsStore.js';

export function createMemoryPlatformSettingsStore(): PlatformSettingsStore {
  let row: PlatformSettingsRecord | null = null;

  return {
    async get() {
      return publicSettings(row ?? DEFAULT_PLATFORM_SETTINGS);
    },
    async upsert(input: PlatformSettingsRecord) {
      row = publicSettings(input);
      return publicSettings(row);
    },
  };
}
