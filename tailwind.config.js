/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-krub)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        krub: ['var(--font-krub)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        theme: {
          'bg-primary': 'rgb(var(--bg-primary) / <alpha-value>)',
          'bg-secondary': 'rgb(var(--bg-secondary) / <alpha-value>)',
          'bg-tertiary': 'rgb(var(--bg-tertiary) / <alpha-value>)',
          'bg-elevated': 'rgb(var(--bg-elevated) / <alpha-value>)',
          'bg-overlay': 'rgb(var(--bg-overlay) / <alpha-value>)',
          'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
          'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
          'text-tertiary': 'rgb(var(--text-tertiary) / <alpha-value>)',
          'text-muted': 'rgb(var(--text-muted) / <alpha-value>)',
          'border-primary': 'rgb(var(--border-primary) / <alpha-value>)',
          'border-secondary': 'rgb(var(--border-secondary) / <alpha-value>)',
          'interactive-hover': 'rgb(var(--interactive-hover) / <alpha-value>)',
          'interactive-active': 'rgb(var(--interactive-active) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}