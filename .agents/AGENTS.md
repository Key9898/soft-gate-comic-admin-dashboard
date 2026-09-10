# SoftGate Comic Admin — Antigravity Agent Rules

> Canonical operating contract: root [`AGENTS.md`](../AGENTS.md). Keep this file aligned with it.

## Project Context

SoftGate Comic Admin Dashboard — production-grade React dashboard for managing webtoons, episodes, comments, users, and analytics.

## Technical Stack

- React 18 + TypeScript 5
- Vite 5 + Tailwind CSS v3
- Express 5 in sibling `backend/` (`npm run dev:api`) — health + Prisma + staff cookie auth (setup / auth-options / forgot-reset / optional TOTP / env-gated SSO, Impl 48) + catalog CRUD + local media adapter (Impl 34) + same-pixel WebP ingest (Impl 56) + R2 `ObjectStore` when real R2 env is set (Impl 41) + CORS/cookie from env (Impl 42) + Brevo invite mail when real env is set (Impl 43) + coin packages REST (Impl 44) + comments REST (Impl 53; portal `ReaderComment`) + reader users REST (Impl 54; portal `ReaderUser`) + notifications REST (Impl 46) + platform settings REST (Impl 47) + about history REST (Impl 59) + about team REST (Impl 60) + press REST (Impl 63; page-local `/press`) + faq REST (Impl 66; page-local `/faq`) + cookie policy REST (Impl 66; page-local `/cookies`; backend `cookiePolicy`) + legal REST (Impl 67; page-local `/legal`); Admin SPA wires staff+catalog when `VITE_USE_MOCK_API=false` (Impl 33) and media when that flag is `false` (Impl 35) and coin packages when that flag is `false` (Impl 44) and comments when that flag is `false` (Impl 53) and reader users when that flag is `false` (Impl 54) and notifications when that flag is `false` (Impl 46) and settings when that flag is `false` (Impl 47) and reader broadcasts when that flag is `false` (Impl 51) and about history when that flag is `false` (Impl 59) and about team when that flag is `false` (Impl 60) and press when that flag is `false` (Impl 63; page-local, not a 7th catalog lane) and FAQ when that flag is `false` (Impl 66) and cookies when that flag is `false` (Impl 66) and legal when that flag is `false` (Impl 67). Catalog fail-open (Impl 61): GET `/api/comments` and GET `/api/about/history` return `[]` on Prisma `P2021`; GET `/api/faq` and GET `/api/cookies` fail-open to seed on `P2021`; GET `/api/legal/privacy` fail-open to seed on `P2021`; no Admin `ReaderComment` migrate. Desk load lanes (Impl 62): catalog is the core CatalogStatus lane; media, coins, comments, users, notifications, and about settle separately so a comments API failure does not wipe catalog. Press CMS (Impl 63): staff `/api/press`; mock key `softgate_admin_press_v1`; reader `/press` consumes website `GET /api/press` (website 211). FAQ + Cookie Policy CMS (Impl 66): staff `/api/faq` `/api/cookies`; mock keys `softgate_admin_faq_v1` / `softgate_admin_cookies_v1`; reader `/faq` `/cookies` can show saved copy when the portal persist is on (website 213). Privacy + Terms CMS (Impl 67): staff `/api/legal`; mock key `softgate_admin_legal_v1`; desk `/legal`; reader `/privacy` `/terms` consume website GET (website 212). Staff clickwrap `/privacy` `/terms` stay stubs. Live business empty (Impl 64): Dashboard/Analytics/Revenue chart and transaction slices stay empty on the catalog API; mock desk keeps demo series. Live Reports / Activity Log (Impl 65): reports and activity-log seeds stay empty; Reports caption **Not wired on live**; Activity Log caption **This session only** (`appendActivityLog` still records this session). Episode add/edit is `/episodes/new` and `/episodes/:id/edit` (Impl 55); JPEG/PNG pages go through `/api/media` (live stored as same-pixel WebP, Impl 56). Webtoon add/edit is `/webtoons/new` and `/webtoons/:id/edit` (Impl 58); cover from Media. About desk is `/about` (Impl 59 History + Impl 60 Team); reader `/about` unchanged until website 205–207. FAQ desk is `/faq` and Cookies desk is `/cookies` (Impl 66). Legal desk is `/legal` (Impl 67). Auth split Sign in ↔ `/setup` (Impl 49). Live R2 URL shape proved (Impl 50); live smoke graph purged (Impl 57 — do not leave ops smoke `ongoing`/`published` on the shared reader DB). Live join desk (Impl 52). Daily Media Library stays mock.
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
- Do not merge Admin git with the website / `soft-gate-comic` reader-portal repo.
