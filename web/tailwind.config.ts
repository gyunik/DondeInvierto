import type { Config } from "tailwindcss";

export default {
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
          dark: '#050911',
          card: '#0A121F',
          border: '#162338',
          muted: '#94A3B8'
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
