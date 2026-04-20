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
        navy: {
          bg: '#020617',
          card: '#0f172a',
          accent: '#ffffff',
          'accent-dim': '#94a3b8',
          border: '#1e293b',
        }
      },
      backgroundImage: {
        'navy-gradient': 'linear-gradient(to right, #ffffff, #94a3b8, #ffffff)',
        'navy-card-gradient': 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
      }
    },
  },
  plugins: [],
};
export default config;

