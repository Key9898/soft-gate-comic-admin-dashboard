---
title: Platform settings REST + SPA
type: note
date: 2026-09-09
tags: [backend, settings, spa, impl]
impl: 47
---

# Impl 47 — Platform settings REST + SPA

Staff cookie API for the four portal-safe settings. `VITE_USE_MOCK_API=false` uses `GET|PATCH /api/settings`. Mock seeds stay for the default desk.

- Prisma `PlatformSettings` singleton (`id` = `platform`): `maintenanceMode`, `allowRegistration`, `contactEmail`, `defaultLanguage` (`en` | `mm`).
- Write: Super Admin and Admin (`canWriteSettings`). Member/Viewer GET only.
- Empty table GET returns fail-open defaults. No insert on GET. No `POST` / `DELETE`.
- Envelope `{ settings }`. Website public `GET /api/settings` `{ data }` is a different server. Website Impl 200 later reads this table; Admin envelope is still `{ settings }`.
- Theme, site name/description, email-verification, and notification toggles stay in this browser.
- These saves can reach the reader when the portal persist is on (website Impl 200). Theme and other Settings controls stay local.
