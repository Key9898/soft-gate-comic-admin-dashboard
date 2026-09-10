---
title: Legal CMS (Privacy + Terms)
type: convention
date: 2026-09-10
tags: [legal, privacy, terms, cms, admin]
impl: 67
---

# Legal CMS (Privacy + Terms)

Admin owns **bilingual legal copy**. The website owns legal chrome (`LegalPageShell`, TOC, readability, related strip, shell Contact). Not a page builder. Not HTML/Markdown. Not Media.

## Desk

Protected `/legal`. Do not hijack public staff `/privacy` `/terms` clickwrap stubs. Sidebar Admin after Cookies. Palette slug `legal`.

## API

Staff cookie. Write = `canWriteSettings`.

- `GET/PATCH /api/legal/privacy` — meta
- `GET/POST /api/legal/privacy/sections`, `PATCH/DELETE /api/legal/privacy/sections/:id`
- Same four verbs for `/api/legal/terms`

First GET upserts today’s seed. `P2021` fail-opens to seed. Reject reserved slugs `glance`/`contact`, HTML tags, `blob:`, empty en/mm. Terms reject `privacy-rights`.

## Mock

`softgate_admin_legal_v1` (not catalog schema 14). Not a `reloadCatalog` lane.

## Reader

Website **212** public GET. Portal mock/fail keeps i18n. Cookies public GET is website **213**.
