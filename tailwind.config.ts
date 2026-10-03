import type { Config } from "tailwindcss";

const config: Config = {
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
        surface: "var(--surface)",
        "surface-card": "var(--surface-card)",
        "surface-border": "var(--surface-border)",
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "var(--brand-primary)",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          DEFAULT: "var(--brand-primary)",
          hover: "var(--brand-hover)",
          glow: "var(--brand-glow)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "Montserrat", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      keyframes: {
        pulseFlame: {
          "0%, 100%": { transform: "scale(1)", filter: "drop-shadow(0 0 8px rgba(249, 115, 22, 0.6))" },
          "50%": { transform: "scale(1.12)", filter: "drop-shadow(0 0 16px rgba(249, 115, 22, 0.9))" },
        },
        celebratePr: {
          "0%": { transform: "scale(0.8) rotate(-5deg)", opacity: "0" },
          "50%": { transform: "scale(1.1) rotate(3deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "flame-pulse": "pulseFlame 1.8s ease-in-out infinite",
        "pr-celebrate": "celebratePr 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
