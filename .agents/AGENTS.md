# SoftGate Comic Admin — Antigravity Agent Rules

> Canonical operating contract: root [`AGENTS.md`](../AGENTS.md). Keep this file aligned with it.

## Project Context

SoftGate Comic Admin Dashboard — production-grade React dashboard for managing webtoons, episodes, comments, users, and analytics.

## Technical Stack

- React 18 + TypeScript 5
- Vite 5 + Tailwind CSS v3
- Express 5 in sibling `backend/` (`npm run dev:api`) — health + Prisma + staff cookie auth (setup / auth-options / forgot-reset / optional TOTP / env-gated SSO, Impl 48) + catalog CRUD + local media adapter (Impl 34) + R2 `ObjectStore` when real R2 env is set (Impl 41) + CORS/cookie from env (Impl 42) + Brevo invite mail when real env is set (Impl 43) + coin packages REST (Impl 44) + comments REST (Impl 45) + notifications REST (Impl 46) + platform settings REST (Impl 47); Admin SPA wires staff+catalog when `VITE_USE_MOCK_API=false` (Impl 33) and media when that flag is `false` (Impl 35) and coin packages when that flag is `false` (Impl 44) and comments when that flag is `false` (Impl 45) and notifications when that flag is `false` (Impl 46) and settings when that flag is `false` (Impl 47) and reader broadcasts when that flag is `false` (Impl 51). Auth split Sign in ↔ `/setup` (Impl 49). Live R2 smoke + one published title (Impl 50). Live join desk (Impl 52). Daily Media Library stays mock.
- ESLint 9 + Prettier 3
- Vitest 4 + Testing Library
- Husky 9 + lint-staged 15

## Git branches

- `main` — GitHub default and Vercel Production.
- `development` — long-lived leader **dev** cloud integration line (same committed code as `main` at the split). Not GitFlow `develop`. Secrets only in gitignored `backend/.env`.
- Short-lived `feat|fix|chore/<scope>`. Do not merge Admin `development` with the website repo.

## Documentation Hygiene (Mandatory)

After completing implementation work:

1. **Wiki**: Update `wiki/architecture/implementation-phases.md` and create/update `wiki/notes/YYYY-MM-DD-<slug>.md`.
2. **Session**: Update `docs/sessions/YYYY-MM-DD-session-summary.md` (gitignored).
3. **Index drift**: If Impl counts change, update `wiki/README.md` and `wiki/02-workflow.md`.
4. **Confirm**: Confirm which wiki + session paths were updated at the end of the task.
5. **Lark**: Always give the user a copy-pasteable **Title + Note gist** for manual Lark task update (no `[x]` / `[ ]` checkboxes — use plain `-` bullets).

## Lark Checklist Formatting

- When providing a copy-pasteable checklist summary for Lark manual update, do NOT include checkmark indicators like `[x]` or `[ ]` in the markdown list items. Instead, provide a clean list structure (e.g. using regular bullet points `-`) so the user can easily copy and track it manually.

## Quality

- `npm run check` must pass before done (Admin + `backend/` workspace).
- Never push or amend unless the user explicitly asks.
- Do not edit the website / `soft-gate-comic` reader-portal repo.
