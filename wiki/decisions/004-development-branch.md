---
title: Long-lived development branch (not GitFlow develop)
type: decision
date: 2026-09-08
tags: [git, branches, vercel, development]
---

# ADR 004 — `development` branch

## Status

Accepted

## Context

Admin git was `main` plus short-lived `feat|fix|chore/<scope>`. A second team lead shared Railway / R2 / Brevo values labeled **development** (not staging). Production keys will arrive later on the client server. Putting those values in git, or treating this as GitFlow `develop`, would mix secrets and release lines.

## Decision

Add a long-lived branch named **`development`**.

- Split from `main` after landing fail-soft adapters and desk WIP. At the split, committed code on `main` and `development` is the same.
- `main` remains GitHub default and Vercel Production. Do not auto-deploy `development` to production.
- Live Railway / R2 / Brevo values live only in gitignored `backend/.env`. Committed `.env.example` stays stub (`fake` / empty). Do not commit `VITE_USE_MOCK_API=false` as a branch-only default.
- Short-lived `feat|fix|chore/<scope>`: work that needs the leader dev cloud forks from `development`; mock-only UI may fork from `main`.
- The website repo may also have a `development` branch. Names match only. Do not merge across remotes.

This is not GitFlow `develop`. Staging URLs, when they exist, are a later line — not a rename of `development` in this ADR.

## Consequences

- Agents must not put secrets in wiki, commits, or `.env.example`.
- Prisma migrate on the shared Railway DB is still owned separately; this ADR does not authorize it.
- Website / reader-portal repo stays untouched from this Admin repo.

## Alternatives considered

- Keep `main` + `feat/` only — rejected: the leader labeled a distinct **dev** cloud; a named integration line is clearer than implicit `.env` on every laptop.
- GitFlow `develop` — rejected: no staging/prod URL split yet; `develop` would collide with later staging.
- Put keys on `development` in git — rejected: secrets must not be committed.
