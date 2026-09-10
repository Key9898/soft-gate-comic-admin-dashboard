---
title: Live catalog smoke
type: convention
date: 2026-09-10
tags: [catalog, smoke, r2, live]
---

# Live catalog smoke

The shared Postgres catalog is reader-visible when the portal persist is on. Ops smoke titles must not stay `ongoing` / `published` on that database.

- Impl 50 proved live R2 public URL shape (`{R2_PUBLIC_BASE_URL}/{prefix}/{key}`, default prefix `admin`). It does **not** authorize leaving a published smoke series on the reader homepage.
- While a probe is in flight, keep the series `draft` (and episodes `draft`). After verify, delete the graph via staff REST: episodes → webtoon → unused author/genre (never slug `all`) → matched `/api/media/:id` (that path already deletes the R2 object).
- Do not rename smoke to look like a real book. Do not hide it as draft and leave it. Do not `prisma.deleteMany` the catalog. Do not wipe the R2 bucket.
- Identify by the live title/description, then follow that webtoon’s FKs only. Leave any other live series.
- Mock seeds (`packages/shared/src/data.ts`) are not the live catalog. `VITE_USE_MOCK_API=false` does not put those titles on the reader origin.
