# Soft-Gate Comic — Admin Dashboard

React SPA for the Soft-Gate Comic administrative dashboard: management of webtoons, episodes, comments, user accounts, and system analytics.

**Stack:** React 18 · TypeScript · Vite 5 · Tailwind CSS v3 · Recharts · Vitest

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

## Mock vs real API

Copy `.env.example` to `.env.local`:

| Variable            | Default                 | Description                            |
| ------------------- | ----------------------- | -------------------------------------- |
| `VITE_USE_MOCK_API` | `true`                  | `false` → HTTP `/api/*` via Vite proxy |
| `VITE_API_BASE_URL` | `http://localhost:3000` | Backend origin for dev proxy           |

## Scripts

| Command         | Description                             |
| --------------- | --------------------------------------- |
| `npm run dev`   | Vite dev server                         |
| `npm run build` | Type-check + production build           |
| `npm run check` | lint + format + test + build (pre-push) |

## Layout

```
src/
├── features/     # Feature pages (webtoons, episodes, users, comments, etc.)
├── components/   # Shared UI components (Button, Input, Card, Modal, etc.)
├── layouts/      # Global Layout wrapper (AdminLayout)
├── lib/          # Custom utility libraries (theme, localStorage, helpers)
└── config/       # App constants & configurations
```

## Docs

- [`wiki/`](wiki/README.md) — project knowledge base
