# SoftGate Comic Admin — Antigravity Agent Rules

> Canonical operating contract: root [`AGENTS.md`](../AGENTS.md). Keep this file aligned with it.

## Project Context

SoftGate Comic Admin Dashboard — production-grade React dashboard for managing webtoons, episodes, comments, users, and analytics.

## Technical Stack

- React 18 + TypeScript 5
- Vite 5 + Tailwind CSS v3
- Express 5 in sibling `backend/` (`npm run dev:api`) — health + Prisma + staff cookie auth + catalog CRUD + local media adapter (Impl 34); Admin SPA wires staff+catalog when `VITE_USE_MOCK_API=false` (Impl 33) and media when that flag is `false` (Impl 35). Daily Media Library stays mock.
- ESLint 9 + Prettier 3
- Vitest 4 + Testing Library
- Husky 9 + lint-staged 15

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
