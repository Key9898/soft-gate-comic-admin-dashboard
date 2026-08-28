import { describe, expect, it, beforeEach } from 'vitest';
import {
  resolveTheme,
  migrateThemePreferenceV2,
  colorSchemeForResolved,
  readSgVar,
  THEME_PREFERENCE_KEY,
  THEME_LEGACY_KEY,
  THEME_PREF_V2_KEY,
} from './theme';

function createMemoryStorage(initial: Record<string, string> = {}) {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key: string) => (map.has(key) ? map.get(key)! : null),
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    raw: map,
  };
}

describe('resolveTheme', () => {
  it('returns light or dark when preference is explicit', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('follows system matches when preference is system', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });
});

describe('colorSchemeForResolved', () => {
  it('uses only light to opt out of browser Auto Dark', () => {
    expect(colorSchemeForResolved('light')).toBe('only light');
  });

  it('uses dark when resolved theme is dark', () => {
    expect(colorSchemeForResolved('dark')).toBe('dark');
  });
});

describe('readSgVar', () => {
  it('returns fallback when variable is missing', () => {
    expect(readSgVar('--sg-does-not-exist', '#d1d5db')).toBe('#d1d5db');
  });

  it('reads a set CSS variable from the document element', () => {
    document.documentElement.style.setProperty('--sg-test-var', '#4b5563');
    expect(readSgVar('--sg-test-var', '#000000')).toBe('#4b5563');
    document.documentElement.style.removeProperty('--sg-test-var');
  });
});

describe('migrateThemePreferenceV2', () => {
  beforeEach(() => {
    // no-op; each test uses its own memory storage
  });

  it('forces system once, clears legacy, and sets v2 flag', () => {
    const storage = createMemoryStorage({
      [THEME_LEGACY_KEY]: 'dark',
      [THEME_PREFERENCE_KEY]: 'dark',
    });

    expect(migrateThemePreferenceV2(storage)).toBe('system');
    expect(storage.getItem(THEME_PREFERENCE_KEY)).toBe('system');
    expect(storage.getItem(THEME_LEGACY_KEY)).toBeNull();
    expect(storage.getItem(THEME_PREF_V2_KEY)).toBe('1');
  });

  it('preserves stored light after v2 flag is set', () => {
    const storage = createMemoryStorage({
      [THEME_PREF_V2_KEY]: '1',
      [THEME_PREFERENCE_KEY]: 'light',
    });

    expect(migrateThemePreferenceV2(storage)).toBe('light');
    expect(storage.getItem(THEME_PREFERENCE_KEY)).toBe('light');
  });

  it('preserves stored dark after v2 flag is set', () => {
    const storage = createMemoryStorage({
      [THEME_PREF_V2_KEY]: '1',
      [THEME_PREFERENCE_KEY]: 'dark',
    });

    expect(migrateThemePreferenceV2(storage)).toBe('dark');
    expect(storage.getItem(THEME_PREFERENCE_KEY)).toBe('dark');
  });

  it('preserves stored system after v2 flag is set', () => {
    const storage = createMemoryStorage({
      [THEME_PREF_V2_KEY]: '1',
      [THEME_PREFERENCE_KEY]: 'system',
    });

    expect(migrateThemePreferenceV2(storage)).toBe('system');
    expect(storage.getItem(THEME_PREFERENCE_KEY)).toBe('system');
  });

  it('defaults to system when v2 set but preference missing', () => {
    const storage = createMemoryStorage({
      [THEME_PREF_V2_KEY]: '1',
    });

    expect(migrateThemePreferenceV2(storage)).toBe('system');
  });

  it('defaults to system when v2 set but preference is invalid', () => {
    const storage = createMemoryStorage({
      [THEME_PREF_V2_KEY]: '1',
      [THEME_PREFERENCE_KEY]: 'foo',
    });

    expect(migrateThemePreferenceV2(storage)).toBe('system');
  });
});
