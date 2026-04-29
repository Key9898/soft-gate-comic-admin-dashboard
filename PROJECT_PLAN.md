# WebPad Admin - Project Plan

## Project Overview

**WebPad Admin** is the admin dashboard for the WebPad webtoon platform. It is a **SEPARATE PROJECT** from the main WebPad website and connects to the same backend API.

---

## Project Information

| Category            | Details                                     |
| ------------------- | ------------------------------------------- |
| **Project Type**    | Admin Dashboard                             |
| **Target Audience** | Platform Administrators                     |
| **Language**        | English (Multi-language support later)      |
| **Platform**        | Web (Responsive: Desktop + Tablet + Mobile) |

---

## Tech Stack

| Technology      | Purpose      | Guidelines                      |
| --------------- | ------------ | ------------------------------- |
| React           | UI Library   | -                               |
| TypeScript      | Type Safety  | See PROJECT_RULES.md Section 2  |
| Vite            | Build Tool   | -                               |
| Tailwind CSS v3 | Styling      | See PROJECT_RULES.md Section 1  |
| Lucide Icons    | Icon Library | See PROJECT_RULES.md Section 11 |
| Framer Motion   | Animations   | See PROJECT_RULES.md Section 12 |
| Recharts        | Charts       | -                               |
| React Router    | Routing      | -                               |

---

## Theme Colors (Tailwind CSS)

| Color Name     | Tailwind Class | Usage                            |
| -------------- | -------------- | -------------------------------- |
| Primary        | `primary-600`  | CTA buttons, Logo, Active states |
| Primary Light  | `primary-100`  | Tags, Backgrounds                |
| Primary Dark   | `primary-700`  | Hover states                     |
| Text Dark      | `gray-900`     | Primary text                     |
| Text Secondary | `gray-500`     | Secondary text                   |
| Background     | `gray-100`     | Page backgrounds                 |

---

## Project Architecture

```
webpad-admin-dashboard/
├── global.css                    # Global styles (ROOT LEVEL)
├── index.html                    # HTML entry point
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
├── .prettierrc
├── .gitignore
├── PROJECT_PLAN.md
├── PROJECT_RULES.md
├── CHANGELOG.md
├── LAST_SESSION.md
└── src/
    ├── main.tsx                  # Application entry point
    ├── App.tsx                   # Root component
    ├── vite-env.d.ts
    ├── components/               # Modular components
    │   ├── Button/
    │   ├── Input/
    │   ├── Card/
    │   ├── Modal/
    │   ├── Sidebar/
    │   ├── Header/
    │   ├── ProtectedRoute/
    │   └── Toggle/
    ├── hooks/                    # Custom React hooks
    │   └── useAuth.tsx
    ├── types/                    # TypeScript type definitions
    ├── pages/                    # Page components
    │   ├── auth/
    │   ├── dashboard/
    │   ├── webtoons/
    │   ├── episodes/
    │   ├── users/
    │   ├── comments/
    │   ├── analytics/
    │   └── settings/
    ├── layouts/                  # Layout components
    │   └── AdminLayout.tsx
    ├── constants/                # Constants and configurations
    └── demo/                     # Demo and mock data
        └── mocks/
```

---

## Features

### Phase 8: Backend API (Prerequisite) 🔄

> **Note:** Phase 8 is a prerequisite for Admin Dashboard. It must be completed before connecting the Admin Dashboard to real data.

#### Setup NodeJS Backend

- [ ] Initialize Node.js + Express + TypeScript
- [ ] Setup project structure
- [ ] Configure environment variables
- [ ] Setup ESLint + Prettier
- [ ] Setup nodemon for development

#### MongoDB Models

- [ ] User Model (existing from main app)
- [ ] Webtoon Model (existing from main app)
- [ ] Episode Model (existing from main app)
- [ ] Comment Model (existing from main app)
- [ ] AdminUser Model (new - with role-based access)
- [ ] PlatformSettings Model (new)
- [ ] ActivityLog Model (new - audit trail)
- [ ] Genre Model (existing from main app)

#### API Routes

- [ ] Auth Routes (login, logout, refresh, me)
- [ ] Dashboard Routes (stats, revenue, user-growth, popular-webtoons)
- [ ] Webtoon Routes (CRUD, status update)
- [ ] Episode Routes (CRUD, status update)
- [ ] User Routes (list, detail, status update)
- [ ] Comment Routes (list, detail, status update, delete)
- [ ] Analytics Routes (overview, revenue, users, webtoons, genres)
- [ ] Settings Routes (get, update)
- [ ] Activity Log Routes (list)

#### Authentication Middleware

- [ ] JWT Token generation
- [ ] JWT Token verification
- [ ] Admin role verification
- [ ] Role-based access control (RBAC)
- [ ] Rate limiting for admin endpoints
- [ ] Input validation and sanitization

#### Cloudinary Integration

- [ ] Setup Cloudinary account
- [ ] Configure upload presets
- [ ] Image upload API
- [ ] Image transformation API
- [ ] Image deletion API
- [ ] Webtoon cover image upload
- [ ] Episode images upload

#### Security

- [ ] HTTPS enforcement
- [ ] CORS configuration
- [ ] Helmet.js for security headers
- [ ] Rate limiting
- [ ] Input validation (Joi/Zod)
- [ ] XSS protection
- [ ] CSRF protection

#### Backend Integration

- [ ] Connect to real backend API
- [ ] Real authentication with JWT
- [ ] Real-time data updates
- [ ] Implement all API endpoints
- [ ] Add activity logging

---

### Phase 9: Admin Dashboard ✅

> **Status:** All features implemented. See details below.

#### Authentication

- [x] Admin Login Page
- [x] Demo Authentication (any email/password)
- [x] Protected Routes
- [x] Session Management (localStorage)

#### Header & Profile

- [x] Profile Dropdown Menu
  - [x] Click profile to open dropdown
  - [x] User info section
    - [x] Avatar display
    - [x] Display name
    - [x] Email address
  - [x] Menu items
    - [x] My Profile (view/edit profile page)
    - [x] Settings (quick link to settings)
    - [x] Theme Toggle (Dark/Light mode)
    - [x] Logout button
  - [x] Dropdown styling
    - [x] Smooth open/close animation
    - [x] Click outside to close
    - [x] Responsive design

- [x] Profile Page (`/profile`)
  - [x] Profile overview
    - [x] Avatar display (large)
    - [x] Display name
    - [x] Email
    - [x] Role
  - [x] Edit profile
    - [x] Change display name
    - [x] Change email
  - [x] Change password
    - [x] Current password field
    - [x] New password field
    - [x] Confirm new password
    - [x] Password strength indicator

- [x] Theme Toggle
  - [x] Light mode (default)
  - [x] Dark mode
  - [x] Persist theme preference
  - [x] Theme toggle in profile dropdown

#### Dashboard Overview

- [x] Statistics Cards (Users, Webtoons, Episodes, Views, Revenue)
- [x] Revenue Chart (Area chart)
- [x] User Growth Chart (Line chart)
- [x] Popular Webtoons Chart (Bar chart)
- [x] Top Revenue Webtoons List

#### Webtoon Management

- [x] Webtoon List with Search
- [x] Filter by Status
- [x] Add New Webtoon
- [x] Edit Webtoon
- [x] Delete Webtoon
- [x] Status Badges (ongoing, completed, hiatus, draft)
- [x] Cover Image
  - [x] Cover image upload via Media Picker
  - [x] Cover image preview in form
  - [x] Cover image display in list/grid view
  - [x] AI-generated genre-matched cover art integration
  - [x] Cross-project asset synchronization (Admin Dashboard + Website)
- [x] Tags
  - [x] Tags input field
  - [x] Tags display in webtoon list

#### Episode Management

- [x] Episode List with Search
- [x] Filter by Webtoon and Status
- [x] Add New Episode
- [x] Edit Episode
- [x] Delete Episode
- [x] Premium Content Settings
- [x] Episode Images
  - [x] Multiple image upload support
  - [x] Image upload area (file picker)
  - [x] Image ordering (up/down buttons)
  - [x] Image preview in form
  - [x] Delete individual images
  - [x] Bulk upload support (select multiple files)
- [x] PDF Upload Support
  - [x] Accept PDF files
  - [x] PDF file display
- [x] Bulk Upload + Episode Split
  - [x] Upload multiple files at once
  - [x] PDF split into multiple episodes option
  - [x] Auto-create episodes
- [x] Scheduled Publish
  - [x] Schedule date/time picker
  - [x] Status: draft, published, scheduled

#### User Management

- [x] User List with Search
- [x] Filter by Status
- [x] User Status Cards (active, banned, suspended)
- [x] User Detail Modal
- [x] Ban/Unban Functionality
- [x] Suspend Functionality

#### Comment Moderation

- [x] Comment List with Search
- [x] Filter by Status
- [x] Status Cards (visible, hidden, deleted)
- [x] Comment Detail Modal
- [x] Hide/Show Functionality
- [x] Delete Functionality

#### Analytics

- [x] Date Range Selector (7d, 30d, 90d)
- [x] Revenue Trend Chart
- [x] User Growth Chart
- [x] Top Performing Webtoons
- [x] Genre Distribution Pie Chart
- [x] Revenue by Webtoon Table

#### Settings

- [x] General Settings (site name, description, language)
- [x] Security Settings (registration, email verification, maintenance mode)
- [x] Notification Settings
- [x] Appearance Settings (theme, primary color)

#### Media Library

- [x] Media Library Page (`/media`)
  - [x] Grid view of all files
  - [x] Upload files (file picker)
  - [x] Delete files
  - [x] Copy file URLs to clipboard
  - [x] File preview modal

- [x] Media Picker Component
  - [x] Reusable modal component for selecting files
  - [x] Grid view of files from library
  - [x] Filter by file type (All, Images, PDFs)
  - [x] Select single or multiple files
  - [x] Upload new file directly from picker
  - [x] Confirm/Cancel buttons

#### Error Handling & User Feedback

- [x] Toast Notifications
  - [x] Success messages (green)
  - [x] Error messages (red)
  - [x] Warning messages (yellow)
  - [x] Info messages (blue)
  - [x] Auto-dismiss option
  - [x] Manual dismiss button
- [x] Confirmation Dialogs
  - [x] Delete confirmation
  - [x] Custom confirmation messages
  - [x] Confirm/Cancel buttons

#### Loading States & Empty States

- [x] Skeleton loaders
  - [x] Table skeleton
  - [x] Card skeleton
  - [x] Stats skeleton
  - [x] Image skeleton
  - [x] Text skeleton
- [x] Empty States
  - [x] No webtoons
  - [x] No episodes
  - [x] No users
  - [x] No comments
  - [x] No search results
  - [x] No media
    - [ ] Full page loader
  - [ ] Lazy loading indicators

- [ ] Empty States
  - [ ] No webtoons yet (with "Add Webtoon" button)

#### Admin Activity Log

- [x] Activity Log Page (`/activity-log`)
  - [x] List all admin actions
  - [x] Activity details (action type, target, admin user, timestamp)
  - [x] Filter options (by action type, date range)
  - [x] Export activity log (CSV)

#### Session & Security

- [x] Session Management
  - [x] Auto-logout after inactivity
  - [x] Session timeout warning
  - [x] "Stay logged in" button
- [x] Password change functionality
  - [x] Change password form
  - [x] Password strength indicator

#### Keyboard Shortcuts

- [x] Keyboard Shortcuts Hook
  - [x] Global search (Ctrl/Cmd + K)
  - [x] Navigate pages (Ctrl/Cmd + 1-9)
  - [x] Quick actions (Esc, /)

#### Revenue & Payments

- [x] Revenue Dashboard
  - [x] Total revenue overview
  - [x] Revenue by webtoon
  - [x] Coin sales tracking
- [x] Payment Management
  - [x] Author Payouts
    - [x] Payout requests list
    - [x] Payout status
    - [x] Approve/Reject payouts
    - [x] Mark as paid
  - [x] Transaction History
    - [x] All transactions list
    - [x] Filter by type
    - [x] Export transactions

#### Reports Management

- [x] Reports Page (`/reports`)
  - [x] Reports list
  - [x] Report actions (resolve, dismiss)
  - [x] Filter options (by type, status)

#### Notifications System

- [x] Admin Notifications
  - [x] Notifications Page (`/notifications`)
  - [x] Notification list with types
  - [x] Mark as read/unread
  - [x] Mark all as read
  - [x] Delete notifications
  - [ ] Notification history
    - [ ] View all notifications

#### Scheduled Publish

- [x] Scheduled Episodes
  - [x] Schedule episode publish
    - [x] Date and time picker
    - [x] Edit scheduled time
  - [x] Scheduled episodes list
    - [x] Upcoming scheduled episodes
    - [x] Filter by webtoon

- [x] Content Calendar
  - [x] Calendar view
    - [x] Monthly calendar
  - [x] Calendar features
    - [x] Click to view/edit episode
    - [x] Filter by webtoon
  - [x] List view toggle

---

## Backend API Requirements

### Database Models

#### Admin User Model

```typescript
interface AdminUser {
  _id: string
  email: string
  username: string
  displayName: string
  avatar?: string
  role: 'admin' | 'super_admin'
  passwordHash: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}
```

#### Platform Settings Model

```typescript
interface PlatformSettings {
  _id: string
  siteName: string
  siteDescription: string
  contactEmail: string
  maintenanceMode: boolean
  allowRegistration: boolean
  requireEmailVerification: boolean
  defaultLanguage: string
  defaultTheme: string
  notifications: {
    newUser: boolean
    newWebtoon: boolean
    newComment: boolean
    reportSubmitted: boolean
  }
  updatedAt: Date
  updatedBy: string // AdminUser _id
}
```

#### Activity Log Model

```typescript
interface ActivityLog {
  _id: string
  adminId: string
  action: string
  targetType: 'webtoon' | 'episode' | 'user' | 'comment' | 'settings'
  targetId: string
  details: Record<string, unknown>
  createdAt: Date
}
```

---

### API Endpoints

#### Authentication

| Method | Endpoint                  | Description            |
| ------ | ------------------------- | ---------------------- |
| POST   | `/api/admin/auth/login`   | Admin login            |
| POST   | `/api/admin/auth/logout`  | Admin logout           |
| GET    | `/api/admin/auth/me`      | Get current admin user |
| POST   | `/api/admin/auth/refresh` | Refresh access token   |

#### Dashboard

| Method | Endpoint                                | Description                        |
| ------ | --------------------------------------- | ---------------------------------- |
| GET    | `/api/admin/dashboard/stats`            | Get dashboard statistics           |
| GET    | `/api/admin/dashboard/revenue`          | Get revenue data (with date range) |
| GET    | `/api/admin/dashboard/user-growth`      | Get user growth data               |
| GET    | `/api/admin/dashboard/popular-webtoons` | Get popular webtoons               |

#### Webtoons Management

| Method | Endpoint                         | Description                                         |
| ------ | -------------------------------- | --------------------------------------------------- |
| GET    | `/api/admin/webtoons`            | List all webtoons (with pagination, search, filter) |
| GET    | `/api/admin/webtoons/:id`        | Get webtoon details                                 |
| POST   | `/api/admin/webtoons`            | Create new webtoon                                  |
| PUT    | `/api/admin/webtoons/:id`        | Update webtoon                                      |
| DELETE | `/api/admin/webtoons/:id`        | Delete webtoon                                      |
| PUT    | `/api/admin/webtoons/:id/status` | Update webtoon status                               |

#### Episodes Management

| Method | Endpoint                         | Description                                         |
| ------ | -------------------------------- | --------------------------------------------------- |
| GET    | `/api/admin/episodes`            | List all episodes (with pagination, search, filter) |
| GET    | `/api/admin/episodes/:id`        | Get episode details                                 |
| POST   | `/api/admin/episodes`            | Create new episode                                  |
| PUT    | `/api/admin/episodes/:id`        | Update episode                                      |
| DELETE | `/api/admin/episodes/:id`        | Delete episode                                      |
| PUT    | `/api/admin/episodes/:id/status` | Update episode status                               |

#### Users Management

| Method | Endpoint                      | Description                                      |
| ------ | ----------------------------- | ------------------------------------------------ |
| GET    | `/api/admin/users`            | List all users (with pagination, search, filter) |
| GET    | `/api/admin/users/:id`        | Get user details                                 |
| PUT    | `/api/admin/users/:id/status` | Update user status (ban/suspend/active)          |
| GET    | `/api/admin/users/stats`      | Get user statistics                              |

#### Comments Moderation

| Method | Endpoint                         | Description                                         |
| ------ | -------------------------------- | --------------------------------------------------- |
| GET    | `/api/admin/comments`            | List all comments (with pagination, search, filter) |
| GET    | `/api/admin/comments/:id`        | Get comment details                                 |
| PUT    | `/api/admin/comments/:id/status` | Update comment status (visible/hidden/deleted)      |
| DELETE | `/api/admin/comments/:id`        | Delete comment permanently                          |

#### Analytics

| Method | Endpoint                        | Description                             |
| ------ | ------------------------------- | --------------------------------------- |
| GET    | `/api/admin/analytics/overview` | Get analytics overview                  |
| GET    | `/api/admin/analytics/revenue`  | Get revenue analytics (with date range) |
| GET    | `/api/admin/analytics/users`    | Get user analytics                      |
| GET    | `/api/admin/analytics/webtoons` | Get webtoon analytics                   |
| GET    | `/api/admin/analytics/genres`   | Get genre distribution                  |

#### Settings

| Method | Endpoint              | Description              |
| ------ | --------------------- | ------------------------ |
| GET    | `/api/admin/settings` | Get platform settings    |
| PUT    | `/api/admin/settings` | Update platform settings |

#### Activity Logs

| Method | Endpoint                   | Description                         |
| ------ | -------------------------- | ----------------------------------- |
| GET    | `/api/admin/activity-logs` | Get activity logs (with pagination) |

---

### Authentication Middleware

```typescript
// Admin authentication middleware
const adminAuthMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = verifyAccessToken(token)

    // Check if user is admin
    const admin = await AdminUser.findById(decoded.userId)
    if (!admin || !['admin', 'super_admin'].includes(admin.role)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    req.admin = admin
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
```

---

### Role-Based Access Control

| Role          | Permissions                                       |
| ------------- | ------------------------------------------------- |
| `super_admin` | Full access to all features                       |
| `admin`       | Limited access (no settings, no admin management) |

#### Permission Matrix

| Feature             | super_admin | admin |
| ------------------- | ----------- | ----- |
| Dashboard           | ✅          | ✅    |
| Webtoons (CRUD)     | ✅          | ✅    |
| Episodes (CRUD)     | ✅          | ✅    |
| Users (View)        | ✅          | ✅    |
| Users (Ban/Suspend) | ✅          | ✅    |
| Comments (Moderate) | ✅          | ✅    |
| Analytics           | ✅          | ✅    |
| Settings            | ✅          | ❌    |
| Activity Logs       | ✅          | ❌    |

---

### Database Indexes

```javascript
// AdminUser indexes
db.adminusers.createIndex({ email: 1 }, { unique: true })
db.adminusers.createIndex({ username: 1 }, { unique: true })

// ActivityLog indexes
db.activitylogs.createIndex({ adminId: 1 })
db.activitylogs.createIndex({ targetType: 1, targetId: 1 })
db.activitylogs.createIndex({ createdAt: -1 })
```

---

## Components

### Core Components

| Component      | Description                                     | Status |
| -------------- | ----------------------------------------------- | ------ |
| Button         | Multiple variants, sizes, loading state         | ✅     |
| Input          | Label, error, hint, icons, password toggle      | ✅     |
| Card           | Multiple variants (default, hover, interactive) | ✅     |
| Modal          | Framer Motion animations, multiple sizes        | ✅     |
| Sidebar        | Collapsible navigation                          | ✅     |
| Header         | Search bar, notifications, user profile         | ✅     |
| ProtectedRoute | Route protection component                      | ✅     |
| Toggle         | Toggle switch with ARIA attributes              | ✅     |

---

## Pages

| Page      | Route        | Description          | Status |
| --------- | ------------ | -------------------- | ------ |
| Login     | `/login`     | Admin authentication | ✅     |
| Dashboard | `/`          | Overview statistics  | ✅     |
| Webtoons  | `/webtoons`  | Webtoon management   | ✅     |
| Episodes  | `/episodes`  | Episode management   | ✅     |
| Users     | `/users`     | User management      | ✅     |
| Comments  | `/comments`  | Comment moderation   | ✅     |
| Analytics | `/analytics` | Analytics dashboard  | ✅     |
| Settings  | `/settings`  | Platform settings    | ✅     |

---

## Mock Data

All mock data is located in `src/demo/mocks/data.ts`:

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

---

### Phase 10: Testing & Optimization ✅

#### Unit Tests

- [x] Setup Vitest + React Testing Library
- [x] Configure test environment
- [x] Write component tests (Button, Input, Card, Modal, Toggle)
- [x] Write hook tests (useAuth)
- [x] Write utility tests (formatters, validators)
- [x] Setup test coverage reporting

#### Integration Tests

- [x] Setup Playwright for E2E testing
- [x] Write authentication flow tests
- [x] Write navigation tests
- [x] Write form submission tests
- [x] Write CRUD operation tests
- [x] Configure CI/CD test pipeline

#### Performance Optimization

- [x] Implement code splitting with React.lazy
- [x] Add route-based lazy loading
- [x] Optimize bundle size
- [x] Add image lazy loading
- [x] Implement memoization for expensive computations
- [x] Add performance monitoring
- [x] Configure Vite build optimization

#### SEO Optimization

- [x] Add react-helmet-async for meta tags
- [x] Implement dynamic page titles
- [x] Add meta descriptions
- [x] Add Open Graph tags
- [x] Add Twitter Card tags
- [x] Implement structured data (JSON-LD)
- [x] Add canonical URLs
- [x] Configure robots.txt
- [x] Add sitemap.xml

---

### Phase 11: Internationalization (i18n)

#### Setup

- [ ] Setup react-i18next
- [ ] Configure i18n with English as default language
- [ ] Create Myanmar translations
- [ ] Create English translations

#### Components

- [ ] Add Language Switcher component
- [ ] Update Navigation with Language Switcher
- [ ] Update Header component

#### Content

- [ ] Update mock data with Myanmar webtoon titles/descriptions
- [ ] Translate all UI text to Myanmar
- [ ] Translate all page titles and descriptions

#### Notes

> **Important:** Unlike the main WebPad website where default language is Myanmar, the Admin Dashboard uses **English as default language** because:
>
> - Admin users typically have technical backgrounds
> - English is more common in technical/administrative contexts
> - However, UI text and mock data should still support Myanmar language

---

### Phase 12: Deployment

- [ ] Production build optimization
- [ ] Environment configuration
- [ ] Vercel deployment
- [ ] Domain configuration
- [ ] SSL certificate setup
- [ ] Monitoring setup

---

## Future Enhancements

### Advanced Features

- [ ] Real-time notifications
- [ ] Advanced analytics with date range picker
- [ ] Export functionality (CSV, PDF)
- [ ] Bulk operations for webtoons/episodes
- [ ] Activity logs viewer

---

## Project Locations

| Project        | Path                                                                  |
| -------------- | --------------------------------------------------------------------- |
| WebPad Website | `C:\Users\keych\Development\Projects\Personal\webpad`                 |
| WebPad Admin   | `C:\Users\keych\Development\Projects\Personal\webpad-admin-dashboard` |
| WebPad Backend | `C:\Users\keych\Development\Projects\Personal\webpad-backend`         |

---

## Last Updated

**Date:** 2026-04-27
**Status:** Phase 9 Features Complete - All Admin Dashboard Features Implemented
