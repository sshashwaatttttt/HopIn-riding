/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bbd: {
          yellow: '#FACC15',
          gold: '#EAB308',
          darkYellow: '#CA8A04',
          navy: '#0F172A',
          purple: '#7C3AED',
          accent: '#EC4899',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'drive': 'drive 12s linear infinite',
      },
      keyframes: {
        drive: {
          '0%': { transform: 'translateX(-20%)' },
          '100%': { transform: 'translateX(120%)' },
        }
      }
    },
  },
  plugins: [],
}
