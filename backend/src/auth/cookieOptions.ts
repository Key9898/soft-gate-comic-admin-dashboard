import type { CookieOptions } from 'express';
import type { EnvMap } from './corsOrigins.js';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function read(env: EnvMap, key: string): string {
  return (env[key] ?? '').trim();
}

export function parseCookieSameSite(env: EnvMap = process.env): 'lax' | 'strict' | 'none' {
  const raw = read(env, 'COOKIE_SAMESITE').toLowerCase();
  if (raw === 'strict' || raw === 'none' || raw === 'lax') return raw;
  return 'lax';
}

export function parseCookieSecure(env: EnvMap = process.env): boolean {
  const raw = read(env, 'COOKIE_SECURE').toLowerCase();
  if (raw === 'true' || raw === '1') return true;
  if (raw === 'false' || raw === '0') return false;
  return env.NODE_ENV === 'production';
}

export function staffCookieOptions(env: EnvMap = process.env): CookieOptions {
  const sameSite = parseCookieSameSite(env);
  const secure = sameSite === 'none' ? true : parseCookieSecure(env);
  return {
    httpOnly: true,
    sameSite,
    secure,
    path: '/',
    maxAge: WEEK_MS,
  };
}

export function staffClearCookieOptions(env: EnvMap = process.env): CookieOptions {
  const { httpOnly, sameSite, secure, path } = staffCookieOptions(env);
  return { httpOnly, sameSite, secure, path };
}
