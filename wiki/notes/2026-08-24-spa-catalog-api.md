---
title: Admin SPA staff + catalog API wire (Impl 33)
type: note
date: 2026-08-24
tags: [admin, spa, catalog, staff, api, mock]
impl: 33
---

# Impl 33 — Point Admin SPA at staff + catalog APIs

Admin SPA only. Website repo untouched. No media/R2, no coin-package API, no settings API, no blob `PUT /api/data`.

## Flag

- `VITE_USE_MOCK_API` default **`true`**: localStorage / `sgmock:` / Playwright seed. Vitest pins this so `.env.local=false` cannot flip unit tests.
- `false`: httpOnly cookie `sg_staff` + REST catalog. Empty API catalog until staff creates rows. No hybrid fallback to the portal blob.

## HTTP

- Client: [`src/lib/api/`](../../src/lib/api/) (`credentials: 'include'`).
- Vite proxy `/api` and `/health` → `:3000`. Example `VITE_API_BASE_URL=http://localhost:3000` still talks to `:3000` directly (CORS). Empty base URL uses same-origin `/api` via proxy.

## Staff

Login, register, logout, `GET /me`, Team roster/invites/resend/remove (DELETE by **id**). Username is the email local-part. Invite accept does not peek localStorage (token is hashed on the server). Revoke is mock-only (no API). Forgot/reset stay mock.

## Catalog

`AdminLayout` calls `reloadCatalog()` after auth (not `useAuth` inside `DataProvider`). Parallel GET authors/genres/webtoons/episodes. Page writes POST/PATCH/DELETE then reload. Genre PATCH omits slug. Bulk episode upload is mock-only.

## Honest leftovers

Settings, coins, media, users, comments, reports, analytics stay mock. Website does not consume this API. e2e stays localStorage seed. `npm run check` does not need Docker or `dev:api`.
