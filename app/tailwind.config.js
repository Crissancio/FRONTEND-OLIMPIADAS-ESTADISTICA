/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#9333ea',
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },

      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },

      boxShadow: {
        soft: '0 4px 20px rgba(0,0,0,0.08)',
      },
    },
  },

  plugins: [],
}