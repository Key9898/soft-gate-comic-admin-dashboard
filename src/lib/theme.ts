import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  ReactNode,
} from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_PREFERENCE_KEY = 'softgate_admin_theme_preference';
export const THEME_LEGACY_KEY = 'softgate_admin_theme';
/** One-shot: migration already ran; honor stored preference. First-run default is System. */
export const THEME_PREF_V2_KEY = 'softgate_admin_theme_pref_v2';

export function resolveTheme(preference: ThemePreference, matchesDark: boolean): ResolvedTheme {
  if (preference === 'system') {
    return matchesDark ? 'dark' : 'light';
  }
  return preference;
}

/**
 * Legacy softgate_admin_theme stored resolved OS theme, not a user choice.
 * Run once: set System default, clear legacy, set v2 flag. After v2, honor stored preference.
 */
export function migrateThemePreferenceV2(
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = localStorage,
): ThemePreference {
  if (storage.getItem(THEME_PREF_V2_KEY) === '1') {
    const stored = storage.getItem(THEME_PREFERENCE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'system';
  }

  storage.setItem(THEME_PREFERENCE_KEY, 'system');
  storage.removeItem(THEME_LEGACY_KEY);
  storage.setItem(THEME_PREF_V2_KEY, '1');
  return 'system';
}

function readStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  return migrateThemePreferenceV2(localStorage);
}

function getSystemMatchesDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Opt light out of Chrome Auto Dark; dark pages declare native dark scheme. */
export function colorSchemeForResolved(resolved: ResolvedTheme): 'only light' | 'dark' {
  return resolved === 'dark' ? 'dark' : 'only light';
}

/** Read a `--sg-*` CSS variable for non-Tailwind consumers (e.g. Recharts SVG attrs). */
export function readSgVar(name: string, fallback: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function applyResolvedTheme(resolved: ResolvedTheme) {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  const scheme = colorSchemeForResolved(resolved);
  root.style.colorScheme = scheme;

  let meta = document.querySelector('meta[name="color-scheme"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'color-scheme');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', scheme);

  // Canvas lock uses semantic vars — reinforces Auto Dark opt-out for light
  if (resolved === 'light') {
    root.style.setProperty('background-color', 'var(--sg-canvas)', 'important');
    if (document.body) {
      document.body.style.setProperty('background-color', 'var(--sg-canvas)', 'important');
      document.body.style.setProperty('color', 'var(--sg-text)', 'important');
    }
  } else {
    root.style.removeProperty('background-color');
    if (document.body) {
      document.body.style.removeProperty('background-color');
      document.body.style.removeProperty('color');
    }
  }
}

interface ThemeContextType {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  /** @deprecated Use resolvedTheme — kept for gradual migration */
  theme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  setTheme: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => readStoredPreference());
  const [systemMatchesDark, setSystemMatchesDark] = useState(() => getSystemMatchesDark());

  const resolvedTheme = useMemo(
    () => resolveTheme(preference, systemMatchesDark),
    [preference, systemMatchesDark],
  );

  useEffect(() => {
    localStorage.setItem(THEME_PREFERENCE_KEY, preference);
    localStorage.removeItem(THEME_LEGACY_KEY);
    localStorage.setItem(THEME_PREF_V2_KEY, '1');
  }, [preference]);

  useEffect(() => {
    applyResolvedTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (preference !== 'system') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemMatchesDark(event.matches);
    };

    setSystemMatchesDark(mql.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
  }, []);

  const value: ThemeContextType = {
    preference,
    resolvedTheme,
    theme: resolvedTheme,
    setPreference,
    setTheme: setPreference,
  };

  return React.createElement(ThemeContext.Provider, { value }, children);
};
