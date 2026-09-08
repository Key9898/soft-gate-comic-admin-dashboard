---
title: CORS and cookie from env (Impl 42)
type: note
date: 2026-09-08
tags: [backend, cors, cookie, auth]
impl: 42
---

# Impl 42 — CORS + cookie from env

`backend/` only. Admin SPA fetch/`vite` proxy unchanged. Website untouched. No `*.vercel.app` hardcode. No Brevo.

## CORS

[`createApp`](../../backend/src/app.ts) reads `CORS_ORIGINS` (comma-separated exact origins). Default `http://localhost:5173`. Tokens that are `*` or contain `*` are dropped. `credentials: true`.

- Allowed `Origin`: echo that origin + `Access-Control-Allow-Credentials: true`
- Unknown `Origin`: HTTP 200, no `Access-Control-Allow-Origin` (not 403)
- No `Origin` (supertest): allowed

## Cookie

[`staffCookieOptions`](../../backend/src/auth/cookieOptions.ts) drives `sg_staff` set/clear.

- `COOKIE_SAMESITE`: `lax` | `strict` | `none` (default `lax`)
- `COOKIE_SECURE`: `true`/`false`/`1`/`0`; blank follows `NODE_ENV === 'production'`
- `SameSite=None` always sets `Secure`
- `clearCookie` omits `maxAge`
- No `COOKIE_DOMAIN`

Split-host later: set `CORS_ORIGINS` to the SPA origin and `COOKIE_SAMESITE=none`. Empty `VITE_API_BASE_URL` still uses the Vite proxy (no CORS).
