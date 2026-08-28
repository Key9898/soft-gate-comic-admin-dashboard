# SoftGate Comic Admin Knowledge Base

Welcome to the official developer wiki for the SoftGate Comic Admin Dashboard project.

## Index

- [00-overview.md](00-overview.md) — Project vision and administrative goals
- [01-stack.md](01-stack.md) — Technical stack & core configurations
- [02-workflow.md](02-workflow.md) — Git workflow, husky gates, dual-track docs
- [03-folder-map.md](03-folder-map.md) — Codebase architecture and feature folders layout
- [architecture/implementation-phases.md](architecture/implementation-phases.md) — Impl **1–36** (Impl 36 = catalog titles + schema 14)
- [references/website-integration.md](references/website-integration.md) — pre-backend Admin work list (21) so the portal can consume catalog/settings
- [conventions/brand-color-tokens.md](conventions/brand-color-tokens.md) — Logo-aligned teal + `burst-*` magenta tokens
- [conventions/backend-workspace.md](conventions/backend-workspace.md) — API in `backend/`; Admin SPA at repo root
- [conventions/staff-auth.md](conventions/staff-auth.md) — staff mock auth; API session when `VITE_USE_MOCK_API=false`
- [conventions/loading-states.md](conventions/loading-states.md) — Sheen skeletons, no splash, empty ≠ loading ≠ error
- [decisions/001-theme-preference-system-default.md](decisions/001-theme-preference-system-default.md) — Brand fixed; theme Light/Dark/System
- [decisions/002-admin-root-sibling-backend.md](decisions/002-admin-root-sibling-backend.md) — Admin SPA at root; API is sibling `backend/`
- [decisions/003-postgresql-prisma.md](decisions/003-postgresql-prisma.md) — PostgreSQL + Prisma 6; not Mongo
- [notes/2026-08-10-brand-display-vs-seo-title.md](notes/2026-08-10-brand-display-vs-seo-title.md) — UI brand vs SEO title constants
- [notes/2026-08-10-profile-polish-media-avatar.md](notes/2026-08-10-profile-polish-media-avatar.md) — Impl 8 Profile + Media Library wire-up
- [notes/2026-08-11-phase-to-impl-rename.md](notes/2026-08-11-phase-to-impl-rename.md) — Phase → Impl terminology
- [notes/2026-08-11-mock-fully-wired.md](notes/2026-08-11-mock-fully-wired.md) — Impl 9 mock SSoT wire-up
- [notes/2026-08-11-crud-activity-audit.md](notes/2026-08-11-crud-activity-audit.md) — Impl 9 activity append call sites
- [notes/2026-08-11-theme-preference-system.md](notes/2026-08-11-theme-preference-system.md) — Impl 10 theme preference
- [notes/2026-08-11-theme-legacy-system-fix.md](notes/2026-08-11-theme-legacy-system-fix.md) — Impl 10.1 legacy + resolved UX
- [notes/2026-08-11-theme-color-scheme-auto-dark.md](notes/2026-08-11-theme-color-scheme-auto-dark.md) — Impl 10.2 color-scheme Auto Dark opt-out
- [notes/2026-08-11-light-polish-theme-restore.md](notes/2026-08-11-light-polish-theme-restore.md) — Impl 11 Light polish + theme restore
- [notes/2026-08-11-light-auto-dark-race-fix.md](notes/2026-08-11-light-auto-dark-race-fix.md) — Impl 11.1 FOUC-first color-scheme race fix
- [notes/2026-08-11-css-variable-theme-surfaces.md](notes/2026-08-11-css-variable-theme-surfaces.md) — Impl 12 CSS variable theme surfaces
- [notes/2026-08-11-light-aa-contrast-polish.md](notes/2026-08-11-light-aa-contrast-polish.md) — Impl 13 Light AA contrast polish
- [notes/2026-08-11-dark-pastel-chrome-bridges.md](notes/2026-08-11-dark-pastel-chrome-bridges.md) — Impl 14 Dark/System pastel chrome bridges
- [notes/2026-08-19-theme-default-light.md](notes/2026-08-19-theme-default-light.md) — Impl 15 default theme preference Light
- [notes/2026-08-19-favicon-head-alignment.md](notes/2026-08-19-favicon-head-alignment.md) — Impl 16 favicon/OG head alignment with website
- [notes/2026-08-21-admin-skeleton-contract.md](notes/2026-08-21-admin-skeleton-contract.md) — Impl 17 admin production skeleton contract
- [notes/2026-08-21-theme-default-system.md](notes/2026-08-21-theme-default-system.md) — Impl 18 first-run theme default System
- [notes/2026-08-21-website-integration.md](notes/2026-08-21-website-integration.md) — recorded portal catalog contract (no Admin UI yet)
- [notes/2026-08-23-episode-panel-sizes.md](notes/2026-08-23-episode-panel-sizes.md) — wiki item 21 episode panel sizes (portal 166 consume; Admin persist is Impl 27)
- [notes/2026-08-22-admin-catalog-pipe.md](notes/2026-08-22-admin-catalog-pipe.md) — Impl 19 catalog pipe + settings blob
- [notes/2026-08-22-admin-authors-crud.md](notes/2026-08-22-admin-authors-crud.md) — Impl 21 Author CRUD (wiki 14)
- [notes/2026-08-22-admin-genres-crud.md](notes/2026-08-22-admin-genres-crud.md) — Impl 22 Genre CRUD (wiki 15)
- [notes/2026-08-22-sidebar-edge-toggle.md](notes/2026-08-22-sidebar-edge-toggle.md) — Impl 23 sidebar edge collapse toggle
- [notes/2026-08-23-admin-coin-packages.md](notes/2026-08-23-admin-coin-packages.md) — Impl 24 coin packages editor (wiki 16)
- [notes/2026-08-23-staff-team-invite.md](notes/2026-08-23-staff-team-invite.md) — Impl 25 staff Team invites
- [notes/2026-08-23-staff-roles-nav.md](notes/2026-08-23-staff-roles-nav.md) — Impl 26 staff roles + grouped sidebar
- [notes/2026-08-23-admin-episode-image-sizes.md](notes/2026-08-23-admin-episode-image-sizes.md) — Impl 27 episode `imageSizes` persist (wiki item 21)
- [notes/2026-08-23-team-role-legend.md](notes/2026-08-23-team-role-legend.md) — Impl 28 Team Roles legend + invite confirm copy
- [notes/2026-08-24-api-workspace-health.md](notes/2026-08-24-api-workspace-health.md) — Impl 29 sibling `backend/` + health
- [notes/2026-08-24-prisma-postgres.md](notes/2026-08-24-prisma-postgres.md) — Impl 30 PostgreSQL + Prisma
- [notes/2026-08-24-staff-auth-api.md](notes/2026-08-24-staff-auth-api.md) — Impl 31 staff auth API
- [notes/2026-08-24-catalog-crud-api.md](notes/2026-08-24-catalog-crud-api.md) — Impl 32 catalog CRUD APIs
- [notes/2026-08-24-spa-catalog-api.md](notes/2026-08-24-spa-catalog-api.md) — Impl 33 SPA staff + catalog API wire
- [notes/2026-08-24-media-adapter.md](notes/2026-08-24-media-adapter.md) — Impl 34 local media adapter (remote vendor TBD)
- [notes/2026-08-24-spa-media-api.md](notes/2026-08-24-spa-media-api.md) — Impl 35 SPA media REST (dormant until flag false)
- [notes/2026-08-25-admin-schema-14-titles.md](notes/2026-08-25-admin-schema-14-titles.md) — Impl 36 catalog titles + schema 14
- [notes/2026-08-22-staff-auth.md](notes/2026-08-22-staff-auth.md) — Impl 20 staff auth (login/register/forgot OTP)

## Wiki taxonomy

| Folder          | Role                         |
| --------------- | ---------------------------- |
| `architecture/` | System design, phases        |
| `conventions/`  | Coding / UI standards        |
| `decisions/`    | ADRs                         |
| `notes/`        | Dated session mirrors        |
| `references/`   | External links / contracts   |
| `snippets/`     | Copy-paste markdown snippets |
