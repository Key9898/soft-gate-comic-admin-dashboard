/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './global.css', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
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
