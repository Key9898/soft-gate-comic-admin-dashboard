---
title: Catalog CRUD APIs (Impl 32)
type: note
date: 2026-08-24
tags: [backend, catalog, crud, prisma, impl]
impl: 32
---

# Impl 32 — Catalog CRUD APIs

`backend/` only. Admin Vite mock (localStorage blob) is unchanged until Impl 33 (now wired: SPA uses REST when `VITE_USE_MOCK_API=false`). Website repo untouched. No coins/unlock. No Cloudinary/R2.

## API

- Cookie `sg_staff` required. Viewer GET; Member+ POST/PATCH/DELETE (`canWriteCatalog`).
- Resources: `/api/authors`, `/api/genres`, `/api/webtoons`, `/api/episodes`. Envelope `{ authors }`, `{ webtoon }`, etc.
- Production contract is these REST routes — **not** `PUT /api/data`.
- Rules copied in `backend/src/catalog/rules.ts` (do not import Admin `src/` or `@softgate/shared`).
- Genre: kebab slug lowercase, not `all`; slug immutable; DELETE 409 if assigned (including drafts) or `all`. Unknown token 400.
- Author: DELETE 409 if any series assigned. New webtoon author must be `active`.
- Spotlight: cap 5 non-draft; order 1–5 unique including drafts.
- Schedule: UTC ISO `scheduledAt`; unschedule → `draft` + clear stamp. Yangon conversion stays SPA.
- Webtoon DELETE: 409 if any episode exists (Restrict). Genre join rows cascade with the webtoon.
- `episodeNumber` unique per series; omit → `max+1`. `rating` Float, not writable. `isPremium`/`coinPrice` persist as catalog fields only.
- Tests: in-memory `CatalogStore`. `npm run check` does not need Docker.

## Out of this Impl

Admin SPA wire (33), coin packages/unlock, media upload, settings blob API, website consume.
