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
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        navy: {
          bg: '#020617',
          card: '#0f172a',
          accent: '#3b82f6', // Bright Blue
          'accent-dim': '#1e3a8a',
          border: '#1e293b',
        },
        brand: {
          green: '#10b981',
          blue: '#3b82f6',
        }
      },
      backgroundImage: {
        'navy-gradient': 'linear-gradient(to right, #020617, #0f172a, #020617)',
        'navy-card-gradient': 'linear-gradient(145deg, #0f172a 0%, #020617 100%)',
      }
    },
  },
  plugins: [],
};
export default config;
