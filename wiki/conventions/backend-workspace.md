---
title: Backend lives in sibling backend/ not in Vite src
type: convention
date: 2026-09-08
tags: [backend, workspace, express, vite, prisma, media, r2, cors, mail, brevo]
impl: 43
---

# Backend workspace

The HTTP API is [`backend/`](../../backend/), an npm workspace. The Admin dashboard stays a Vite SPA at the **repo root** (`src/`).

- Do not add Express to root `package.json` or `src/`.
- Do not move Admin into `apps/admin` in this track (see [ADR 002](../decisions/002-admin-root-sibling-backend.md)).
- Do not run Prettier from `backend/` (root `.prettierrc.json` uses `prettier-plugin-tailwindcss`).
- Dev: `npm run dev` (Vite :5173) and `npm run dev:api` (Express, default :3000). If TextPad is also on 3000, set `PORT=3001`.
- Staff auth API is Impl 31 (`/api/staff`). Catalog CRUD API is Impl 32 (`/api/authors|genres|webtoons|episodes`). Media adapter is Impl 34 (`/api/media` + local disk `/uploads`). R2 driver is Impl 41 (`createObjectStore` when real R2 env is set). Do **not** use `PUT /api/data` as the production contract. The Vite app uses mock by default; `VITE_USE_MOCK_API=false` talks to staff + catalog + media APIs (Impl 33 + 35). Default Media Library stays data-URL until that flag is false.
- `.env.example` stub `JWT_SECRET` and `R2_ACCESS_KEY_ID=fake` / `R2_SECRET_ACCESS_KEY=fake` (treated as **not configured** — local disk). Real R2 needs `R2_BUCKET`, `R2_PUBLIC_BASE_URL`, and `R2_ACCOUNT_ID` or `R2_ENDPOINT`. `MEDIA_UPLOAD_DIR` / `MEDIA_PUBLIC_BASE_URL` stay non-secret. No Cloudinary SDK. `BREVO_API_KEY=fake` (or missing) plus empty `BREVO_SENDER_EMAIL` skips send. Real mail needs a non-fake `BREVO_API_KEY` and `BREVO_SENDER_EMAIL`. `ADMIN_APP_URL` is the Admin origin for invite emails (default `http://localhost:5173`; production must set the real Admin URL, not API `:3000`). No `VITE_BREVO_*`.
- Postgres: `DATABASE_URL` in `backend/.env` (gitignored). Local: `docker compose -f backend/docker-compose.yml up -d` then `npm run db:migrate -w backend`. Leader **dev** Railway values also go only in that `.env`, never in git. `npm run check` does not need Docker. Committed stubs stay `fake` / empty.
- Local uploads: `backend/uploads/` (gitignored except `.gitkeep`). `npm run dev:api` cwd is `backend/`, so `./uploads` is that folder. `GET /uploads` is disk mode only.
- Object keys in Postgres stay `{uuid}{ext}`. R2 bucket keys use prefix `admin/` (`R2_KEY_PREFIX`). Public URLs are rebuilt from `key` + `R2_PUBLIC_BASE_URL` or `MEDIA_PUBLIC_BASE_URL`.
- Invite mail (Impl 43): in-repo HTML via Brevo when configured; `fake`/missing skips send and still returns the invite token. Forgot/reset HTML files are placeholders only. Do not treat `R2_*=fake` as a live driver.
- CORS: `CORS_ORIGINS` comma-separated exact origins (default `http://localhost:5173`). No `*` / `*.vercel.app`. Cookie: `COOKIE_SAMESITE` (`lax` default), `COOKIE_SECURE` (blank follows production). `SameSite=none` forces Secure. No `COOKIE_DOMAIN`.
