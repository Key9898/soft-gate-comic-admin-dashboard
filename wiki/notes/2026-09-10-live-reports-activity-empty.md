---
title: Impl 65 live Reports Activity Log empty
type: note
date: 2026-09-10
tags: [admin, reports, activity-log, mock, live, spa, impl]
impl: 65
---

# Impl 65 — Live Reports / Activity Log honest empty

Website repo untouched. No `/api/reports` or `/api/activity`. No LaneStatus/Retry. `appendActivityLog` still records this browser session. Mock desk keeps demo seeds.

## Why

Live `emptyApiCatalog` already zeroed revenue/charts (Impl 64) but still inherited `mockReports` (`john_doe`) and `mockActivityLogs` (The Last Horizon). `reloadCatalog` never fills those keys.

## Desk

Live initial state now zeros `reports` and `activityLogs`. Mock `loadMockDb` unchanged. Reports caption **Not wired on live** and EmptyState **This desk has no reports API.** Activity Log caption **This session only** (live-only); empty copy stays **No activity yet**. Help Overview/Community/Business no longer say **Reports stay mock**.
