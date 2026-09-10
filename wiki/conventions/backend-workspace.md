---
title: Backend lives in sibling backend/ not in Vite src
type: convention
date: 2026-09-09
tags:
  [
    backend,
    workspace,
    express,
    vite,
    prisma,
    media,
    r2,
    cors,
    mail,
    brevo,
    coins,
    comments,
    notifications,
    settings,
    staff-auth,
  ]
impl: 48
---

# Backend workspace

The HTTP API is [`backend/`](../../backend/), an npm workspace. The Admin dashboard stays a Vite SPA at the **repo root** (`src/`).

- Do not add Express to root `package.json` or `src/`.
- Do not move Admin into `apps/admin` in this track (see [ADR 002](../decisions/002-admin-root-sibling-backend.md)).
- Do not run Prettier from `backend/` (root `.prettierrc.json` uses `prettier-plugin-tailwindcss`).
- Dev: `npm run dev` (Vite :5173) and `npm run dev:api` (Express, default :3000). If TextPad is also on 3000, set `PORT=3001`.
- Staff auth API is Impl 31 + 48 (`/api/staff`): public `GET /auth-options`, bootstrap `POST /setup` (`/register` alias), cookie login, optional TOTP, env-gated SSO (existing email only). Catalog CRUD API is Impl 32 (`/api/authors|genres|webtoons|episodes`). Coin packages API is Impl 44 (`/api/coin-packages`; write = super_admin/admin). Comments API is Impl 53 (`/api/comments`; portal `ReaderComment`; write = super_admin/admin; reported queue; hard-delete). Reader users API is Impl 54 (`/api/users`; portal `ReaderUser`; profile PATCH; hard-delete; wallet read-only; write = super_admin/admin). Staff notifications API is Impl 46 (`/api/notifications`; write = super_admin/admin; hard-delete). Platform settings API is Impl 47 (`/api/settings`; write = super_admin/admin; four portal-safe fields). About history API is Impl 59 (`/api/about/history`; write = super_admin/admin; photo only on the first published row of that year). About team API is Impl 60 (`/api/about/team`; members + meta; write = super_admin/admin; photo allowed on every member). Press CMS API is Impl 63 (`/api/press` meta + news + stills; write = super_admin/admin; first GET upserts kit copy with an empty news table). FAQ API is Impl 66 (`/api/faq`; first GET seeds `q1`–`q20`; write = super_admin/admin). Cookie Policy API is Impl 66 (`/api/cookies`; first GET seeds meta + 16 rows; write = super_admin/admin; backend folder `cookiePolicy`). Media adapter is Impl 34 (`/api/media` + local disk `/uploads`). R2 driver is Impl 41 (`createObjectStore` when real R2 env is set). Do **not** use `PUT /api/data` as the production contract. The Vite app uses mock by default; `VITE_USE_MOCK_API=false` uses cookie + catalog + media + coin packages + comments + users + notifications + settings + about history + about team APIs (Impl 33 + 35 + 44 + 53 + 54 + 46 + 47 + 59 + 60). Press desk `/press` uses `/api/press` when that flag is false (Impl 63; page-local, not `reloadCatalog`). FAQ `/faq` and Cookies `/cookies` use `/api/faq` and `/api/cookies` when that flag is false (Impl 66; page-local). Default Media Library stays data-URL until that flag is false.
- `.env.example` stub `JWT_SECRET` and `R2_ACCESS_KEY_ID=fake` / `R2_SECRET_ACCESS_KEY=fake` (treated as **not configured** — local disk). Real R2 needs `R2_BUCKET`, `R2_PUBLIC_BASE_URL`, and `R2_ACCOUNT_ID` or `R2_ENDPOINT`. `MEDIA_UPLOAD_DIR` / `MEDIA_PUBLIC_BASE_URL` stay non-secret. No Cloudinary SDK. `BREVO_API_KEY=fake` (or missing) plus empty `BREVO_SENDER_EMAIL` skips send. Real mail needs a non-fake `BREVO_API_KEY` and `BREVO_SENDER_EMAIL`. `ADMIN_APP_URL` is the Admin origin for invite and reset emails (default `http://localhost:5173`; production must set the real Admin URL, not API `:3000`). No `VITE_BREVO_*` or `VITE_OIDC_*`. `BOOTSTRAP_ADMIN_*` and `OIDC_*` empty/`fake` skip env seed and SSO.
- Live `reloadCatalog` (Impl 61): authors/genres/webtoons/episodes are catalog-critical. Media, coin packages, comments, reader users, notifications, settings, about history, and about team are satellite GETs (`Promise.allSettled`). A satellite 500 must not show `"Catalog request failed."` or empty the catalog. GET `/api/comments` and GET `/api/about/history` return `[]` on Prisma `P2021` (missing table). Do not Admin-migrate `CREATE TABLE ReaderComment` (website owns CREATE). `AboutHistory` / `AboutTeam` / `PressMeta` / `PressNews` / `PressStill` / `FaqMeta` / `FaqItem` / `CookieMeta` / `CookieStorageRow` are Admin migrate. Press, FAQ, and Cookies desk load is page-local (not a satellite `reloadCatalog` lane). GET `/api/faq` and GET `/api/cookies` fail-open to seed on `P2021`.
- Postgres: `DATABASE_URL` in `backend/.env` (gitignored). Local: `docker compose -f backend/docker-compose.yml up -d` then `npm run db:migrate -w backend`. Leader **dev** Railway values also go only in that `.env`, never in git. `npm run check` does not need Docker. Committed stubs stay `fake` / empty.
- Local uploads: `backend/uploads/` (gitignored except `.gitkeep`). `npm run dev:api` cwd is `backend/`, so `./uploads` is that folder. `GET /uploads` is disk mode only.
- Object keys in Postgres stay `{uuid}{ext}`. Live image ingest (Impl 56) stores JPEG/PNG/still WebP as `{uuid}.webp` (`image/webp`, sharp quality 80, no resize). GIF, PDF, and animated frames (`pages > 1`) keep the original bytes and extension. Inbound 2MB is unchanged. Fail closed: sharp throw or dimension mismatch is 400; never persist original JPEG labeled as WebP. `sharp` is a backend dependency only. Mock desk still stores original data URLs. R2 bucket keys use prefix `admin/` (`R2_KEY_PREFIX`). Public URLs are rebuilt from `key` + `R2_PUBLIC_BASE_URL` or `MEDIA_PUBLIC_BASE_URL`.
- Invite mail (Impl 43): in-repo HTML via Brevo when configured; `fake`/missing skips send and still returns the invite token. Forgot/reset HTML is filled (`{{resetUrl}}` / password-changed). Do not treat `R2_*=fake` as a live driver.
- CORS: `CORS_ORIGINS` comma-separated exact origins (default `http://localhost:5173`). No `*` / `*.vercel.app`. Cookie: `COOKIE_SAMESITE` (`lax` default), `COOKIE_SECURE` (blank follows production). `SameSite=none` forces Secure. No `COOKIE_DOMAIN`.
