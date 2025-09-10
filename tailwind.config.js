/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pixel-black': '#0a0a0a',
        'pixel-white': '#f8f8f8',
        'pixel-gray': '#2d2d2d',
        'pixel-light-gray': '#6a6a6a',
        'contra-gold': '#ffd700',
        'contra-green': '#00ff00',
        'power-up-blue': '#00bfff',
      },
      fontFamily: {
        'pixel': ['Courier New', 'monospace'],
      },
      animation: {
        'pixel-blink': 'pixel-blink 1s infinite',
        'pixel-glow': 'pixel-glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pixel-blink': {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        'pixel-glow': {
          '0%': { boxShadow: '0 0 5px #ffd700' },
          '100%': { boxShadow: '0 0 20px #ffd700, 0 0 30px #ffd700' },
        },
      },
    },
  },
  plugins: [],
}