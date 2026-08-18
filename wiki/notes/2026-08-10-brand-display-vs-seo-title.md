---
title: Brand display vs SEO title split
type: note
date: 2026-08-10
tags: [brand, seo, naming]
---

# Brand display vs SEO title

Follow-up to Impl 7 SoftGate branding: UI brand must not append redundant “Admin”; document title / SEO keep Admin for product context.

## Constants ([`src/config/index.ts`](../../src/config/index.ts))

| Constant    | Value                  | Consumers                                       |
| ----------- | ---------------------- | ----------------------------------------------- |
| `APP_NAME`  | `SoftGate Comic`       | Sidebar label, Login heading                    |
| `APP_TITLE` | `SoftGate Comic Admin` | SEO title suffix; shell `<title>` by convention |

## SEO ([`src/components/SEO/SEO.tsx`](../../src/components/SEO/SEO.tsx))

- Page titles: `` `${page} | ${APP_TITLE}` ``
- Default / home: `` `${APP_TITLE} Dashboard` `` → SoftGate Comic Admin Dashboard
- [`index.html`](../../index.html) shell meta keeps Admin titles (pre-Helmet)

## Unchanged

- `AdminUser`, Settings `siteName` (`SoftGate Comic`), page SEO descriptions (“Admin login…”)
- Package/repo slugs and wiki project name “SoftGate Comic Admin”

## Related

- [2026-08-10-softgate-brand-logo-svg.md](./2026-08-10-softgate-brand-logo-svg.md)
