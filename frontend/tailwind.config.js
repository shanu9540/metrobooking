/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        metro: {
          blue: '#1E3A8A', // Dark Blue for branding
          green: '#10B981', // Emerald for Success / Green Line
          red: '#EF4444', // Red Line
          yellow: '#F59E0B', // Yellow Line
          primary: '#0D9488', // Teal for booking theme
          hover: '#0F766E'
        }
      }
    },
  },
  plugins: [],
}
