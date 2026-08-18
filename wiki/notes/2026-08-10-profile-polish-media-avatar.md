---
title: My Profile polish and media-backed avatar (Impl 8)
type: note
date: 2026-08-10
tags: [profile, media, auth, polish]
---

# Impl 8 — My Profile polish + media-backed avatar

## Problems fixed

- Profile headings used `dark:text-white` while AdminLayout/Card stay light (OS dark → unreadable titles).
- Role shown twice; raw `super_admin` label.
- Collapsed password card looked empty; wrong `PageSEO.Settings`.
- Legacy `admin@webpad.com` from older mock logins.
- Avatar/Save were toast-only stubs; Media Library was disconnected from DataContext.

## Approach

| Area          | Change                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------- |
| Auth          | `updateUser`; migrate `@webpad.com` → `@softgatecomic.com` on hydrate/login               |
| Format        | `formatAdminRole` in `src/lib/format.ts`                                                  |
| Media helper  | `readImageAsMediaFile` / `readFileAsMediaFile` (images as data URL, ≤2MB)                 |
| Media Library | `useData().mediaFiles`; Upload + Delete persist                                           |
| Profile       | Light-only text; badge-only role; camera → media `avatars` + `user.avatar`; Save persists |

## Key files

- `src/features/auth/useAuth.tsx`
- `src/features/profile/ProfilePage.tsx`
- `src/features/media/MediaLibraryPage.tsx`
- `src/lib/mediaUpload.ts`
- `src/lib/format.ts`
- `src/components/ProfileDropdown/ProfileDropdown.tsx`
