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
        elastic: {
          blue: "#005571",
          teal: "#00BFB3",
          pink: "#F04E98",
          yellow: "#FEC514",
          green: "#00B3A4",
          orange: "#FF6C02",
          red: "#BD271E",
        },
        dark: {
          900: "#0A0E17",
          800: "#111827",
          700: "#1A2332",
          600: "#243044",
          500: "#2D3B50",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "flow": "flow 2s ease-in-out infinite",
      },
      keyframes: {
        flow: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
