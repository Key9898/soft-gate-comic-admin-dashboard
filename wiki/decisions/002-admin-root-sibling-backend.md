---
title: Admin stays at repo root; API is sibling backend/
type: decision
date: 2026-08-24
tags: [monorepo, backend, layout, adr]
impl: 29
---

# ADR 002 — Admin root + sibling `backend/`

## Context

Impl 29 adds a real HTTP process to this git repo. Options were `apps/admin` + `apps/api`, TextPad-style `admin/` + `backend/` (move the SPA), or keep the Vite app at root and add `backend/`.

## Decision

Keep the Admin SPA at **repo root**. Add sibling [`backend/`](../../backend/) as the only npm workspace child. Do not relocate `src/` in this Impl.

## Consequences

- Existing Vite/Husky/Vitest/Playwright paths stay valid.
- Root `package.json` is both the SPA package and the workspace root (same as before, plus `workspaces`).
- A later platform merge (`web` + `admin` + `api`) can still happen without blocking health/auth/catalog API work.
- Agents must not treat `src/` as the place to put Express.
