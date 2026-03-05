/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        luxury: {
          gold: '#D4AF37',
          obsidian: '#0B0C10',
          cream: '#FAF9F6',
        }
      },
      borderRadius: {
        luxury: '2rem',
      },
    },
  },
  plugins: [],
};