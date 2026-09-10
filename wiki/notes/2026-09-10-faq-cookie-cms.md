---
title: Impl 66 Admin FAQ Cookie Policy CMS
type: note
date: 2026-09-10
tags: [faq, cookies, cms, admin]
impl: 66
---

# Impl 66 — Admin FAQ + Cookie Policy CMS

Admin owns FAQ and Cookie Policy content in Postgres. Website public read is Impl 213 (`GET /api/faq` / `GET /api/cookies` on Hono). Admin staff `/api/faq` `/api/cookies` stay cookie-auth. Public GET on Admin Express is out.

## Routing

Staff desks are `/faq` and `/cookies` (same as About `/about`, Press `/press`). `/legal` stays Privacy + Terms. Clickwrap stubs at Admin `/privacy` `/terms` (`AuthLayout`, Setup/Invite) are unchanged.

## Schema (Admin migrate only)

Migration `20260910240000_faq_cookie_cms` (CREATE TABLE only). Privacy/Terms already used `20260910230000`. Seed is first GET, not SQL INSERT.

- `FaqMeta` singleton `id=faq`, `nextItemNumber` 21 after seed.
- `FaqItem` `q1`… bilingual Q&A, optional one related path, `sortOrder`, `published`.
- `CookieMeta` `id=cookies`, `effectiveDate` `2026-09-10`, `copy` Json, `glance` Json (exactly 5).
- `CookieStorageRow` 16 frozen keys. Age-confirm unique key is `softgate_age_confirm_v1` (session sibling named in the description).

Seed only when the meta row is missing. After staff delete-all, GET stays `[]`. `P2021` → 200 in-memory seed (no DB write).

## Admin desks

Page-local. LaneStatus Retry stays on the page. `faq` / `faq.new` → `/faq?new=1` (settings write). `cookies` go-only. Sidebar after Press, before Legal/Help.

## Out

- Website consume; public unauth GET on Admin Express.
- Admin `/legal` for FAQ/Cookies; deleting clickwrap `/privacy` `/terms`.
- Help-hub `FAQ_POPULAR_IDS`; cookie banner/CMP; fake analytics.
- 7th `reloadCatalog` lane; `packages/shared`; live DB migrate in this batch.
