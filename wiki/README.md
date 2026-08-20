# SoftGate Comic Admin Knowledge Base

Welcome to the official developer wiki for the SoftGate Comic Admin Dashboard project.

## Index

- [00-overview.md](00-overview.md) — Project vision and administrative goals
- [01-stack.md](01-stack.md) — Technical stack & core configurations
- [02-workflow.md](02-workflow.md) — Git workflow, husky gates, dual-track docs
- [03-folder-map.md](03-folder-map.md) — Codebase architecture and feature folders layout
- [architecture/implementation-phases.md](architecture/implementation-phases.md) — Impl **1–16** (Impl 16 = favicon/OG head alignment with website)
- [conventions/brand-color-tokens.md](conventions/brand-color-tokens.md) — Logo-aligned teal + `burst-*` magenta tokens
- [decisions/001-theme-preference-system-default.md](decisions/001-theme-preference-system-default.md) — Brand fixed; theme Light/Dark/System
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

## Wiki taxonomy

| Folder          | Role                         |
| --------------- | ---------------------------- |
| `architecture/` | System design, phases        |
| `conventions/`  | Coding / UI standards        |
| `decisions/`    | ADRs                         |
| `notes/`        | Dated session mirrors        |
| `references/`   | External links / contracts   |
| `snippets/`     | Copy-paste markdown snippets |
