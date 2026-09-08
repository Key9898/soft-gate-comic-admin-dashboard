---
title: Staff Help page (Impl 38)
type: note
date: 2026-08-31
tags: [admin, help, commands, impl-38]
---

# Impl 38 — Staff Help page + palette chrome

Replaced the Help dialog with `/help`. Palette footer teaches in-overlay keys. Header `kbd` shows `⌘K` on Mac.

## What landed

- `src/features/help/HelpPage.tsx` — desk how-to, role-filtered commands, desk-owner email + public site.
- `help` is Admin go `/help`. `HelpSupportModal` removed.
- Sidebar Admin: Team, Settings, Help. Profile Help & Support navigates to `/help`.

## Out of scope

`/commands` docs page, Commands sidebar item, Help dumped into Settings.
