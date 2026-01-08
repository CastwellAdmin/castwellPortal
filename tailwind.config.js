/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Castwell Gold - Primary brand color
        primary: {
          50: '#fdfbf7',
          100: '#faf6eb',
          200: '#f5ecd3',
          300: '#ede0b3',
          400: '#e3cd85',
          500: '#D4AF37', // Main Castwell Gold
          600: '#b8932a',
          700: '#987722',
          800: '#7a5e1f',
          900: '#614b1b',
        },
        // Castwell Gray - Secondary brand color
        secondary: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6B7280', // Main Castwell Gray
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      }
    },
  },
  plugins: [],
}
