---
title: Purge live Impl 50 smoke catalog
type: note
date: 2026-09-10
tags: [catalog, smoke, r2, ops, impl]
impl: 57
---

# Impl 57 — Purge live Impl 50 smoke catalog

Ops-and-convention only. No new API or Prisma models. Website repo, mock seeds, coin SKU, platform settings, and in-flight Webtoons/Episodes UX files untouched.

## Convention

Live shared Postgres is reader-visible. Ops smoke must not stay `ongoing` / `published`. After verify, delete via staff REST: episodes → webtoon → unused author/genre (never slug `all`) → matched `/api/media/:id` (R2 object goes with that DELETE). Prefer `draft` only while a probe is in flight. See [live-catalog-smoke.md](../conventions/live-catalog-smoke.md).

## Identify

Staff cookie (existing Super Admin JWT; login password still ephemeral). Canonical match was bilingual title/description from the reader screenshot, not a guessed slug.

- One webtoon: title `Impl 50 R2 Smoke …`, description `Live R2 catalog smoke`, status `ongoing`
- One published episode with a panel URL
- Author `Impl 50 Author` (webtoonCount 1)
- Genre slug `impl-50-r2` (not `all`)
- Two MediaAsset rows: cover + panel PNG on `{R2_PUBLIC_BASE_URL}/admin/{uuid}.png`

## Delete (staff REST)

All `200 { ok: true }`. Afterward: webtoons/episodes/authors/genres/media lists empty of that graph. `HEAD` on both public R2 URLs `404`. Coin package and `PlatformSettings` not touched. Catalog counts after this pass were zero series (the smoke row was the only live title).

## Honesty

Help Catalog note **Live smoke** appended (index 2 Schedule unchanged). AGENTS Impl 50 line now says URL shape was proved and the live graph was purged — do not recreate a published smoke title.
