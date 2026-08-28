---
title: Backend lives in sibling backend/ not in Vite src
type: convention
date: 2026-08-24
tags: [backend, workspace, express, vite, prisma, media]
impl: 35
---

# Backend workspace

The HTTP API is [`backend/`](../../backend/), an npm workspace. The Admin dashboard stays a Vite SPA at the **repo root** (`src/`).

- Do not add Express to root `package.json` or `src/`.
- Do not move Admin into `apps/admin` in this track (see [ADR 002](../decisions/002-admin-root-sibling-backend.md)).
- Do not run Prettier from `backend/` (root `.prettierrc.json` uses `prettier-plugin-tailwindcss`).
- Dev: `npm run dev` (Vite :5173) and `npm run dev:api` (Express, default :3000). If TextPad is also on 3000, set `PORT=3001`.
- Staff auth API is Impl 31 (`/api/staff`). Catalog CRUD API is Impl 32 (`/api/authors|genres|webtoons|episodes`). Media adapter is Impl 34 (`/api/media` + local disk `/uploads`). Do **not** use `PUT /api/data` as the production contract. The Vite app uses mock by default; `VITE_USE_MOCK_API=false` talks to staff + catalog + media APIs (Impl 33 + 35). Default Media Library stays data-URL until that flag is false.
- `.env.example` fake `JWT_SECRET`; `MEDIA_UPLOAD_DIR` / `MEDIA_PUBLIC_BASE_URL` (non-secret); unused R2/Brevo stubs (not read in code). **R2/Cloudinary SDKs are not wired** — remote vendor TBD.
- Postgres: `DATABASE_URL` in `backend/.env`. Local: `docker compose -f backend/docker-compose.yml up -d` then `npm run db:migrate -w backend`. `npm run check` does not need Docker.
- Local uploads: `backend/uploads/` (gitignored except `.gitkeep`). `npm run dev:api` cwd is `backend/`, so `./uploads` is that folder.
- Future vendors (not wired): Cloudflare R2 / Cloudinary / S3 (media), Brevo (mail). Swap at `ObjectStore`; do not branch on unread `R2_*` until the team locks a vendor.
