# WebPad Admin - Project Rules

## Development Rules

### 1. CSS Rules (IMPORTANT!)

#### ⛔ STRICTLY FORBIDDEN

- **NEVER use inline CSS** - `style={{ color: 'red' }}` is FORBIDDEN
- **NEVER use inline style tags** - `<style>...</style>` is FORBIDDEN
- **NEVER use hex color codes directly** - Use Tailwind classes instead
- **NEVER create separate CSS files** - Only `global.css` is allowed

#### ✅ REQUIRED APPROACH

- Use **Tailwind CSS classes only** for all styling
- Use **`global.css`** (located in project root) for:
  - Custom CSS classes using `@layer components`
  - Custom animations using `@keyframes`
  - CSS variables for theme colors
  - Global base styles

#### Example: Correct vs Incorrect

```tsx
// ❌ WRONG - Inline CSS
<button style={{ backgroundColor: '#9333EA', padding: '8px 16px' }}>
  Click me
</button>

// ❌ WRONG - Hex color in className
<button className="bg-[#9333EA] px-4 py-2">
  Click me
</button>

// ✅ CORRECT - Tailwind classes only
<button className="bg-primary-600 px-4 py-2 rounded-full">
  Click me
</button>

// ✅ CORRECT - Using global.css custom class
<button className="btn-primary">
  Click me
</button>
```

#### Tailwind Class Order

Follow this order when writing Tailwind classes:

1. **Layout** - `flex`, `grid`, `block`, `hidden`
2. **Positioning** - `relative`, `absolute`, `fixed`
3. **Spacing** - `p-*`, `m-*`, `gap-*`
4. **Sizing** - `w-*`, `h-*`, `min-*`, `max-*`
5. **Typography** - `text-*`, `font-*`, `leading-*`
6. **Visual** - `bg-*`, `border-*`, `rounded-*`, `shadow-*`
7. **Interactivity** - `hover:*`, `focus:*`, `transition-*`

---

### 2. TypeScript Rules

- Use strict TypeScript configuration
- Define types in `src/types/` directory
- Use interfaces for object shapes
- Use type aliases for unions/primitives
- Avoid `any` type - use `unknown` when type is uncertain

#### Component Rules

- One component per file
- Component name must match file name
- Use PascalCase for component names
- Export components as default
- Use named exports for utilities

---

### 3. Project Architecture

#### Modular Component Structure

```
src/components/ComponentName/
├── ComponentName.tsx        # UI/UX (Dumb Component)
├── index.ts                  # Export
└── types.ts                  # Component-specific types (if needed)
```

#### Smart Logic Separation

- **UI (Dumb):** Component `.tsx` files contain only UI/UX
- **Logic (Smart):** Extract to `src/hooks/` for reusability
- **API/Functions:** Place in `src/utils/`

#### Directory Structure

| Directory         | Purpose                           |
| ----------------- | --------------------------------- |
| `src/components/` | Modular UI components             |
| `src/hooks/`      | Custom React hooks (Smart logic)  |
| `src/utils/`      | API calls, formatters, validators |
| `src/types/`      | TypeScript type definitions       |
| `src/pages/`      | Page components                   |
| `src/layouts/`    | Layout components                 |
| `src/context/`    | React Context providers           |
| `src/services/`   | API service functions             |
| `src/constants/`  | Constants and configurations      |
| `src/assets/`     | Static assets                     |
| `src/demo/mocks/` | Mock data for testing             |

#### Global CSS Location

- `global.css` is located in **PROJECT ROOT** (not in `src/`)
- Import in `src/main.tsx`: `import '../global.css'`

---

### 4. Git Rules

#### Commit Messages

- Use conventional commits format
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code refactoring
- `style:` for styling changes
- `docs:` for documentation
- `test:` for tests
- `chore:` for maintenance

#### Gitignore

- Always update `.gitignore` before pushing
- Never commit:
  - `node_modules/`
  - `.env` files
  - `dist/` or `build/`
  - `.DS_Store`
  - IDE settings
  - Log files

#### Push Workflow

1. Run `npm run lint` check
2. Run `npm run format` format
3. Update `CHANGELOG.md`
4. Update `LAST_SESSION.md`
5. Commit with proper message
6. Push to remote

---

### 5. ESLint & Prettier Rules

#### ESLint

- Run `npm run lint` before committing
- Fix all linting errors before pushing
- No `console.log` in production code (use logger)

#### Prettier

- Run `npm run format` before committing
- Use project `.prettierrc` configuration
- Format on save in IDE

---

### 6. Agent Rules (CRITICAL!)

#### Mind Your Own Business Rule

- **NEVER** modify existing, working UI/UX code
- **NEVER** modify existing, working Logic code
- **NEVER** modify existing, working Functions
- **ONLY** modify what you were asked to change
- Respect other agents' work

#### Change Documentation

- Always update `CHANGELOG.md` after changes
- Always update `LAST_SESSION.md` after session
- Document what was changed, why, and by whom

#### Before Making Changes

1. Read `LAST_SESSION.md` to understand context
2. Read `CHANGELOG.md` to see recent changes
3. Only modify the specific task requested
4. Update documentation after completion

---

### 7. Accessibility Rules

- All interactive elements must be keyboard accessible
- Use semantic HTML elements
- Include alt text for images
- Use ARIA labels when necessary
- Maintain color contrast ratios
- Support screen readers

---

### 8. Performance Rules

- Use lazy loading for images
- Use code splitting for routes
- Minimize bundle size
- Optimize images before upload
- Use memoization when appropriate
- Avoid unnecessary re-renders

---

### 9. Security Rules

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate all user inputs
- Sanitize user-generated content
- Use HTTPS for all API calls
- Implement rate limiting

---

### 10. Documentation Rules

- Update `README.md` for project setup changes
- Update `PROJECT_PLAN.md` for feature changes
- Update `CHANGELOG.md` for all changes
- Update `LAST_SESSION.md` after each session
- Comment complex logic (in English)
- Use JSDoc for function documentation

---

### 11. Icon Rules (Lucide Icons)

#### ⛔ STRICTLY FORBIDDEN

- **NEVER use other icon libraries** - Only Lucide Icons allowed
- **NEVER use emoji as icons** - Use proper icon components
- **NEVER use image files for icons** - Use Lucide components

#### ✅ REQUIRED APPROACH

- Import icons from `lucide-react`
- Use `size` prop for sizing
- Use `className` for colors with Tailwind classes

#### Import Pattern

```tsx
import { IconName } from 'lucide-react'
```

#### Standard Sizes

| Size        | Usage                               |
| ----------- | ----------------------------------- |
| `size={16}` | Small icons (inline, badges)        |
| `size={18}` | Default size for most UI            |
| `size={20}` | Medium icons (buttons, nav)         |
| `size={24}` | Large icons (headers, empty states) |
| `size={32}` | Extra large (hero sections)         |

#### Color Usage

```tsx
<IconName className="text-gray-500" />
<IconName className="text-primary-600" />
<IconName className="text-red-500" />
```

#### Common Icons Reference

| Icon                           | Usage                  |
| ------------------------------ | ---------------------- |
| `Menu`, `X`                    | Navigation toggle      |
| `Search`                       | Search inputs          |
| `Plus`, `Minus`                | Add/remove actions     |
| `Edit`, `Trash2`               | Edit/delete actions    |
| `ChevronDown`, `ChevronUp`     | Dropdowns, accordions  |
| `ArrowLeft`, `ArrowRight`      | Navigation, pagination |
| `Check`, `XCircle`             | Status indicators      |
| `AlertCircle`, `AlertTriangle` | Warnings, errors       |
| `Info`                         | Information            |
| `Eye`, `EyeOff`                | Show/hide password     |
| `Calendar`, `Clock`            | Date/time              |
| `User`, `Users`                | User-related           |
| `Settings`                     | Settings               |
| `LogOut`                       | Logout                 |
| `Home`, `Dashboard`            | Dashboard              |
| `FileText`, `BookOpen`         | Content-related        |
| `Image`, `Upload`              | Media-related          |
| `Filter`, `Sliders`            | Filtering              |
| `Download`, `Share2`           | Actions                |

---

### 12. Animation Rules (Framer Motion)

#### ⛔ STRICTLY FORBIDDEN

- **NEVER use CSS animations for complex animations** - Use Framer Motion
- **NEVER use other animation libraries** - Only Framer Motion allowed
- **NEVER animate layout properties heavily** - Avoid animating `width`, `height`

#### ✅ REQUIRED APPROACH

- Import from `framer-motion`
- Keep animations subtle and performant
- Use `motion` components for animated elements
- Use `AnimatePresence` for enter/exit animations

#### Import Pattern

```tsx
import { motion, AnimatePresence } from 'framer-motion'
```

#### Standard Animation Variants

```tsx
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}
```

#### Standard Duration

| Duration         | Usage                            |
| ---------------- | -------------------------------- |
| `duration: 0.15` | Fast (hover, micro-interactions) |
| `duration: 0.2`  | Default for most animations      |
| `duration: 0.3`  | Medium (modals, dropdowns)       |
| `duration: 0.5`  | Slow (page transitions)          |

#### Common Patterns

**Modal Animation:**

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )}
</AnimatePresence>
```

**List Item Animation:**

```tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
  {item}
</motion.div>
```

**Staggered List:**

```tsx
<motion.div
  initial="initial"
  animate="animate"
  variants={{
    animate: { transition: { staggerChildren: 0.05 } },
  }}
>
  {items.map((item, i) => (
    <motion.div
      key={i}
      variants={{
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

#### Performance Tips

- Use `layout` prop for automatic layout animations
- Use `layoutId` for shared element transitions
- Avoid animating expensive properties like `box-shadow`
- Use `will-change` CSS property sparingly

---

## Quick Reference

### Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm run preview      # Preview production build
```

### File Naming Conventions

| Type       | Convention                  | Example            |
| ---------- | --------------------------- | ------------------ |
| Components | PascalCase                  | `Button.tsx`       |
| Hooks      | camelCase with `use` prefix | `useAuth.ts`       |
| Utils      | camelCase                   | `formatters.ts`    |
| Types      | PascalCase                  | `User.ts`          |
| Constants  | SCREAMING_SNAKE_CASE        | `API_ENDPOINTS.ts` |
| CSS        | lowercase                   | `global.css`       |

### Icon Quick Reference

```tsx
import { Menu, X, Search, Plus, Edit, Trash2, ChevronDown } from 'lucide-react'

<Menu size={20} className="text-gray-500" />
<Search size={18} className="text-primary-600" />
```

### Animation Quick Reference

```tsx
import { motion, AnimatePresence } from 'framer-motion'

;<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
/>
```

---

## Last Updated

**Date:** 2026-04-27
