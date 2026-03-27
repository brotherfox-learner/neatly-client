import type { Config } from 'tailwindcss'

/** Minimal config so tooling (e.g. shadcn-vue CLI) detects Tailwind; v4 styles come from @tailwindcss/vite + CSS. */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
} satisfies Config
