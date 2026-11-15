/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-space': '#05060A',
        'surface-solid': '#0A0A0A',
        'stellar-blue': '#4A90E2',
        'solar-gold': '#FFB347',
        'exoplanet-green': '#00FF88',
        'text-primary': '#E8ECF1',
        'text-secondary': '#8B949E',
        'text-tertiary': '#6B7280',
        'cosmic-dark': '#05060A',
        'nebula-purple': '#8B5CF6',
        'background': '#05060A',
        'surface': 'rgba(5, 6, 10, 0.98)',
      },
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
        'mono': ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}