import type { Config } from "tailwindcss";

const config: Config = {
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
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        navy: {
          bg: "#ffffff",
          card: "#f8fafc",
          text: "#0f172a",
          muted: "#64748b",
          accent: "#2563eb",
          border: "#e2e8f0"
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ['Outfit', 'var(--font-sans)'],
        mono: ['JetBrains Mono', 'var(--font-mono)'],
      },
    },
  },
  plugins: [],
};
export default config;
