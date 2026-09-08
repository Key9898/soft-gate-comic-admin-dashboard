---
title: Staff Help desk handbook (Impl 39)
type: note
date: 2026-08-31
tags: [admin, help, handbook, impl-39]
---

# Impl 39 — Staff Help desk handbook

`/help` is a six-tab staff handbook. Tabs sit under the Help h1 only (not Sidebar, Header, Profile, or Settings). Copy is must-say desk contracts, not a restatement of every form.

## Tabs

- **Overview** — desk vs reader site, mock/API data, Ctrl+K, desk-owner email (not a Contact widget).
- **Catalog** — author→series→episode order, API delete-with-episodes, schedule draft/scheduled only, bulk PDF mock-only, media 2MB/10MB, coins not a payments API.
- **Community** — Users/Comments/Reports mock; Admin+ writes; Member and Viewer look-only.
- **Business** — Analytics/Revenue/Notifications mock; Activity Log is this browser.
- **Admin** — `STAFF_ROLE_GUIDE` (same strings as Team), invite copy-link, Settings Save vs Theme, Profile not in sidebar.
- **Commands** — palette list only. No mailto under this tab.

`?tab=catalog|community|business|admin|commands`. Missing/invalid → overview without writing `?tab=overview` (e2e `/help`).

## Out of scope

`/commands` route, Commands sidebar item, Open/Add CTA grid, screenshot LMS, Intercom, reprint of Team/delete modals.
