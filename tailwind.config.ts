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
          bg: '#ffffff',
          card: '#f8fafc',
          accent: '#020617',
          'accent-dim': '#475569',
          border: '#e2e8f0',
        }
      },
      backgroundImage: {
        'navy-gradient': 'linear-gradient(to right, #020617, #475569, #020617)',
        'navy-card-gradient': 'linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)',
      }
    },
  },
  plugins: [],
};
export default config;

