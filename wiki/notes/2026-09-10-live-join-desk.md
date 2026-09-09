---
title: Live join desk
type: note
date: 2026-09-10
tags: [ops, settings, coins, help, staff, impl]
impl: 52
---

# Impl 52 — Live join desk (ops + honesty)

No new API or Prisma models. Website repo untouched. Impl 51 reader broadcasts stay as product code.

## Unlock `/setup`

- Shared `StaffUser` had one Super Admin with an unknown password. Forgot password cannot email when Brevo is fake/missing (`POST /forgot` still `{ ok: true }`).
- Deleted staff-only rows in FK order: `StaffPasswordReset`, `StaffInvite`, `ReaderBroadcast`, `StaffUser`. Catalog counts unchanged (1 webtoon, 1 episode, 2 media).
- `GET /api/staff/auth-options` → `setupRequired: true`. Empty staff uses `/setup` (email + display name + password ≥ 8). Do not persist that password in `.env`.
- Local HTTP: `COOKIE_SECURE` unset. `CORS_ORIGINS` already includes `http://localhost:5177` (Admin Vite). `VITE_USE_MOCK_API=false`; `VITE_API_BASE_URL` unset.

## Desk data

- `PlatformSettings` `id=platform` already existed (`maintenanceMode` false). GET still fail-opens if missing; this row is the website-200 consume target. Envelope stays `{ settings }`.
- `CoinPackage` was empty (`[]` empties `/coins`). Created one SKU `coins: 100`, `price: 990`. Envelope stays `{ coinPackages }`.

## Honesty

Help `OVERVIEW_DATA_API` / `ADMIN_SETTINGS` and `wiki/conventions/staff-help.md`: the four portal settings can reach the reader when the portal persist is on. Comments, staff inbox, and users stay off that join. Impl 51 broadcast sentence kept.

## Verify (Admin)

- `GET /health` `{ status: "ok", db: "up", timestamp }`.
- `isR2Configured()` `true`; `r2KeyPrefix()` `"admin"`.
- Prisma: webtoon `ongoing` cover `/admin/` not `/uploads/`; episode `published` images the same; media keys have no slash.
- Prisma: settings row exists; coin packages length 1.
- Staff cookie `GET /api/webtoons` waits on `/setup` (no session until the first Super Admin exists). Website catalog/settings/coins GET is website Impl 202.
