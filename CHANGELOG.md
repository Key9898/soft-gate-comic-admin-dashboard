# WebPad Admin - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.0.7] - 2026-04-29

### Added

- `public/webtoon-covers/` - New directory for AI-generated webtoon cover assets
- 10 High-quality, genre-matched cover images for mock webtoons

### Changed

#### Webtoon Cover Art Integration

- `packages/shared/src/data.ts` - Updated `mockWebtoons` with `coverImage` paths
- `packages/shared/src/types.ts` - Updated `Webtoon` interface to include `coverImage`
- `src/pages/webtoons/WebtoonsPage.tsx` - Replaced color placeholders with actual images
- **Cross-Project Sync**: Synchronized all cover assets and mock data updates to the WebPad website project
- **Local Mock Data Sync**: Updated `src/demo/mocks/data.ts` in the website project to ensure UI consistency

---

## [0.0.6] - 2026-04-27

### Added

- `src/context/SidebarContext.tsx` - New context for managing sidebar collapsed state
- `src/context/index.ts` - Context exports

### Changed

#### Sidebar Improvements

- `src/components/Sidebar/Sidebar.tsx` - Fixed collapse button position (now stays inside sidebar)
- `src/components/Sidebar/Sidebar.tsx` - Added hover animations to nav items with `whileHover`
- `src/components/Sidebar/Sidebar.tsx` - Added `AnimatePresence` for smooth title transitions
- `src/components/Sidebar/Sidebar.tsx` - Now uses `SidebarContext` for state management
- `src/components/Sidebar/Sidebar.tsx` - Now uses `SIDEBAR_ITEMS` constant from `src/constants/index.ts`
- `src/components/Sidebar/Sidebar.tsx` - Added all Phase 9 pages to sidebar navigation:
  - Media, Reports, Activity Log, Revenue, Notifications, Schedule
- `src/components/Sidebar/Sidebar.tsx` - Added animation variants for nav items, icons, and titles
  - `containerVariants` - Staggered children animation for nav container
  - `itemVariants` - Slide-in animation for each nav item
  - Hover: Nav item slides right (x: 4), icon scales up (1.1)
- `src/components/Sidebar/Sidebar.tsx` - Removed entrance animations on navigation (was causing flash on page change)
- `src/components/Sidebar/Sidebar.tsx` - Replaced Framer Motion hover with CSS transitions for better performance
- `src/components/Sidebar/Sidebar.tsx` - Reduced animation duration from 0.2s to 0.15s
- `src/components/Sidebar/Sidebar.tsx` - Added `isReady` state to prevent flash on initial render
- `src/layouts/AdminLayout.tsx` - Replaced Framer Motion with CSS transition for margin animation
- `src/layouts/AdminLayout.tsx` - Added `isReady` state to prevent flash on initial render

#### React Router v7 Future Flags

- `src/App.tsx` - Added `v7_startTransition` future flag for React 18 concurrent features
- `src/App.tsx` - Added `v7_relativeSplatPath` future flag for improved relative path matching
- `src/App.tsx` - Removed unused `dark:bg-gray-900` and `dark:text-gray-400` classes from PageLoader

#### Authentication Fix

- `src/hooks/useAuth.tsx` - Fixed login to accept any email and password (demo mode)
- `src/hooks/useAuth.tsx` - Reduced login delay from 1000ms to 500ms
- `src/hooks/useAuth.tsx` - Dynamic user creation based on email input

#### Layout Improvements

- `src/layouts/AdminLayout.tsx` - Now responds to sidebar collapse state with animated margin
- `src/layouts/AdminLayout.tsx` - Wrapped with `SidebarProvider` for context

#### Header Improvements

- `src/components/Header/Header.tsx` - Removed dark mode classes (was causing black color issue)
- `src/components/Header/Header.tsx` - Added Framer Motion hover animation to notification button

---

## [0.0.5] - 2026-04-27

### Changed

#### Animation Migration to Framer Motion

Migrated all CSS animations to Framer Motion for consistent, performant animations across the application.

- `src/components/Toast/Toast.tsx` - Converted CSS animation to Framer Motion with slide-in effect
- `src/components/ConfirmDialog/ConfirmDialog.tsx` - Added Framer Motion with scale and fade animations
- `src/components/ProfileDropdown/ProfileDropdown.tsx` - Added Framer Motion with staggered menu items
- `src/components/SessionTimeoutDialog/SessionTimeoutDialog.tsx` - Added Framer Motion animations
- `src/components/Sidebar/Sidebar.tsx` - Added Framer Motion for collapse/expand and nav items
- `src/components/EmptyState/EmptyState.tsx` - Added Framer Motion fade-in animations
- `src/pages/auth/LoginPage.tsx` - Added Framer Motion staggered form animations
- `src/App.tsx` - Updated PageLoader with Framer Motion spinner animation

#### CSS Cleanup

- `global.css` - Removed unused CSS keyframe animations (`fadeIn`, `slideUp`, `slideDown`, `scaleIn`)
- `global.css` - Removed unused CSS utility classes (`animate-fade-in`, `animate-slide-up`, `animate-slide-down`, `animate-scale-in`)

### Verified

- All icons are using Lucide Icons (no other icon libraries in use)

---

## [0.0.4] - 2026-04-27

### Added

#### Shared Package (@webpad/shared)

- `packages/shared/package.json` - Shared package configuration
- `packages/shared/tsconfig.json` - TypeScript configuration with DOM support
- `packages/shared/src/types.ts` - Shared TypeScript types (AdminUser, User, Webtoon, Episode, Author, Genre, Comment, etc.)
- `packages/shared/src/data.ts` - Shared mock data and sync functions
  - `getSharedData()` - Get all shared data as object
  - `exportToJSON()` - Export data to JSON string
  - `importFromJSON()` - Import data from JSON string
  - `downloadJSON()` - Download data as JSON file
  - `saveToLocalStorage()` - Save data to localStorage
  - `loadFromLocalStorage()` - Load data from localStorage
- `packages/shared/src/index.ts` - Main export file
- `packages/shared/WEBPAD_INSTRUCTIONS.md` - Instructions for WebPad Website integration

#### Documentation

- `PROJECT_RULES.md` - Added Icon Rules (Section 11) with Lucide Icons guidelines
- `PROJECT_RULES.md` - Added Animation Rules (Section 12) with Framer Motion guidelines
- `PROJECT_RULES.md` - Added Icon and Animation Quick Reference sections
- `PROJECT_PLAN.md` - Added Guidelines column to Tech Stack table with references to PROJECT_RULES.md

### Changed

- Updated `tsconfig.json` with path alias for `@webpad/shared`
- Updated `vite.config.ts` with alias for `@webpad/shared`
- Updated `src/types/index.ts` to re-export from `@webpad/shared`
- Updated `src/demo/index.ts` to export from `@webpad/shared`
- Updated `src/demo/mocks/data.ts` to import from `@webpad/shared`

### Fixed

#### Accessibility Fixes

- `src/components/Toast/Toast.tsx` - Added `type="button"` and `title` attribute to close button
- `src/components/Toggle/Toggle.tsx` - Fixed `aria-checked` with proper literal type function
- `src/components/Skeleton/Skeleton.tsx` - Removed inline styles, used Tailwind classes
- `src/components/MediaPicker/MediaPicker.tsx` - Added `aria-label` to file input and select elements
- `src/pages/profile/ProfilePage.tsx` - Added `type="button"` and `title` to avatar button
- `src/pages/media/MediaLibraryPage.tsx` - Added `aria-label` to select elements, `title` to buttons
- `src/pages/activity-log/ActivityLogPage.tsx` - Added `aria-label` to select elements
- `src/pages/reports/ReportsPage.tsx` - Added `aria-label` to select elements
- `src/pages/schedule/SchedulePage.tsx` - Added `type="button"` and `title` to buttons, `aria-label` to select
- `src/pages/revenue/RevenuePage.tsx` - Added `aria-label` to select elements, `title` to buttons
- `src/pages/notifications/NotificationsPage.tsx` - Added `aria-label` to select and checkbox elements
- `src/pages/episodes/EpisodesPage.tsx` - Added `aria-label` to file inputs, `title` to buttons, fixed deprecated `substr`
- `src/pages/webtoons/WebtoonsPage.tsx` - Added `title` to tag remove button

#### TypeScript Fixes

- Fixed `packages/shared/tsconfig.json` to include `DOM` in lib
- Fixed `AdminUser` interface to make `createdAt` optional
- Fixed export syntax in `src/pages/index.ts` for all page components

---

## [0.0.3] - 2026-04-27

### Added

#### Error Handling & User Feedback

- `src/components/Toast/Toast.tsx` - Toast notification system with success, error, warning, info types
- `src/components/Toast/index.ts` - Toast export with ToastProvider and useToast hook
- `src/components/ConfirmDialog/ConfirmDialog.tsx` - Reusable confirmation dialog with danger, warning, info variants
- `src/components/ConfirmDialog/index.ts` - ConfirmDialog export

#### Loading States & Empty States

- `src/components/Skeleton/Skeleton.tsx` - Loading skeleton components (TableSkeleton, CardSkeleton, StatsSkeleton, ImageSkeleton, TextSkeleton)
- `src/components/Skeleton/index.ts` - Skeleton exports
- `src/components/EmptyState/EmptyState.tsx` - Empty state components (NoWebtoons, NoEpisodes, NoUsers, NoComments, NoSearchResults, NoMedia)
- `src/components/EmptyState/index.ts` - EmptyState exports

#### Header & Profile

- `src/components/ProfileDropdown/ProfileDropdown.tsx` - Profile dropdown menu with theme toggle
- `src/components/ProfileDropdown/index.ts` - ProfileDropdown export
- `src/pages/profile/ProfilePage.tsx` - Profile page with avatar, edit profile, change password
- `src/pages/profile/index.ts` - ProfilePage export
- `src/hooks/useTheme.ts` - Theme context and hook for light/dark mode switching

#### Media Library

- `src/pages/media/MediaLibraryPage.tsx` - Media library management page with grid view, delete, copy URL
- `src/pages/media/index.ts` - MediaLibraryPage export
- `src/components/MediaPicker/MediaPicker.tsx` - Modal for selecting media files with search, filter, upload
- `src/components/MediaPicker/index.ts` - MediaPicker export with MediaFile type

#### Webtoon Management

- Updated `src/pages/webtoons/WebtoonsPage.tsx` with:
  - Cover image upload via MediaPicker
  - Tags input with popular tags suggestions
  - Tags display in webtoon list

#### Episode Management

- Updated `src/pages/episodes/EpisodesPage.tsx` with:
  - Multiple image upload support
  - Image ordering (up/down buttons)
  - PDF file upload support
  - Bulk upload modal
  - PDF split into multiple episodes option
  - Scheduled publish option

#### Activity Log

- `src/pages/activity-log/ActivityLogPage.tsx` - Activity log page with filters and export to CSV
- `src/pages/activity-log/index.ts` - ActivityLogPage export

#### Reports Management

- `src/pages/reports/ReportsPage.tsx` - Reports management page with filters and actions
- `src/pages/reports/index.ts` - ReportsPage export

#### Revenue & Payments

- `src/pages/revenue/RevenuePage.tsx` - Revenue dashboard with:
  - Overview tab (stats cards, recent transactions, pending payouts)
  - Transactions tab (search, filter, export)
  - Payouts tab (approve, reject, mark as paid)
- `src/pages/revenue/index.ts` - RevenuePage export

#### Notifications System

- `src/pages/notifications/NotificationsPage.tsx` - Notifications page with:
  - Filter by type and read status
  - Mark as read/unread
  - Mark all as read
  - Delete notifications
  - Bulk selection and delete
- `src/pages/notifications/index.ts` - NotificationsPage export

#### Scheduled Publish

- `src/pages/schedule/SchedulePage.tsx` - Content calendar with:
  - Calendar view (monthly)
  - List view
  - Schedule episode modal
  - Edit scheduled episode
  - Filter by webtoon
- `src/pages/schedule/index.ts` - SchedulePage export

#### Session & Security

- `src/hooks/useSessionTimeout.ts` - Session timeout hook with auto-logout
- `src/hooks/useKeyboardShortcuts.ts` - Keyboard shortcuts hook
- `src/components/SessionTimeoutDialog/SessionTimeoutDialog.tsx` - Session timeout warning dialog
- `src/components/SessionTimeoutDialog/index.ts` - SessionTimeoutDialog export

### Changed

- Updated `src/components/index.ts` with new component exports
- Updated `src/pages/index.ts` with new page exports
- Updated `src/constants/index.ts` with new sidebar items (Media, Reports, Activity Log, Revenue, Notifications, Schedule)
- Updated `src/App.tsx` with new routes
- Updated `src/components/SEO/SEO.tsx` with PageSEO entries for new pages
- Updated `src/hooks/useAuth.tsx` with createdAt property in AdminUser interface

---

## [0.0.2] - 2026-04-27

### Added

#### Unit Tests

- `vitest.config.ts` - Vitest configuration with jsdom environment
- `src/test/setup.ts` - Test setup with localStorage mock and cleanup
- `src/test/utils.tsx` - Custom render function with providers
- `src/components/Button/Button.test.tsx` - Button component tests (16 tests)
- `src/components/Input/Input.test.tsx` - Input component tests (14 tests)
- `src/components/Card/Card.test.tsx` - Card component tests (9 tests)
- `src/components/Modal/Modal.test.tsx` - Modal component tests (11 tests)
- `src/components/Toggle/Toggle.test.tsx` - Toggle component tests (10 tests)
- `src/hooks/useAuth.test.tsx` - useAuth hook tests (7 tests)
- `src/utils/formatters.ts` - Utility functions for formatting
- `src/utils/validators.ts` - Utility functions for validation
- `src/utils/formatters.test.ts` - Formatter tests (14 tests)
- `src/utils/validators.test.ts` - Validator tests (15 tests)

#### Integration Tests

- `playwright.config.ts` - Playwright configuration
- `e2e/auth.spec.ts` - Authentication flow E2E tests
- `e2e/navigation.spec.ts` - Navigation E2E tests
- `e2e/forms.spec.ts` - Form submission E2E tests
- `e2e/crud.spec.ts` - CRUD operation E2E tests

#### Performance Optimization

- Code splitting with React.lazy in `src/App.tsx`
- Route-based lazy loading with Suspense
- Bundle optimization in `vite.config.ts`:
  - vendor chunk (React, React DOM, Router)
  - charts chunk (Recharts)
  - animations chunk (Framer Motion)
- `src/hooks/useDebounce.ts` - Debounce hook for performance
- `src/hooks/useLocalStorage.ts` - LocalStorage hook with sync

#### SEO Optimization

- `src/components/SEO/SEO.tsx` - SEO component with meta tags
- `src/components/SEO/index.ts` - SEO export
- `public/robots.txt` - Robots configuration
- `public/sitemap.xml` - Sitemap for search engines
- Updated `index.html` with Open Graph and Twitter Card meta tags
- Added react-helmet-async for dynamic meta tags
- PageSEO components for each page

#### New Components

- `src/components/ProgressBar/ProgressBar.tsx` - Progress bar component
- `src/components/ProgressBar/index.ts` - ProgressBar export

### Changed

- Updated `src/App.tsx` to use React.lazy for code splitting
- Updated `src/main.tsx` to wrap with HelmetProvider
- Updated `src/components/index.ts` to export SEO and ProgressBar
- Updated `src/hooks/index.ts` to export useDebounce and useLocalStorage
- Updated `package.json` with new test scripts

### Fixed

- Fixed import path in `src/demo/mocks/data.ts`
- Fixed `line-clamp` CSS property for Chrome compatibility
- Fixed Toggle component ARIA attributes

---

## [0.0.1] - 2026-04-27

### Added

#### Project Setup

- Created React + TypeScript + Vite project
- Setup Tailwind CSS v3 with custom theme colors (Purple)
- Setup ESLint with TypeScript support
- Setup Prettier for code formatting
- Created project folder structure

#### Configuration Files

- `package.json` - Project dependencies and scripts
- `vite.config.ts` - Vite configuration with path aliases
- `tsconfig.json` - TypeScript configuration with strict mode
- `tailwind.config.js` - Tailwind CSS with custom primary colors
- `postcss.config.js` - PostCSS configuration
- `eslint.config.js` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `.gitignore` - Git ignore patterns

#### Core Components

- `src/components/Button/Button.tsx` - Button component with variants (primary, secondary, outline, ghost, danger), sizes (sm, md, lg), loading state, and icon support
- `src/components/Input/Input.tsx` - Input component with label, error, hint, leftIcon, rightIcon, and password toggle
- `src/components/Card/Card.tsx` - Card component with variants (default, hover, interactive)
- `src/components/Modal/Modal.tsx` - Modal component with Framer Motion animations
- `src/components/Sidebar/Sidebar.tsx` - Collapsible sidebar navigation
- `src/components/Header/Header.tsx` - Header with search and user profile
- `src/components/ProtectedRoute/ProtectedRoute.tsx` - Route protection component
- `src/components/Toggle/Toggle.tsx` - Toggle switch component with proper ARIA attributes

#### Authentication

- `src/hooks/useAuth.tsx` - Auth context and hook with login, logout
- `src/pages/auth/LoginPage.tsx` - Login page with demo authentication

#### Dashboard

- `src/pages/dashboard/DashboardPage.tsx` - Dashboard overview with:
  - Statistics cards (Users, Webtoons, Episodes, Views, Revenue)
  - Revenue chart (Area chart)
  - User growth chart (Line chart)
  - Popular webtoons chart (Bar chart)
  - Top revenue webtoons list

#### Webtoon Management

- `src/pages/webtoons/WebtoonsPage.tsx` - Webtoon management with:
  - List view with search and filter
  - Add new webtoon modal
  - Edit webtoon modal
  - Delete webtoon confirmation
  - Status badges (ongoing, completed, hiatus, draft)

#### Episode Management

- `src/pages/episodes/EpisodesPage.tsx` - Episode management with:
  - List view with search and filter
  - Add new episode modal
  - Edit episode modal
  - Delete episode confirmation
  - Premium content settings

#### User Management

- `src/pages/users/UsersPage.tsx` - User management with:
  - List view with search and filter
  - User status cards (active, banned, suspended)
  - User detail modal
  - Ban/Unban functionality
  - Suspend functionality

#### Comment Moderation

- `src/pages/comments/CommentsPage.tsx` - Comment moderation with:
  - List view with search and filter
  - Status cards (visible, hidden, deleted)
  - Comment detail modal
  - Hide/Show functionality
  - Delete functionality

#### Analytics

- `src/pages/analytics/AnalyticsPage.tsx` - Analytics dashboard with:
  - Date range selector (7d, 30d, 90d)
  - Revenue trend chart
  - User growth chart
  - Top performing webtoons
  - Genre distribution pie chart
  - Revenue by webtoon table

#### Settings

- `src/pages/settings/SettingsPage.tsx` - Settings page with:
  - General settings (site name, description, language)
  - Security settings (registration, email verification, maintenance mode)
  - Notification settings
  - Appearance settings (theme, primary color)

#### Layouts

- `src/layouts/AdminLayout.tsx` - Admin layout with Sidebar and Header

#### Mock Data

- `src/demo/mocks/data.ts` - Mock data for:
  - Dashboard statistics
  - Revenue data
  - User growth data
  - Popular webtoons
  - Webtoons list
  - Episodes list
  - Users list
  - Comments list
  - Authors list
  - Genres list

#### Types

- `src/types/index.ts` - TypeScript type definitions for all entities

#### Constants

- `src/constants/index.ts` - Application constants (sidebar items, statuses)

#### Global Styles

- `global.css` - Custom CSS classes:
  - Button variants (btn-primary, btn-secondary, btn-danger)
  - Input base styles
  - Card styles
  - Sidebar link styles
  - Table styles
  - Badge variants
  - Animations (fade-in, slide-up, slide-down, scale-in)

### Changed

#### Settings Page Refactor

- Refactored `SettingsPage.tsx` to use new `Toggle` component
- Reduced code from ~280 lines to ~200 lines
- Improved code maintainability and reusability

### Fixed

#### Accessibility Fixes

- Added `aria-label` attributes to select elements
- Added `title` and `aria-label` to icon-only buttons
- Added `htmlFor` and `id` to form labels
- Added `role="switch"` and `aria-checked` to toggle buttons
- Created `getAriaChecked` helper function to return proper literal type `'true' | 'false'`

#### TypeScript Fixes

- Fixed `ToggleProps` interface by omitting `onChange` from `ButtonHTMLAttributes`
- Added proper type annotation for `aria-checked` attribute

#### Code Quality

- Removed unused imports and variables
- Added TypeScript type annotations
- Fixed inline styles to use Tailwind classes

---

## Change Categories

| Category     | Description                  |
| ------------ | ---------------------------- |
| `Added`      | New features                 |
| `Changed`    | Changes to existing features |
| `Deprecated` | Features to be removed       |
| `Removed`    | Features removed             |
| `Fixed`      | Bug fixes                    |
| `Security`   | Security improvements        |

---

## Version History

| Version | Date       | Description                                |
| ------- | ---------- | ------------------------------------------ |
| 0.0.7   | 2026-04-29 | Webtoon Cover Art Integration & Project Sync |
| 0.0.6   | 2026-04-27 | Sidebar Improvements + React Router Flags   |
| 0.0.5   | 2026-04-27 | Migration to Framer Motion + CSS Cleanup    |
| 0.0.4   | 2026-04-27 | Shared Package + Accessibility Fixes       |
| 0.0.3   | 2026-04-27 | Phase 9 features complete - All features   |
| 0.0.2   | 2026-04-27 | Phase 10 complete - Testing & Optimization |
| 0.0.1   | 2026-04-27 | Phase 9 complete - Admin Dashboard         |

---

## Contributors

| Agent       | Date       | Changes                                      |
| ----------- | ---------- | -------------------------------------------- |
| Antigravity | 2026-04-29 | Webtoon Cover Art Integration & Project Sync |
| Claude      | 2026-04-27 | Phase 9 implementation                       |
| Claude      | 2026-04-27 | Phase 10 implementation                      |
| Claude      | 2026-04-27 | Phase 9 features                             |
| Claude      | 2026-04-27 | Shared Package                               |
| Claude      | 2026-04-27 | Accessibility fixes                          |

---

## Notes

- This changelog is updated after every significant change
- All agents must update this file after making changes
- Follow the "Mind Your Own Business" rule - only document your own changes
