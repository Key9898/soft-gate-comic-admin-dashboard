---
title: Terminology rename Phase to Impl
type: note
date: 2026-08-11
tags: [docs, naming, impl]
---

# Phase → Impl terminology

Work batches in SoftGate Comic Admin docs are labeled **Impl N** (not “Phase N”), matching company / Lark wording.

## Scope updated

- [`architecture/implementation-phases.md`](../architecture/implementation-phases.md) — headings **Impl 1–8**
- Wiki notes titles / body references for Impl 5–8
- Session summaries under `docs/sessions/` (`impls:` frontmatter; `## Impl N` sections)
- [`wiki/README.md`](../README.md), [`wiki/02-workflow.md`](../02-workflow.md)
- Agent hygiene templates (`AGENTS.md`, `.cursor/rules/06-documentation-hygiene.mdc`)

## Unchanged on purpose

- Legacy product roadmap files (`PROJECT_PLAN.md`, `CHANGELOG.md`, `LAST_SESSION.md`) still use older “Phase 9/10…” product milestones — different numbering system; do not mix with Impl 1–8.
- Filename `implementation-phases.md` kept so existing links stay stable.

## Current track

**Impl 1–8** complete. Next work = **Impl 9**.
