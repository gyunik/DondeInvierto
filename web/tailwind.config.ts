import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          emerald: '#00F5A0',
          neon: '#10B981',
          mint: '#00FF88',
          cyan: '#00E5FF',
          dark: '#050911',
          bg: '#070B12',
          card: '#0D1424',
          surface: '#111B30',
          border: '#1E2D4A',
          borderLight: '#2A3F66',
          muted: '#94A3B8'
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
