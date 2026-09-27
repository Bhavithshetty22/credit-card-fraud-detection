/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1B1F2A',
        paper: '#FAF9F6',
        surface: '#F0EEE8',
        line: '#DAD6CC',
        muted: '#6B6558',
        safe: '#1F7A5C',
        caution: '#B8792A',
        danger: '#B23A2E',
        accent: '#2F4B7C',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
