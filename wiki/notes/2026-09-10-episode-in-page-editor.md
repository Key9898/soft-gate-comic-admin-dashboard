---
title: Impl 55 in-page episode editor
type: note
date: 2026-09-10
tags: [admin, episodes, media, spa, impl]
impl: 55
---

# Impl 55 — In-page episode editor

Website repo untouched. No Prisma change. No WebP/sharp (Impl 56). 2MB image limit unchanged. Leftover Impl 51 files were not part of this commit.

## Contract

Episode add/edit is a desk page, not a nested modal. JPEG/PNG pages persist through existing `/api/media` (live) or `readImageAsMediaFile` data URLs (mock). Catalog still stores URL strings + `imageSizes`. Never persist `blob:`.

## SPA

- `/episodes` list: Add/Edit navigate; delete confirm stays a modal; Bulk Upload stays `isMockApi()` only.
- `/episodes/new` and `/episodes/:episodeId/edit` (`EpisodeEditorPage`). Palette `episode.new` → `/episodes/new`. `?new=1` on the list replaces to create.
- On-page multi-select JPEG/PNG; numbered 1, 2, 3; reorder/remove; sequential persist; per-file errors. Optional From Media. PDF slot removed.
- Webtoon cover dashed copy is **Choose from Media** (picker unchanged).

## Help

`CATALOG_NOTES` Episode files: JPEG/PNG through Media (2MB); PDF slot gone; Bulk Upload (PDF split) mock desk only.
