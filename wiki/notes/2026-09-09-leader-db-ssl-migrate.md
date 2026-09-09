---
title: Leader Railway SSL + Admin migrate deploy
type: note
date: 2026-09-09
tags: [postgres, prisma, migrate, development]
---

# Leader DB SSL + Admin migrate (not an Impl)

Local Admin `backend/.env` (gitignored) now uses `sslmode=require` against the leader **development** Railway Postgres. `BREVO_SENDER_NAME` is **SoftGate Comic**. R2 bucket name is unchanged.

`npm run db:migrate -w backend` (`prisma migrate deploy`) applied the four Admin migrations on that shared database: init, staff_auth, catalog, media. No `db push`. Secrets are not in this note.

## Website agent

Portal Prisma history is a **different** folder. Do not run portal `migrate deploy` on this database without coordinating — both CLIs share `_prisma_migrations`. Admin tables now exist (`StaffUser`, catalog, `MediaAsset`). Reader tables are a separate schema in the website repo.

Do not merge Admin `development` into the website remote.
