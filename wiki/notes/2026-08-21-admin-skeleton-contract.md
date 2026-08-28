---
title: Admin production skeleton contract (Impl 17)
type: note
date: 2026-08-21
tags: [loading, skeleton, data-context]
---

# Impl 17 — Admin production skeleton contract

Eager feature-page imports; removed `PageLoader` / Routes `Suspense`. Fourteen layout-faithful `*PageSkeleton` files under `src/features/<name>/components/`. `DataContext` exposes `isLoading` / `error` / `retry`. `CatalogStatus` sits in AdminLayout main. Cover/avatar sheen uses `markIdLoaded` + `coverSheenClass`. EmptyState wired where `"No X found"` existed; named `NoUsers` / `NoComments` stay filter-miss only.

## Files

- `src/App.tsx`, `src/lib/DataContext.tsx`, `src/layouts/AdminLayout.tsx`
- `src/components/Skeleton/Skeleton.tsx`, `src/components/CatalogStatus/`
- `src/components/ProtectedRoute/ProtectedRoute.tsx`, `global.css`
- Feature `*Page.tsx` + `*PageSkeleton.tsx` (14 routes)
- `wiki/conventions/loading-states.md`
