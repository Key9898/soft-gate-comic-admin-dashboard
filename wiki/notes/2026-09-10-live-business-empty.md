---
title: Impl 64 live business empty
type: note
date: 2026-09-10
tags: [admin, dashboard, analytics, revenue, spa, impl]
impl: 64
---

# Impl 64 — Live Dashboard / Analytics / Revenue honest empty

Website repo untouched. No analytics/revenue REST. No Admin fake purchase seed. Impl 63 is Press CMS (filled later the same day).

## Why

Live `emptyApiCatalog` spread `mockNonCatalog`, so catalog KPIs went to `0` while charts still showed `$75,400`, `$29.98`, The Last Horizon, and `john_doe`. `reloadCatalog` never overwrote those keys.

## Desk

Live initial state now zeros `revenueData`, `userGrowthData`, `popularWebtoons`, and `transactions`. Mock `loadMockDb` unchanged. Pages caption **Not wired on live** and EmptyState instead of empty Recharts. Genre pie stays live genres. Help Business: catalog API lists are empty, not portal money.

## Out of scope

Reports, Schedule, Activity Log. Portal wallet API is a later Impl.
