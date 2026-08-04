/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0E1626',
          light: '#16213A',
          hover: '#1E2C4A'
        },
        surface: '#FFFFFF',
        canvas: '#F3F5F9',
        ink: '#101828',
        muted: '#5B6472',
        line: '#E4E7EE',
        accent: {
          DEFAULT: '#2F6FED',
          dark: '#1E52C2'
        },
        amber: '#F5A623',
        good: '#16A34A',
        warn: '#DC2626'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    }
  },
  plugins: []
};
