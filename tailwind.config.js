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
        chess: {
          bg: '#161512',
          boardDark: '#769656',
          boardLight: '#eeeed2',
          panel: '#21201d',
          panelLight: '#2b2a26',
          panelBorder: '#3b3a36',
          accent: '#81b64c',
          accentHover: '#98cc62',
          woodDark: '#b58863',
          woodLight: '#f0d9b5',
          gold: '#e69a28',
          red: '#c33b32',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}


