import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CORS_ORIGIN, isOriginAllowed, parseCorsOrigins } from './corsOrigins.js';

describe('parseCorsOrigins', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to localhost:5173 when unset or blank', () => {
    expect(parseCorsOrigins({})).toEqual([DEFAULT_CORS_ORIGIN]);
    expect(parseCorsOrigins({ CORS_ORIGINS: '  ' })).toEqual([DEFAULT_CORS_ORIGIN]);
  });

  it('splits, trims, and drops wildcards', () => {
    expect(
      parseCorsOrigins({
        CORS_ORIGINS: 'http://localhost:5173, http://localhost:5174, *, https://*.vercel.app',
      }),
    ).toEqual(['http://localhost:5173', 'http://localhost:5174']);
  });

  it('falls back to the default when every token is a wildcard', () => {
    expect(parseCorsOrigins({ CORS_ORIGINS: '*, *.vercel.app' })).toEqual([DEFAULT_CORS_ORIGIN]);
  });

  it('matches exact origins only', () => {
    const env = { CORS_ORIGINS: 'http://localhost:5173,https://admin.example' };
    expect(isOriginAllowed('http://localhost:5173', env)).toBe(true);
    expect(isOriginAllowed('https://admin.example', env)).toBe(true);
    expect(isOriginAllowed('https://evil.example', env)).toBe(false);
  });
});
