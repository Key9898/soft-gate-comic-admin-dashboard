---
title: Admin Genres CRUD (Impl 22)
type: note
date: 2026-08-22
tags: [admin, genres, catalog, crud]
---

# Impl 22 — Genre CRUD (wiki 15)

Standalone Admin CMS for catalog categories so portal `/categories/:slug` can consume bilingual names and a stable slug from schema 13. Not merged with Authors. Coin packages, `inactive`, description editors, primary genre, and website `applyCatalogSeed` are out of scope.

## Surface

- Route `/genres` (eager), Sidebar after Authors with `LayoutGrid`. No keyboard shortcut.
- List: EN name, MM name, slug, derived series count.
- Form: `name.en` / `name.mm` (MM optional, never copy EN), slug on create only (read-only on edit). Submit requires `name.en` and a unique kebab slug that is not `all`.
- Helpers in `src/lib/genres.ts`: `nextGenreId`, slug rules, `all` sentinel, assigned/derived counts, picker, canonicalize to slug, token cascade, sync counts.

## Locked rules

- Edit never changes `id` or `slug`. Mock `"1"`…`"10"` stay.
- Delete disabled when series are assigned (including drafts) or when `slug === 'all'`. Empty non-`all` genres may be deleted. Series are not cascade-deleted.
- Saving `all` updates names + `webtoonCount` only (no token cascade).
- Webtoons chips store slugs; table badges show EN via alias resolve. `all` is not in the picker.
- `webtoonCount` is derived. Analytics pie skips `all`.
- `ActivityLog.targetType` includes `'genre'`. Schema remains **13**.
