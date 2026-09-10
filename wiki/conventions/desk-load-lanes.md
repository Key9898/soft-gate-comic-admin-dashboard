---
title: Desk load lanes
type: convention
date: 2026-09-10
tags: [admin, catalog, loading, comments]
---

# Desk load lanes

Live `reloadCatalog` (`VITE_USE_MOCK_API=false`) loads the desk in two stages. Mock `reloadCatalog` is still a no-op.

## Core

`loadCatalog()` only: `/api/authors|genres|webtoons|episodes`. Failure sets shared `error`. [`CatalogStatus`](../../src/components/CatalogStatus/CatalogStatus.tsx) copy stays **Catalog request failed.** Core failure clears only those four arrays. `isLoading` is core-only, so Webtoons / Authors / Genres / Episodes / Schedule / editors unblock when catalog returns.

## Side

Settled with `Promise.allSettled` after core: media, coin packages, comments, reader users, notifications, about (history + team members/meta as one lane). Failure must not set catalog `error` and must not clear core arrays. Each side list page skeletons on its own `*Loading` and shows `LaneStatus` with lane copy (`Comments request failed.`, `Users request failed.`, `Notifications request failed.`, `Media request failed.`, `Coin packages request failed.`, `About request failed.`). EmptyState is success + `[]` only. Retry still calls `reloadCatalog` (all lanes). No second comments banner on AdminLayout. Press (`/press`, Impl 63) is page-local — not a 7th catalog lane; its copy is **Press request failed.** FAQ (`/faq`) and Cookies (`/cookies`, Impl 66) are also page-local; copy is **FAQ request failed.** / **Cookie policy request failed.**

First-load reject for a lane writes `[]` plus that lane’s error. A later reject keeps the last successful slice.

## Settings

`getPlatformSettings` runs with the sides and fail-opens to the four portal-safe defaults. It is not a CatalogStatus trigger.

## Accepted leftovers

Header bell can be empty until notifications settle. MediaPicker on the webtoon editor can be empty until media settles (error lives on `/media`). Team / Profile / Reports / Revenue stay on core `isLoading`.
