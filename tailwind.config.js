/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      /* Vintage Vibes Color Palette */
      colors: {
        /* Native Wine - Primary brand color */
        wine: {
          DEFAULT: '#4F243E',
          50: '#E8DFE4',
          100: '#D4C5CD',
          200: '#B896AA',
          300: '#9A6A85',
          400: '#7A4A63',
          500: '#4F243E',
          600: '#3A1A2E',
          700: '#2B1322',
          800: '#1C0C16',
          900: '#0D060B',
        },
        /* Flat Red - CTAs, alerts */
        flatred: {
          DEFAULT: '#CA423B',
          50: '#FCEEEC',
          100: '#F5DEDE',
          200: '#EBBAB7',
          300: '#E19590',
          400: '#D76F68',
          500: '#CA423B',
          600: '#A33630',
          700: '#8B2820',
          800: '#5C1A15',
          900: '#2E0D0B',
        },
        /* Pandora - Secondary accents */
        pandora: {
          DEFAULT: '#E68342',
          50: '#FCF0E8',
          100: '#F5D7C3',
          200: '#F0A56B',
          300: '#EB9456',
          400: '#E68342',
          500: '#D67630',
          600: '#C96E2A',
          700: '#A65A22',
          800: '#7D4419',
          900: '#532D11',
        },
        /* Champagne Brown - Light backgrounds */
        champagne: {
          DEFAULT: '#E9C593',
          50: '#FDFBF7',
          100: '#F5EDD8',
          200: '#F0D9B4',
          300: '#E9C593',
          400: '#D4B07D',
          500: '#C19B67',
          600: '#A68352',
          700: '#8A6B41',
          800: '#6E5433',
          900: '#523D26',
        },
        /* Pumpkin Seed - Neutral accents */
        sage: {
          DEFAULT: '#A2A77E',
          50: '#F4F5F0',
          100: '#E8E9DD',
          200: '#C4C8A8',
          300: '#B3B893',
          400: '#A2A77E',
          500: '#8C9168',
          600: '#7F8364',
          700: '#656950',
          800: '#4C4F3C',
          900: '#333528',
        },
        /* Classic Blue-green - Success */
        teal: {
          DEFAULT: '#3C9C9A',
          50: '#F0FEFE',
          100: '#E8F5F4',
          200: '#D4EFED',
          300: '#A8DCDA',
          400: '#6BB9B7',
          500: '#3C9C9A',
          600: '#2A8C8A',
          700: '#2A6B6A',
          800: '#1F504F',
          900: '#153635',
        },
      },

      /* Font Family */
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },

      /* Font Size with Line Heights */
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },

      /* Border Radius */
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },

      /* Shadows with Wine undertones */
      boxShadow: {
        'xs': '0 1px 2px rgba(79, 36, 62, 0.05)',
        'sm': '0 1px 3px rgba(79, 36, 62, 0.08), 0 1px 2px rgba(79, 36, 62, 0.06)',
        'md': '0 4px 6px -1px rgba(79, 36, 62, 0.08), 0 2px 4px -1px rgba(79, 36, 62, 0.04)',
        'lg': '0 10px 15px -3px rgba(79, 36, 62, 0.08), 0 4px 6px -2px rgba(79, 36, 62, 0.04)',
        'xl': '0 20px 25px -5px rgba(79, 36, 62, 0.1), 0 10px 10px -5px rgba(79, 36, 62, 0.04)',
        '2xl': '0 25px 50px -12px rgba(79, 36, 62, 0.25)',
        'inner': 'inset 0 2px 4px rgba(79, 36, 62, 0.06)',
        'focus': '0 0 0 3px rgba(202, 66, 59, 0.25)',
        'focus-success': '0 0 0 3px rgba(60, 156, 154, 0.25)',
      },

      /* Spacing - 4px base */
      spacing: {
        '0.5': '0.125rem',
        '1.5': '0.375rem',
        '2.5': '0.625rem',
        '3.5': '0.875rem',
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },

      /* Transitions */
      transitionDuration: {
        'fast': '100ms',
        'base': '150ms',
        'slow': '300ms',
        'slower': '500ms',
      },

      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      /* Z-Index Scale */
      zIndex: {
        'dropdown': '10',
        'sticky': '20',
        'fixed': '30',
        'modal-backdrop': '40',
        'modal': '50',
        'popover': '60',
        'tooltip': '70',
        'toast': '80',
      },

      /* Animation keyframes */
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'success-flash': {
          '0%': { backgroundColor: 'var(--color-teal)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },

      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'fade-out': 'fade-out 150ms ease-out',
        'slide-in-right': 'slide-in-right 300ms ease-out',
        'slide-out-right': 'slide-out-right 300ms ease-out',
        'slide-in-up': 'slide-in-up 300ms ease-out',
        'scale-in': 'scale-in 150ms ease-out',
        'shimmer': 'shimmer 2s infinite linear',
        'success-flash': 'success-flash 500ms ease-out',
      },
    },
  },
  plugins: [],
}
