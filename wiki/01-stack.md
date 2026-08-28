# Technical Stack

- **Frontend**: React 18, TypeScript, Vite 5, Tailwind CSS v3, Framer Motion, Recharts
- **API (Impl 29+)**: Express 5 in sibling `backend/`. Staff auth (Impl 31): httpOnly JWT cookie, bcrypt, `/api/staff/*`. Catalog CRUD (Impl 32): `/api/authors|genres|webtoons|episodes`. Admin SPA (Impl 33): mock by default; `VITE_USE_MOCK_API=false` uses cookie + REST. Media (Impl 34–35): `/api/media` + local disk `/uploads`; SPA Library/Picker use REST only when the mock flag is `false`. Remote vendor TBD (no Cloudinary/R2 SDK).
- **Database (Impl 30+)**: PostgreSQL + Prisma 6. `DATABASE_URL` in `backend/.env` only (never `VITE_*`). See [`conventions/backend-workspace.md`](conventions/backend-workspace.md) and [ADR 003](decisions/003-postgresql-prisma.md).
- **Shared Package**: `@softgate/shared` containing shared types and mock data layers
- **Brand tokens**: Logo-aligned teal `primary-*` (`#64c8c8` / `#0e9494`) + magenta `burst-*` (`#e63264`) — see `wiki/conventions/brand-color-tokens.md`
- **Testing**: Vitest for unit tests, Playwright for E2E integration tests
