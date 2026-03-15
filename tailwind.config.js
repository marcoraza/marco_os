/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './components/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './*.{ts,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: 'var(--color-border-panel)',
      },
      colors: {
        'header-bg': 'var(--color-bg-header)',
        'bg-base': 'var(--color-bg-base)',
        'surface': 'var(--color-bg-surface)',
        'surface-hover': 'var(--color-bg-surface-hover)',
        'border-panel': 'var(--color-border-panel)',
        'border-card': 'var(--color-border-card)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'accent-blue': 'var(--color-accent-blue)',
        'accent-blue-dim': 'var(--color-accent-blue-dim)',
        'accent-green': 'var(--color-brand-mint)',
        'accent-red': 'var(--color-accent-red)',
        'accent-orange': 'var(--color-accent-orange)',
        'accent-purple': 'var(--color-accent-purple)',
        'brand-mint': 'var(--color-brand-mint)',
        'brand-flame': 'var(--color-brand-flame)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({ strategy: 'class' }),
    require('@tailwindcss/container-queries'),
  ],
};
