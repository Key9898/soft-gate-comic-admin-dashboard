---
title: Impl 61 catalog fail-open
type: note
date: 2026-09-10
tags: [admin, catalog, comments, about, spa, impl]
impl: 61
---

# Impl 61 — Catalog fail-open + comments/about 500

Website repo untouched. No Admin `CREATE TABLE ReaderComment`. Webtoon editor (Impl 58) unchanged.

## Why the banner fired

Live `reloadCatalog` used one `Promise.all`. `GET /api/comments` 500 (`ReaderComment` missing) and `GET /api/about/history` 500 (`AboutHistory` not migrated) rejected the whole batch, set `"Catalog request failed."`, and emptied webtoons. Retry called the same function.

## Desk

Authors/genres/webtoons/episodes stay catalog-critical. Media, coin packages, comments, reader users, notifications, settings, about history, and about team are `Promise.allSettled`. A satellite reject empties that slice only. Catalog GET fail still shows the banner.

## API + DB

GET `/api/comments` and GET `/api/about/history` return empty lists on Prisma `P2021`. PATCH/DELETE stay fail-closed. Admin migrate applied `AboutHistory` and `AboutTeam` on the live `DATABASE_URL`. `ReaderComment` stays website-owned CREATE. Impl 60 is the already-landed Team CMS; this fail-open work is Impl 61 (desk lanes UI is Impl 62).
