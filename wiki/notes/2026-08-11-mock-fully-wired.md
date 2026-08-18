---
title: Mock fully wired (Impl 9)
type: note
date: 2026-08-11
tags: [mock, datacontext, media, schedule, reports, notifications, revenue]
---

# Impl 9 — Mock fully wired

Closed Profile-class disconnects so the admin mock layer uses a single SharedData / DataContext (plus Auth) store.

## Workstreams

| Stream | Outcome                                                                       |
| ------ | ----------------------------------------------------------------------------- |
| 9A     | MediaPicker, Schedule, Reports → DataContext                                  |
| 9B     | Notifications in SharedData; Bell; Activity Log page + CRUD appends           |
| 9C     | Revenue transactions + derived KPIs (payouts = `type === 'payout'`)           |
| 9D     | Password hash, Search, Help modal, shell dark theme, color swatches, siteName |
| 9E     | Dashboard/Analytics derived from live entities + date chips                   |

## Key files

- `src/lib/activityLog.ts`, `src/lib/mediaUpload.ts`, `src/lib/DataContext.tsx`
- `packages/shared/src/types.ts` / `data.ts` (`notifications`, `passwordHash`, richer transactions)
- Feature pages: schedule, reports, notifications, activity-log, revenue, dashboard, analytics, settings, profile
- Shell: Header, Sidebar, Card, AdminLayout, ProfileDropdown, MediaPicker, `tailwind.config.js`

## Out of scope

Real backend HTTP clients, website sync, CDN uploads.
