---
title: Git Workflow & Documentation
type: convention
date: 2026-08-10
tags: [git, husky, wiki, sessions]
---

# Git Workflow & Documentation

## Branches

- `main` — production / stable
- Feature branches: `feat/<scope>`, `fix/<scope>`, `chore/<scope>`

## Hooks

### pre-commit (`.husky/pre-commit`)

Runs `npx lint-staged` — only touches **staged files**:

| Pattern                  | Task                                |
| ------------------------ | ----------------------------------- |
| `*.{ts,tsx}`             | `eslint --fix` → `prettier --write` |
| `*.{js,jsx,json,css,md}` | `prettier --write`                  |
| `wiki/**/*.md`           | `prettier --write`                  |

### pre-push (`.husky/pre-push`)

Runs `npm run check` — full project validation:

1. `eslint .`
2. `prettier --check` (`src/` + `wiki/`)
3. `vitest run`
4. `tsc -b && vite build`

> If any step fails, push is **blocked**.

### Line endings

- Root [`.gitattributes`](../.gitattributes): `* text=auto eol=lf` so checkout matches Prettier `"endOfLine": "lf"`.
- On Windows, do not rely on `core.autocrlf` alone — without `.gitattributes`, Prettier can fail many files and husky reports `failed to push some refs`.

## Standard flow

```bash
git add <files>
git commit -m "feat: ..."   # pre-commit runs lint-staged
git push origin <branch>    # pre-push runs full check
```

## Bypassing hooks (emergency only)

```bash
git commit --no-verify -m "hotfix: ..."
git push --no-verify
```

## prepare script

`package.json` has `prepare: husky` — `npm install` installs hooks. New clones: `git clone && npm install` → hooks ready.

## Documentation dual-track

| Location             | Purpose                                   | Git          |
| -------------------- | ----------------------------------------- | ------------ |
| **`wiki/`**          | Committed knowledge — phases, conventions | Yes          |
| **`docs/sessions/`** | Local session evidence for Lark hand-off  | No (ignored) |

After implementation work: update **both** tracks + give the user a Lark Title + Notes gist (plain `-` bullets). See root [`AGENTS.md`](../AGENTS.md).

## Current implementation status

Impls **1–14** complete (see [`architecture/implementation-phases.md`](architecture/implementation-phases.md)). Latest: Impl 14 = Dark/System pastel chrome bridges. Labels use **Impl N** (not Phase).
