import { describe, expect, it, beforeEach } from 'vitest';
import {
  COOKIE_STORAGE_KEY,
  DEFAULT_COOKIE_META,
  loadCookiesPolicy,
  saveCookiesPolicy,
} from './cookiesPolicy';

describe('cookies policy mock store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('seeds meta and 16 rows when the key is missing', () => {
    const snapshot = loadCookiesPolicy();
    expect(snapshot.meta.copy.cookiesTitle.en).toBe(DEFAULT_COOKIE_META.copy.cookiesTitle.en);
    expect(snapshot.meta.glance).toHaveLength(5);
    expect(snapshot.rows).toHaveLength(16);
    expect(snapshot.rows[0]?.storageKey).toBe('i18nextLng');
  });

  it('honors a saved empty row list', () => {
    saveCookiesPolicy({ meta: DEFAULT_COOKIE_META, rows: [] });
    expect(localStorage.getItem(COOKIE_STORAGE_KEY)).toContain('cookiesTitle');
    const loaded = loadCookiesPolicy();
    expect(loaded.rows).toEqual([]);
  });
});
