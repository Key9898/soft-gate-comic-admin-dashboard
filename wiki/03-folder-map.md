---
title: Folder Map
type: reference
date: 2026-08-10
tags: [structure, folders]
---

# Folder Map

```
soft-gate-comic-admin-dashboard/
├── index.html
├── package.json              # deps + scripts + lint-staged + prepare
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
│   ├── decisions/            # ADRs (empty scaffold OK)
│   ├── notes/
│   ├── references/
│   └── snippets/
├── packages/
│   └── shared/               # @softgate/shared types + mocks (path alias)
├── public/
│   ├── logo/                 # logo.svg (UI), logo.png (OG)
│   ├── favicon/              # favicon.svg, favicon-32.png, apple-touch-icon.png (head); icon-512.png press-only
│   ├── banner/
│   └── webtoon-covers/
├── e2e/                      # Playwright specs
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── components/           # shared UI primitives
    ├── config/
    ├── data/
    ├── features/             # feature-sliced pages
    ├── layouts/              # AdminLayout
    ├── lib/                  # DataContext, theme, hooks, formatters
    ├── test/
    └── types/
```

## `src/features/`

`activity-log`, `analytics`, `auth`, `comments`, `dashboard`, `episodes`, `media`, `notifications`, `profile`, `reports`, `revenue`, `schedule`, `settings`, `users`, `webtoons`

## Aliases

- `@/` → `src/`
- `@softgate/shared` → `packages/shared/src`
