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
- Sign in: no public Sign up. Empty staff uses **Create the first Super Admin**. After that, Sign in + Team invite. Reader registration is a website setting.
- Coin packages: shop SKUs, not a payments API. With the catalog API on, they save on `/api/coin-packages`. Super Admin and Admin can write.
- Users: live desk is portal ReaderUser on `/api/users`. Delete removes the reader. Coins are wallet read-only. Team is still staff. Ban and suspend stay mock-only. The Reports list stays empty when the catalog API is on (no reports API). Mock desk still shows demo reports. Super Admin and Admin can write.
- Comments: live desk is portal ReaderComment on `/api/comments`. Reported is the queue. Delete removes the reader thread. Super Admin and Admin can write. Comments and users load separately from the catalog; a comments API failure does not empty Webtoons or show a catalog banner.
- Notifications: desk inbox on `/api/notifications` when the catalog API is on; not the reader inbox. Hard-delete. Super Admin and Admin can write; Member and Viewer look only. Super Admin and Admin can send bilingual reader broadcasts (`/api/reader-broadcasts`) when the website service is configured.
- Settings: four portal-safe fields on `/api/settings` when the catalog API is on; they can reach the reader site when the portal persist is on. Theme is not Save. Super Admin and Admin can write; Member and Viewer look only.
- About: timeline and team CMS on `/about` (`/api/about/history`, `/api/about/team`). History: year, month, bilingual title and description; a photo is only on the first published entry of that year. Team: bilingual name and role, optional photo on every member, plus page deck and stand-in copy. Super Admin and Admin can write; Member and Viewer look only. This desk does not change reader `/about` until website 205–207.
- Press: kit CMS on `/press` (`/api/press`). Saves on this desk’s Press API and can reach reader `/press` when the portal persist is on. ZIP is a URL field. Spokesperson is an About team pick. Palette stays on this page. Super Admin and Admin can write; Member and Viewer look only. Page-local load; **Press request failed.** is not a catalog banner.
- FAQ: CMS on `/faq` (`/api/faq`). Super Admin and Admin can write; Member and Viewer look only. Page-local load; **FAQ request failed.** is not a catalog banner. Saves can reach reader `/faq` when the portal persist is on.
- Cookies: CMS on `/cookies` (`/api/cookies`). Storage keys stay on the frozen legal table. Super Admin and Admin can write; Member and Viewer look only. Page-local load; **Cookie policy request failed.** is not a catalog banner. Saves can reach reader `/cookies` when the portal persist is on.
- Legal: Privacy and Terms CMS on `/legal` (`/api/legal`). Clickwrap stubs at `/privacy` `/terms` stay public. Super Admin and Admin can write; Member and Viewer look only.
- Command list uses the same `filterCommands` / role hide as the palette. Go/Create rows navigate; System rows are read-only.
- Episode pages: JPEG/PNG on `/episodes/new` and `/episodes/:id/edit` go through Media (2MB each). When the catalog API is on, live Media stores WebP at the same pixels; mock keeps the original data URL. The PDF slot is gone. Bulk Upload (PDF split) is mock desk only.
- Series: Add/Edit is `/webtoons/new` and `/webtoons/:id/edit`. Cover comes from Media. Authors and genres stay on their list pages.
- Live catalog: non-draft series can appear on the public reader site. Do not leave ops smoke titles `ongoing` or `published`. After a live probe, delete the series (episodes first), then unused author or genre, then the matched Media files.
- Analytics / Revenue: on the catalog API the chart and transaction lists are empty (not portal money). Caption **Not wired on live**. Mock desk still shows demo series. Reports stay empty on the catalog API (no reports API); caption **Not wired on live**. Activity Log starts empty on the catalog API and only records this browser’s trail; caption **This session only**. Export is a CSV of this desk’s list, not a bank.
- No Help modal. No `/commands` route. No Commands sidebar item.
