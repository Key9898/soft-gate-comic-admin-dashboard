import { describe, expect, it } from 'vitest';
import {
  parseCookieSameSite,
  parseCookieSecure,
  staffClearCookieOptions,
  staffCookieOptions,
} from './cookieOptions.js';

describe('staffCookieOptions', () => {
  it('defaults to lax and non-secure outside production', () => {
    expect(parseCookieSameSite({})).toBe('lax');
    expect(parseCookieSameSite({ COOKIE_SAMESITE: 'bogus' })).toBe('lax');
    expect(parseCookieSecure({ NODE_ENV: 'test' })).toBe(false);
    expect(parseCookieSecure({ NODE_ENV: 'production' })).toBe(true);
    const opts = staffCookieOptions({ NODE_ENV: 'test' });
    expect(opts.httpOnly).toBe(true);
    expect(opts.sameSite).toBe('lax');
    expect(opts.secure).toBe(false);
    expect(opts.path).toBe('/');
    expect(opts.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('honors COOKIE_SECURE true/false and 1/0', () => {
    expect(parseCookieSecure({ COOKIE_SECURE: 'true', NODE_ENV: 'test' })).toBe(true);
    expect(parseCookieSecure({ COOKIE_SECURE: '0', NODE_ENV: 'production' })).toBe(false);
  });

  it('forces Secure when SameSite is None', () => {
    const opts = staffCookieOptions({ COOKIE_SAMESITE: 'None', COOKIE_SECURE: 'false' });
    expect(opts.sameSite).toBe('none');
    expect(opts.secure).toBe(true);
    const clear = staffClearCookieOptions({ COOKIE_SAMESITE: 'None' });
    expect(clear.sameSite).toBe('none');
    expect(clear.secure).toBe(true);
    expect(clear.maxAge).toBeUndefined();
  });
});
