---
title: Catalog titles + schema 14 (Impl 36)
type: note
date: 2026-08-25
tags: [admin, catalog, schema, titles, impl-36, website-parity]
---

# Impl 36 — Catalog titles + schema 14

Admin-only follow-up so `@softgate/shared` matches website Impl **177** demo titles and envelope **schema 14**. Lark tracks this as website **178** follow-up; Admin numbering is **Impl 36**.

## What changed

- `SHARED_DATA_SCHEMA_VERSION` **13 → 14** in `packages/shared/src/data.ts`.
- Demo series bilingual titles aligned with portal seed (Latin cover-brand MM where website keeps Latin; literary MM kept for Golden Age, Blood Moon `သွေးနက်လ`, Campus Life; Love in Seoul MM + Seoul desc/tags).
- Mirrored title strings on `mockPopularWebtoons`, series-1 `mockEpisodes[].webtoonTitle`, activity `targetName`, and `mockScheduledEpisodes[0].webtoonTitle`.
- Cover paths unchanged. Website repo not edited. No migrate-from-13 helper (mismatch falls back to seed).

## Verify

`npm run check`

## Out of scope

Authors/KPI, backend seed, auth schema, Forest Spirit literary MM, copying portal extra episodes/genres.
