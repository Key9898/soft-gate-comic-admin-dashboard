---
title: Loading states (admin skeleton contract)
type: convention
date: 2026-08-21
tags: [loading, skeleton, a11y, tailwind]
---

# Loading states

Admin CMS wait chrome. Not the reader website.

## Rules

- Content wait = that route’s skeleton **inside** Sidebar + Header. No splash, no full-screen `"Loading..."`, no spinner on top of a skeleton.
- Empty ≠ loading ≠ error.
- Mock `DataContext`: `isLoading` starts **false**. No artificial delay. Side-lane `*Loading` flags also start false.
- API path (`VITE_USE_MOCK_API=false`): core `isLoading` starts true until `/api/authors|genres|webtoons|episodes` settle. Side list pages wait on their own `*Loading`. A side-lane failure does not set catalog `error`. Core failure clears only the four catalog arrays and sets `error`.
- Login stays `Button isLoading`. Do not skeleton the login form.
- Cover/thumb sheen only when an `<img src>` is rendered. Default loaded **true** if `onLoad` is omitted. Pair `onLoad` + `onError` when sheen is wired.
- Bone fill `bg-gray-200` (remapped under `html.dark`). Do not add `dark:bg-*` pairs on skeleton shells.
- Sheen class `skeleton-sheen`: 1.8s ease-in-out sweep. **Stops** under `prefers-reduced-motion`.
- Tailwind v3: sheen lives in `global.css` `@layer utilities` (not v4 `@utility`).
- PageSEO stays mounted while the skeleton shows (Helmet titles).
- No pagination bones — admin lists are not paged.

## CatalogStatus

Mounted in `AdminLayout` `<main>` above `Outlet`. Core catalog error only: **Catalog request failed.** + Retry. Same Retry if core loading lasts more than 10s. Side-lane failures use `LaneStatus` on that list page (not a second banner here). See [`desk-load-lanes.md`](desk-load-lanes.md).
