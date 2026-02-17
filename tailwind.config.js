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
      colors: {
        'header-bg': '#121212',
        'bg-base': '#0D0D0F',
        'surface': '#1C1C1C',
        'surface-hover': '#252525',
        'border-panel': '#2A2A2A',
        'border-card': '#2A2A2A',
        'text-primary': '#E1E1E1',
        'text-secondary': '#8E8E93',
        'accent-blue': '#0A84FF',
        'accent-blue-dim': '#406B94',
        'accent-green': '#00FF95',
        'accent-red': '#FF453A',
        'accent-orange': '#FF9F0A',
        'accent-purple': '#BF5AF2',
        'brand-mint': '#00FF95',
        'brand-flame': '#FF5500',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
};
