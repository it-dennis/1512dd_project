/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        phosphor: {
          DEFAULT: '#39FF7A',
          soft: '#AAFFCC',
          muted: '#1EA758',
        },
        crt: {
          black: '#000000',
          dark: '#031A10',
          ink: '#0A1F15',
        },
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', '"Courier New"', 'monospace'],
        display: ['"Major Mono Display"', '"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
};
