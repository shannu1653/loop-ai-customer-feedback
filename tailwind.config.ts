import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#6d5dfc',
          700: '#5b4beb',
          800: '#4c3ec7',
          900: '#3f33a5',
          950: '#231d5c',
        },
        ink: {
          DEFAULT: '#17152b',
          light: '#242044',
          dark: '#0f0d1d',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8f9fc',
          elevated: '#ffffff',
          dark: '#17152b',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(16, 24, 40, 0.04)',
        sm: '0 1px 3px 0 rgba(16, 24, 40, 0.06), 0 1px 2px 0 rgba(16, 24, 40, 0.04)',
        card: '0 1px 3px 0 rgba(16, 24, 40, 0.05), 0 1px 2px -1px rgba(16, 24, 40, 0.04)',
        'card-hover': '0 10px 25px -4px rgba(23, 21, 43, 0.08), 0 4px 10px -2px rgba(23, 21, 43, 0.04)',
        soft: '0 12px 36px -4px rgba(23, 21, 43, 0.08), 0 4px 12px -2px rgba(23, 21, 43, 0.03)',
        dropdown: '0 12px 32px 0 rgba(16, 24, 40, 0.12), 0 4px 8px 0 rgba(16, 24, 40, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;