---
title: Sibling backend workspace + GET /health (Impl 29)
type: note
date: 2026-08-24
tags: [backend, workspace, health, impl]
impl: 29
---

# Impl 29 — Sibling `backend/` + `GET /health`

npm workspace `backend/` in this Admin git repo. Express is not mixed into the Vite SPA. Admin `src/` stays at repo root. No database. No domain APIs. Do not start Impl 30+.

## Layout

- Workspace name `softgate-backend`. Root `workspaces: ["backend"]`. `@softgate/shared` stays a Vite path alias (not a workspace).
- `GET /health` → `{ status: "ok", timestamp }` (ISO). Default `PORT=3000`. CORS origin `http://localhost:5173` only.
- `createApp()` has no `listen`. Tests use supertest. `npm run dev:api` for the process.
- ESM: `"type": "module"`, `module`/`moduleResolution` `NodeNext`, relative imports use `.js` suffixes.

## Gates

- Root ESLint ignores `backend/**`. lint-staged `eslint --fix --no-warn-ignored` so ignored API files do not fail pre-commit. Root Vite/Playwright `*.ts` configs stay in the `*.{ts,tsx}` glob.
- Prettier for API sources runs from **repo root** only (`backend/src/**/*.ts`). No `backend/.prettierrc`.
- Root `npm run check` ends with `npm run check -w backend` (lint + vitest + `tsc`). Root `tsc -b` does not reference `backend`.
- Install only at repo root. No nested `backend/package-lock.json`.

## Out of scope

- Mongo/Postgres, staff auth, catalog CRUD, Admin SPA switch, media, coins, reader auth.
- Website / `soft-gate-comic` repo — **do not edit**. Portal consume is not this agent’s work. Impl 29 is not a replacement for the pre-backend catalog pipe.
- `VITE_USE_MOCK_API`, Vite proxy, `DataContext` blob `PUT /api/data`.
