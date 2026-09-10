---
title: Live Dashboard Analytics Revenue empty
type: convention
date: 2026-09-10
tags: [admin, dashboard, analytics, revenue, reports, activity-log, mock, live]
impl: 64
---

# Live business slices stay empty

When `VITE_USE_MOCK_API=false`, [`emptyApiCatalog()`](../../src/lib/DataContext.tsx) must override `revenueData`, `userGrowthData`, `popularWebtoons`, `transactions`, `reports`, and `activityLogs` to `[]` **after** spreading `mockNonCatalog`. Do not strip those seeds from `mockNonCatalog` (mock desk dies). Live `reloadCatalog` does not fill them and must not reset `activityLogs` (session trail). There is no `/api/analytics`, `/api/revenue`, `/api/reports`, or `/api/activity`.

Dashboard / Analytics / Revenue show `$0` / empty lists with caption **Not wired on live**. Reports uses the same caption and EmptyState **This desk has no reports API.** Activity Log uses caption **This session only** (not **Not wired on live**); `appendActivityLog` still prepends this browser’s trail. Do not use `LaneStatus` or Retry (no API). Genre Distribution stays catalog genres. Mock desk still shows The Last Horizon / `john_doe`. Do not seed fake purchases on the shared DB. Website repo untouched.

See [live-business-empty note](../notes/2026-09-10-live-business-empty.md) and [Impl 65 note](../notes/2026-09-10-live-reports-activity-empty.md).
