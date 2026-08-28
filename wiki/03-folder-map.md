---
title: Folder Map
type: reference
date: 2026-08-24
tags: [structure, folders]
---

# Folder Map

```
soft-gate-comic-admin-dashboard/
├── index.html
├── package.json              # SPA + workspace root (workspaces: backend)
├── AGENTS.md                 # root agent operating contract
├── .gitattributes            # LF normalize for Prettier / Windows Git
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── eslint.config.js
├── tailwind.config.js
├── global.css
├── .husky/                   # pre-commit (lint-staged), pre-push (npm run check)
├── .cursor/                  # rules + wiki skill
├── .agents/                  # Antigravity AGENTS.md + wiki skill
├── .trae/                    # Trae wiki skill
├── .storybook/
├── docs/                     # gitignored — local sessions/
├── wiki/                     # committed AI knowledge base
│   ├── architecture/         # implementation-phases.md
│   ├── conventions/          # brand-color-tokens.md, …
│   ├── decisions/            # ADRs
│   ├── notes/
│   ├── references/
│   └── snippets/
├── backend/                  # npm workspace — Express + Prisma (Impl 29–34)
│   ├── prisma/               # Meta + Staff + catalog + MediaAsset
│   ├── docker-compose.yml    # local Postgres 16
│   ├── uploads/              # local ObjectStore files (gitignored except .gitkeep)
│   ├── src/auth/             # cookie JWT, bcrypt, StaffStore, /api/staff
│   ├── src/catalog/          # CatalogStore, rules, /api/authors|genres|webtoons|episodes
│   ├── src/media/            # ObjectStore + MediaAsset + /api/media (local disk; remote TBD)
│   ├── src/app.ts            # createApp(); no listen
│   ├── src/db.ts             # Prisma ping
│   ├── src/index.ts          # connect then listen
│   └── .env.example          # PORT, DATABASE_URL, MEDIA_*, fake JWT/R2/Brevo
├── packages/
│   └── shared/               # @softgate/shared types + mocks (path alias)
├── public/
│   ├── logo/                 # logo.svg (UI), logo.png (OG)
│   ├── favicon/              # favicon.svg, favicon-32.png, apple-touch-icon.png (head); icon-512.png press-only
│   ├── banner/
│   ├── auth/                 # ops-desk-lg/sm light/dark JPGs for staff split
│   └── webtoon-covers/
├── e2e/                      # Playwright specs
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── components/           # shared UI primitives (incl. CatalogStatus, Skeleton)
    ├── config/
    ├── data/
    ├── features/             # feature-sliced pages
    ├── layouts/              # AdminLayout, AuthLayout
    ├── lib/                  # DataContext, api/, theme, yangonDate, episodeImages, spotlight, authors, genres, coinPackages, formatters, auth (staffAccess)
    ├── test/
    └── types/
```

## `src/features/`

`activity-log`, `analytics`, `auth`, `authors`, `coin-packages`, `comments`, `dashboard`, `episodes`, `genres`, `media`, `notifications`, `profile`, `reports`, `revenue`, `schedule`, `settings`, `team`, `users`, `webtoons`

## Aliases

- `@/` → `src/`
- `@softgate/shared` → `packages/shared/src`

API: `npm run dev:api` — not mixed into Vite `src/`. See [`conventions/backend-workspace.md`](conventions/backend-workspace.md).
