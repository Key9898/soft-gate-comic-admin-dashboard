---
title: Impl 62 split desk load lanes
type: note
date: 2026-09-10
tags: [admin, catalog, comments, loading, impl]
impl: 62
---

# Impl 62 — Split desk load lanes

Live `reloadCatalog` no longer waits on mixed `Promise.all` of catalog + comments + the other side APIs. Core is `loadCatalog()` only (`/api/authors|genres|webtoons|episodes`). That lane owns `isLoading` and CatalogStatus copy **Catalog request failed.** Six side lanes (media, coins, comments, users, notifications, about history+team) settle after with `Promise.allSettled`. A comments GET 500 does not clear webtoons or paint a catalog banner on every page.

Side list pages skeleton on their own `*Loading`. Error uses shared `LaneStatus` chrome (`Comments request failed.` and the other five copies) plus Retry (`reloadCatalog`). EmptyState is success + empty only. Dashboard live captions do not print `0` comments/users while that lane is loading or failed. Settings stay fail-open. Mock `reloadCatalog` still no-ops; mock Comments hide/soft-delete unchanged.

No Admin migrate CREATE `ReaderComment`. Website repo untouched. Help COMMUNITY (not Catalog index-2) states comments/users load separately from the catalog.
