/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'mandarin-red': '#E53935',
        'mandarin-gold': '#FFB300',
        'safe-green': '#4CAF50',
        'warning-orange': '#FF9800',
        'danger-red': '#F44336',
      }
    },
  },
  plugins: [],
}
