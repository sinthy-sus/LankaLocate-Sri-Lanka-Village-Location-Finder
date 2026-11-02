/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#174C3C',
          dark: '#0f3328',
          light: '#1f634f',
        },
        secondary: {
          DEFAULT: '#25866A',
          dark: '#1d6a54',
          light: '#32a886',
        },
        accent: {
          DEFAULT: '#D5AC55',
          dark: '#b8903c',
          light: '#e4c37b',
        },
        surface: {
          bg: '#F7F9F7',
          card: '#FFFFFF',
          muted: '#EEF2EE',
        },
        brandtext: {
          DEFAULT: '#17231E',
          muted: '#52665C',
          light: '#83968C',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(23, 76, 60, 0.06), 0 1px 4px -1px rgba(23, 76, 60, 0.04)',
        'soft': '0 8px 24px -4px rgba(23, 76, 60, 0.08), 0 4px 12px -2px rgba(23, 76, 60, 0.04)',
        'soft-lg': '0 16px 36px -6px rgba(23, 76, 60, 0.12), 0 8px 18px -4px rgba(23, 76, 60, 0.06)',
      }
    },
  },
  plugins: [],
}
