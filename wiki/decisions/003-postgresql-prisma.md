---
title: PostgreSQL + Prisma (not Mongo)
type: decision
date: 2026-08-24
tags: [backend, prisma, postgres, adr]
impl: 30
---

# ADR 003 — PostgreSQL + Prisma

## Context

TextPad uses MongoDB + Mongoose. SoftGate API needed a database for catalog, staff, and later coin ledger. Field-level encryption of email/catalog/coins was rejected; at-rest encryption is the host volume.

## Decision

Use **PostgreSQL** with **Prisma 6**. First migration is `Meta` only (no staff, no catalog, no password). Cloudflare R2 and Brevo are the chosen object-storage and mail vendors for later Impls, not this one.

## Consequences

- Schema changes go through Prisma migrations in `backend/prisma/migrations/`.
- Do not add Mongoose. Do not bump to Prisma 7 in this track without a new ADR (`url = env("DATABASE_URL")` in `schema.prisma` is the Prisma 6 shape).
- Staff `passwordHash` arrives in Impl 31 as a new migration, not a column in Impl 30.
