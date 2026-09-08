---
title: Staff Help page
type: convention
date: 2026-08-31
tags: [admin, help, commands, navigation]
---

# Staff Help page

`/help` is the staff desk handbook. The command palette is the jumper, not a docs page.

- Entry: Admin sidebar **Help**, Profile **Help & Support**, palette slug `help` (`Go to Help` → `/help`).
- Six tabs **on `/help` only**, under the h1: Overview, Catalog, Community, Business, Admin, Commands. Do not add these as Sidebar items or Header chips. Labels reuse sidebar category words so the handbook matches the desk.
- `?tab=catalog|community|business|admin|commands`. Omit `tab` for Overview. Invalid/missing → overview. Do not write `?tab=overview` on first paint.
- Copy is must-say (data honesty, catalog order, who can write, escalate). Do not narrate every sidebar page. Do not reprint form/modal text the page already shows.
- Data copy uses `isMockApi()`. Do not show `VITE_USE_MOCK_API` to staff.
- Roles reuse `STAFF_ROLE_GUIDE` + `formatAdminRole` (same strings as Team).
- Escalate: desk-owner email on Overview (_If something is broken_). Commands tab has no Contact / mailto block.
- Team invite: copy-link always; the API may also email when mail is configured. Super Admin cannot be invited. Revoke on a pending invite is mock-only.
- Command list uses the same `filterCommands` / role hide as the palette. Go/Create rows navigate; System rows are read-only.
- No Help modal. No `/commands` route. No Commands sidebar item.
