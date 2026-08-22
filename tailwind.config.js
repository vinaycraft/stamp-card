/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cafe: {
          cream: '#F5F0E8',
          beige: '#E8DFD0',
          brown: '#8B7355',
          dark: '#4A3728',
          gold: '#C9A962',
          light: '#F9F7F2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

