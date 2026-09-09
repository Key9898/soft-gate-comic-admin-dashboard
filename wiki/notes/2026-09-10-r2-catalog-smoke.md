---
title: Live R2 smoke + published title
type: note
date: 2026-09-10
tags: [backend, media, r2, catalog, smoke]
impl: 50
---

# Impl 50 — Live R2 smoke + published title

Ops-and-verify only. No new API, Prisma models, or website-repo work. Real R2 env stays in gitignored `backend/.env`. Bucket id is unchanged (`softgate-webtoon-dev`).

## Prove

- `isR2Configured()` true; prefix default `admin`. Restart `dev:api` after env changes. Fake R2 stays on disk and mounts `GET /uploads`; live R2 does not.
- New uploads only. DB `MediaAsset.key` is `{uuid}{ext}` (no slash). Public URL shape is `{R2_PUBLIC_BASE_URL}/{prefix}/{key}` — not `{MEDIA_PUBLIC_BASE_URL}/uploads/{key}`.
- Live smoke: cover + panel `HEAD` 200 on that shape (`r2.dev` public host in this pass). Media list URLs are not `/uploads/`.

## Catalog

- Active author + genre, then webtoon status `ongoing` (not the word `published`), then episode status `published` with the panel URL(s).
- Admin `GET /api/webtoons` / `GET /api/episodes` (staff cookie) show the non-draft series, published episode, and R2 URLs.
- Website `GET /api/catalog` is best-effort on the website origin. This pass did not have a website API listening; Admin-side verify still holds.

## Desk notes (local only)

- Shared DB `StaffUser` was empty (`setupRequired: true`). Applied pending `20260909200000_staff_auth_setup` (TOTP columns). First Super Admin via `POST /setup` (not a Team invite). Sign-in password was ephemeral — use Forgot password, do not reuse a demo account.
- Vite proxy stays unset `VITE_API_BASE_URL`. This laptop: Admin Express `:3000`, Admin SPA `:5177` (reader occupied `:5176`). `CORS_ORIGINS` is gitignored; include the Vite origin you actually use.
