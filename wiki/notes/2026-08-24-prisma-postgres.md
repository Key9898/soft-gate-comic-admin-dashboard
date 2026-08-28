---
title: PostgreSQL + Prisma connect (Impl 30)
type: note
date: 2026-08-24
tags: [backend, prisma, postgres, impl]
impl: 30
---

# Impl 30 — PostgreSQL + Prisma (connect only)

`backend/` only. Prisma **6** (`@prisma/client` 6.19.x). No domain tables except `Meta`. No password column. Do not start Impl 31+.

## Runtime

- `DATABASE_URL` in `backend/.env` (gitignored). `.env.example` has local Docker URL. Never `VITE_*`.
- `GET /health` still 200 + `status: "ok"` + `timestamp`; adds `db: "up" | "down"`. Unit tests force empty `DATABASE_URL` so `db` is `down` without Docker.
- `npm run dev:api` requires `DATABASE_URL` and `$connect()` before listen (shared `getPrisma()` in `src/db.ts`).
- `prisma generate` uses `backend/scripts/prisma-generate.mjs` dummy URL (not for connect). `db:migrate` is `prisma migrate deploy` (not in `npm run check`).
- Local Postgres: `backend/docker-compose.yml` (Postgres 16, user/db `softgate`). Encrypt-at-rest is hosting when deploying — not field AES.

## Out of this Impl

- Staff auth / cookies / password hash (31)
- Catalog CRUD routes (32)
- Admin SPA / `DataContext` / Vite proxy (33)
- **Cloudflare R2** and **Brevo** — chosen for later (media / mail). Not in `.env.example` this Impl.
- Website / `soft-gate-comic` repo
