---
title: Impl 67 — Privacy + Terms CMS
type: note
date: 2026-09-10
tags: [legal, privacy, terms, cms, impl-67]
impl: 67
---

# Impl 67 — Privacy + Terms CMS

Admin writes bilingual Privacy Policy and Terms of Service copy. Website consume is **212**. Desk is `/legal`. Staff clickwrap `/privacy` `/terms` stubs stay public for Setup/Invite.

## Pipe

Admin `/legal` → staff `/api/legal/privacy` and `/api/legal/terms` → shared Postgres → website `GET /api/legal/privacy` and `GET /api/legal/terms` → portal `/privacy` `/terms`. Mock or fetch fail keeps `t('static.*')`. Never a blank legal page.

## Admin

- Models: `PrivacyMeta` / `PrivacySection` / `TermsMeta` / `TermsSection`. Migrate `20260910250000_privacy_terms_cms` (after Impl 66 FAQ/Cookies `20260910240000`).
- Write = `canWriteSettings`. First GET upserts today’s EN/MM seed (including “does not send your data to any server”). `P2021` fail-opens to seed.
- Reserved slugs `glance` and `contact` (reader shell). `privacy-rights` is Privacy `#rights` only; hrefs stay `/profile?tab=security` and `/contact`.
- Mock key `softgate_admin_legal_v1`. Page-local load. LaneStatus **Legal request failed.** Help `ADMIN_LEGAL`.

## Out

FAQ, Cookie Policy, WYSIWYG/HTML/Markdown, Admin public unauthenticated legal GET, replacing clickwrap stubs, website CREATE migrate, catalog schema 14, `reloadCatalog` lane, auto-rewriting the no-server glance.

Convention: [legal-cms.md](../conventions/legal-cms.md). Website consume: website note `2026-09-10-privacy-terms-consume.md` (Impl 212).
