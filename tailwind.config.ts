import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-open-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
        serif: ["var(--font-open-sans)", "serif"],
        header: ["var(--font-open-sans)", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        secondary: "var(--secondary)",
        'navy-accent': "#000000",
      },
    },
  },
  plugins: [],
};
export default config;
