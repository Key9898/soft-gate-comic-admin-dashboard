import { beforeEach, describe, expect, it } from 'vitest';
import {
  ADMIN_SETTINGS_STORAGE_KEY,
  LEGACY_SHARED_DATA_STORAGE_KEY,
  SHARED_DATA_SCHEMA_VERSION,
  SHARED_DATA_STORAGE_KEY,
  getSharedData,
  loadFromLocalStorage,
  normalizePortalLanguage,
  saveToLocalStorage,
  toPortalSettings,
} from '@softgate/shared';

describe('catalog storage pipe', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('normalizes my to mm and leaves en', () => {
    expect(normalizePortalLanguage('my')).toBe('mm');
    expect(normalizePortalLanguage('mm')).toBe('mm');
    expect(normalizePortalLanguage('en')).toBe('en');
    expect(normalizePortalLanguage('fr')).toBe('en');
  });

  it('saves schema 14 under the portal key and never writes the legacy key', () => {
    const data = getSharedData();
    saveToLocalStorage(data);

    expect(localStorage.getItem(LEGACY_SHARED_DATA_STORAGE_KEY)).toBeNull();
    const raw = localStorage.getItem(SHARED_DATA_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as {
      schemaVersion: number;
      data: { webtoons: unknown[]; coinPackages: unknown[] };
    };
    expect(parsed.schemaVersion).toBe(SHARED_DATA_SCHEMA_VERSION);
    expect(parsed.data.webtoons.length).toBeGreaterThan(0);
    expect(parsed.data.coinPackages).toHaveLength(6);
  });

  it('loads the portal key first', () => {
    const data = getSharedData();
    localStorage.setItem(
      SHARED_DATA_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: SHARED_DATA_SCHEMA_VERSION,
        data: { ...data, settings: toPortalSettings({ contactEmail: 'portal@softgatecomic.com' }) },
      }),
    );
    localStorage.setItem(LEGACY_SHARED_DATA_STORAGE_KEY, JSON.stringify(data));

    const loaded = loadFromLocalStorage();
    expect(loaded?.settings?.contactEmail).toBe('portal@softgatecomic.com');
  });

  it('migrates the legacy catalog key plus admin settings into the portal blob once', () => {
    const data = getSharedData();
    localStorage.setItem(LEGACY_SHARED_DATA_STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(
      ADMIN_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        contactEmail: 'ops@softgatecomic.com',
        maintenanceMode: true,
        allowRegistration: false,
        defaultLanguage: 'my',
        requireEmailVerification: true,
      }),
    );

    const loaded = loadFromLocalStorage();
    expect(loaded?.settings).toEqual({
      maintenanceMode: true,
      allowRegistration: false,
      contactEmail: 'ops@softgatecomic.com',
      defaultLanguage: 'mm',
    });

    const portal = JSON.parse(localStorage.getItem(SHARED_DATA_STORAGE_KEY)!) as {
      schemaVersion: number;
      data: { settings: unknown };
    };
    expect(portal.schemaVersion).toBe(14);
    expect(portal.data.settings).toEqual(loaded?.settings);
    expect(localStorage.getItem(LEGACY_SHARED_DATA_STORAGE_KEY)).toBeTruthy();
  });

  it('hydrates missing coinPackages from seed without bumping schema', () => {
    const data = getSharedData();
    const rest = { ...data };
    delete (rest as { coinPackages?: unknown }).coinPackages;
    localStorage.setItem(
      SHARED_DATA_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: SHARED_DATA_SCHEMA_VERSION,
        data: rest,
      }),
    );

    const loaded = loadFromLocalStorage();
    expect(loaded?.coinPackages).toEqual(data.coinPackages);

    const portal = JSON.parse(localStorage.getItem(SHARED_DATA_STORAGE_KEY)!) as {
      schemaVersion: number;
      data: { coinPackages: unknown[] };
    };
    expect(portal.schemaVersion).toBe(14);
    expect(portal.data.coinPackages).toHaveLength(6);
  });

  it('keeps an existing empty coinPackages array without reseeding', () => {
    const data = getSharedData();
    localStorage.setItem(
      SHARED_DATA_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: SHARED_DATA_SCHEMA_VERSION,
        data: { ...data, coinPackages: [] },
      }),
    );

    const loaded = loadFromLocalStorage();
    expect(loaded?.coinPackages).toEqual([]);
  });
});
