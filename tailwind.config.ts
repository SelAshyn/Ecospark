import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: '#1B7D4F',
          dark: '#066839',
          light: '#0F5132',
        },
        accent: {
          DEFAULT: '#18392B',
          dark: '#212224',
        },
        ecospark: {
          'spring': '#1B7D4F',
          'dartmouth': '#066839',
          'castleton': '#0F5132',
          'forest': '#18392B',
          'eerie': '#212224',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
