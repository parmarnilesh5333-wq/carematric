/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#040711',
          900: '#070B19',
          800: '#0B1124',
          700: '#111932',
          600: '#182342',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#0a192f',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        mint: {
          50: '#f4fbf9',
          100: '#e6f7f3',
          200: '#cceee7',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', '"Noto Sans Devanagari"', '"Noto Sans Gujarati"', '"Noto Sans Arabic"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'clinical': '0 1px 3px 0 rgba(0, 0, 0, 0.25), 0 4px 16px -2px rgba(124, 58, 237, 0.08)',
        'clinical-lg': '0 8px 30px -4px rgba(0, 0, 0, 0.5), 0 0 24px -4px rgba(139, 92, 246, 0.18)',
        'glow-violet': '0 0 25px -3px rgba(139, 92, 246, 0.35)',
        'glow-cyan': '0 0 25px -3px rgba(6, 182, 212, 0.3)',
      }
    },
  },
  plugins: [],
};
