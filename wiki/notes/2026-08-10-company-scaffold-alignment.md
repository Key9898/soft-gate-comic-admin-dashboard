---
title: Company scaffold alignment (Impl 6)
type: note
date: 2026-08-10
tags: [scaffold, git, wiki, agents, hygiene]
---

# Company Scaffold Alignment — Impl 6

## Context

SoftGate Comic Admin already matched company **git gates** (husky lint-staged + `npm run check`) and feature-sliced `src/`. Remaining gaps vs the company scaffold standard were closed in this Impl.

## Hard boundary

Applied **scaffold patterns only**: `.gitattributes`, wiki taxonomy folders, root `AGENTS.md` location, dual-track / Lark contract style, workflow + folder-map doc depth.

SoftGate application code (`src/`, features, brand tokens, `packages/shared`) was not replaced or overwritten by another product's source.

## Changes

| Item                                       | Action                               |
| ------------------------------------------ | ------------------------------------ |
| `.gitattributes`                           | LF normalize + binary types          |
| `wiki/decisions`, `references`, `snippets` | `.gitkeep` scaffolds                 |
| `AGENTS.md` (root)                         | SoftGate operating contract          |
| `.agents/AGENTS.md`                        | Mirror + pointer to root             |
| `.cursor/rules/00-project-context.mdc`     | List root + `.agents` AGENTS         |
| `wiki/02-workflow.md`                      | Full hooks / LF / dual-track         |
| `wiki/03-folder-map.md`                    | Top-level + `src/` map               |
| Legacy `docs/sessions` 07-14 / 07-15       | `git rm --cached` (local files kept) |

## Related

- Impl track: [implementation-phases.md](../architecture/implementation-phases.md)
- Contract: [AGENTS.md](../../AGENTS.md)
