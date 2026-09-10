---
title: FAQ and Cookie Policy CMS
type: convention
date: 2026-09-10
tags: [faq, cookies, cms, desk, admin]
---

# FAQ and Cookie Policy CMS

`/faq` and `/cookies` are About-class CMS desks for reader `/faq` and `/cookies`. Admin writes copy. Website public read is website Impl 213 (`GET /api/faq` / `GET /api/cookies`). Admin staff routes stay cookie-auth.

- Same-path staff desks. Do **not** use `/legal` for FAQ or Cookies. `/legal` is Privacy + Terms only. Do not delete clickwrap stubs at Admin `/privacy` `/terms`.
- Page-local load. Do not add a catalog lane. CatalogStatus stays catalog-only. Lane copy **FAQ request failed.** / **Cookie policy request failed.**
- Mock keys `softgate_admin_faq_v1` / `softgate_admin_cookies_v1` (not catalog schema 14). Missing key seeds FAQ `q1`–`q20` and 16 cookie rows. Saved `items: []` / `rows: []` stays empty.
- Write = Super Admin / Admin (`canWriteSettings`). Member / Viewer GET only.
- FAQ related paths: `/`, `/profile`, `/coins`, `/contact`, `/creators`, `/library`, `/notifications` (at most one). Server assigns `q{nextItemNumber}` and never reuses a deleted id.
- Cookie `storageKey` is frozen (16 keys). PATCH cannot change it. POST only unused allowlisted keys. Glance is `meta.glance` (exactly 5), not `copy`. Do not CMS LegalPageShell mailto / `contactUs`. Do not add an analytics-on flag.
- Backend folder is `backend/src/cookiePolicy/` (API path stays `/api/cookies`). Types live in `src/lib/faq.ts` + `src/lib/cookiesPolicy.ts`, not `packages/shared`.
- Help honesty is Press-style: saves can reach reader `/faq` `/cookies` when the portal persist is on. Do not add Admin public GET.
