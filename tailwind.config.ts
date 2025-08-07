// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  // УДАЛЯЕМ darkMode: 'class'
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Оставляем только цвета для светлой темы
      colors: {
        'primary': '#F5E6E8',
        'secondary': '#E8D5C4',
        'accent': '#D7C0AE',
        'main-text': '#3C3333',
        'main-bg': '#FFFFFF',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography'),
  ],
}
export default config