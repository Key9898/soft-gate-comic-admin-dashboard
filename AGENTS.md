# AGENTS.md — SoftGate Comic Admin Operating Rules

This file is the mandatory operating contract for AI agents (and human collaborators) working on the SoftGate Comic Admin Dashboard. Read it before doing anything. These rules are **non-negotiable**.

Antigravity mirror: [`.agents/AGENTS.md`](.agents/AGENTS.md) (keep in sync with this file).

## 1. Documentation dual-track — update EVERY change

Every code edit (feature, fix, refactor, convention change — anything beyond a typo) MUST be mirrored in BOTH documentation tracks. Do not let them drift.

### Track A — `wiki/` (committed knowledge base)

Update when the change is structural, fact-based, or reusable:

- `wiki/architecture/implementation-phases.md` — append / check off the new Impl work.
- `wiki/notes/YYYY-MM-DD-short-slug.md` — dated note per change session (English slug).
- `wiki/references/` — external contracts / links when added.
- `wiki/decisions/` — ADR if a non-obvious decision was made (`NNN-short-slug.md`).
- `wiki/conventions/` — if a new UI/code convention is established.
- `wiki/README.md` — update the index when notes or sections are added.
- `wiki/03-folder-map.md` — update if a new folder/module was created or removed.

### Track B — `docs/sessions/` (gitignored session log)

After every work block create or update:

- `docs/sessions/YYYY-MM-DD-session-summary.md` — what was done, files changed, verify steps, follow-ups.

The `wiki/notes/` file is the cleaned-up committed mirror; `docs/sessions/` is the local hand-off artifact.

**Do not commit one without the other.** If a change is too small to be worth a session note, it is too small to push.

## 2. Lark Task hand-off — emit on every summary

At the end of every work summary, produce a **copy-ready** block for the Lark Task tracker:

1. A concise **Title** (one line).
2. A **Notes** body — what changed, verification, follow-ups.

Use plain `-` bullets only (no `[x]` / `[ ]` checkboxes).

```
=== LARK TASK — COPY FROM BELOW THIS LINE ===
Title: <short summary>

Notes:
- <what changed>
- <files / areas touched>
- Verify: `npm run check`
- Follow-up: <next step or none>
=== LARK TASK — COPY UNTIL ABOVE THIS LINE ===
```

Never skip the Lark block. The user pastes it into Lark manually.

## 3. Quality bar

- **`npm run check` must pass** before declaring done (lint + format:check + vitest run + build). Do not skip with `--no-verify` casually.
- Strict TypeScript / ESLint as configured in the repo.
- Prefer brand tokens (`primary-*`, `burst-*`) — see `wiki/conventions/brand-color-tokens.md`. Do not name a Tailwind color scale `accent` (clashes with form `accent-color`).
- Theme surfaces: JSX may use `bg-canvas` / `border-line` / `text-fg`; in `global.css` `@apply`, use `var(--sg-*)` instead (Vite PostCSS can reject `@apply border-line`).
- No comments that restate the code. Wiki carries rationale.
- Never commit secrets. `.env.example` stays stub-only.
- **Never push or amend unless explicitly asked.**

## Quick orientation

- Entry: `index.html` → `src/main.tsx` → `src/App.tsx` → `ProtectedRoute` → `AdminLayout` → feature pages.
- Features: `src/features/<name>/` (webtoons, episodes, users, comments, …).
- Shared mocks/types: `@softgate/shared` → `packages/shared/src`.
- Data: `DataContext` + localStorage mock (optional real API via `VITE_USE_MOCK_API=false`).
- Brand mark: `public/logo/logo.svg` (website logo; transparent SVG).

## Verification commands

| Check                | Command            |
| -------------------- | ------------------ |
| Full gate (pre-push) | `npm run check`    |
| Dev server           | `npm run dev`      |
| Lint + fix           | `npm run lint:fix` |
| Format               | `npm run format`   |
| Test run             | `npm run test:run` |
| Build                | `npm run build`    |
