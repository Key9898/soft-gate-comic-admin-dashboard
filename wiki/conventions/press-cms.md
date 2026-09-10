---
title: Press CMS
type: convention
date: 2026-09-10
tags: [press, cms, desk, admin]
---

# Press CMS

`/press` is an About-class CMS for reader `/press`. Admin writes content and file URLs. Website owns chrome.

- Page-local load. Do not add a 7th `reloadCatalog` lane. CatalogStatus stays catalog-only. Lane copy **Press request failed.**
- Mock key `softgate_admin_press_v1` (not catalog schema 14).
- Write = Super Admin / Admin (`canWriteSettings`). ZIP is a URL field (default `/press-kit/softgate-comic-press-kit.zip`). Never persist `blob:`.
- Spokesperson is an About team member id. Do not duplicate name/photo on Press.
- Palette hex/label edits stay on this page. Do not write Tailwind / `global.css` / `primary-*`.
- First GET seeds today’s EN/MM kit copy with an empty news table. Empty news/stills only after a successful load.
- Reader `/press` can show saved copy when the portal persist is on. Mock Admin + mock portal keep today’s i18n kit.
