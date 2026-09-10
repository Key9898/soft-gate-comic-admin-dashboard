---
title: Impl 58 in-page webtoon editor
type: note
date: 2026-09-10
tags: [admin, webtoons, spa, impl]
impl: 58
---

# Impl 58 — In-page webtoon editor

Website repo untouched. No Prisma change. Authors/Genres stay modal. Comments/catalog banner coupling is not this Impl. Leftover Impl 51 files were not part of this work.

## Contract

Series add/edit is a desk page, not a nested modal. Cover stays Choose from Media. Catalog write body and spotlight rules stay the same. Never persist `blob:` on `coverImage`. Delete confirm stays a modal on the list.

## SPA

- `/webtoons` list: Add/Edit navigate; delete confirm stays a modal.
- `/webtoons/new` and `/webtoons/:webtoonId/edit` (`WebtoonEditorPage`). Palette `webtoon.new` → `/webtoons/new`. `?new=1` on the list replaces to create after auth is ready.
- Viewer / no-write is redirected off the editor. Unknown id is not-found after catalog load.

## Help

`CATALOG_NOTES` Order: add/edit series on `/webtoons/new` and `/webtoons/:id/edit`; cover from Media; authors/genres stay on their list pages.
