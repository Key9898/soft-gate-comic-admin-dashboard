/** @type {import('tailwindcss').Config} */
export default {
  // Do not list global.css here — @apply in that file + content scan can race.
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic surfaces — values come from html.light / html.dark CSS variables.
        // Do not pair these with dark:* ; switching html class swaps the vars.
        // Nested DEFAULT form so border-line / text-fg resolve reliably under @apply.
        canvas: 'var(--sg-canvas)',
        surface: {
          DEFAULT: 'var(--sg-surface)',
          muted: 'var(--sg-surface-muted)',
        },
        fg: {
          DEFAULT: 'var(--sg-text)',
          secondary: 'var(--sg-text-secondary)',
          muted: 'var(--sg-text-muted)',
        },
        line: {
          DEFAULT: 'var(--sg-border)',
          strong: 'var(--sg-border-strong)',
        },
        'sg-hover': 'var(--sg-hover)',
        'nav-active': 'var(--sg-nav-active-bg)',
        'nav-active-fg': 'var(--sg-nav-active-fg)',
        'nav-active-bar': 'var(--sg-nav-active-bar)',
        // Primary = logo "SOFT GATE" letter fill (teal/cyan). Anchor: #64c8c8 at 400.
        primary: {
          50: '#F0FDFD',
          100: '#CCFBFA',
          200: '#99F6F3',
          300: '#5EEAE6',
          400: '#64C8C8',
          500: '#2DB4B4',
          600: '#0E9494',
          700: '#0F7676',
          800: '#115E5E',
          900: '#134E4E',
          950: '#042D2D',
        },
        // Burst = logo magenta starburst. Named "burst" (not "accent") to avoid
        // clashing with Tailwind's built-in accent-color (`accent-*`) utilities.
        burst: {
          50: '#FFF1F5',
          100: '#FFE0EA',
          500: '#FA326E',
          600: '#E63264',
          700: '#BE2850',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
