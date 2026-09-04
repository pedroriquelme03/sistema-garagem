import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        patio: {
          ink: "rgb(var(--p-ink) / <alpha-value>)",
          night: "rgb(var(--p-night) / <alpha-value>)",
          paper: "rgb(var(--p-paper) / <alpha-value>)",
          cream: "rgb(var(--p-cream) / <alpha-value>)",
          sand: "rgb(var(--p-sand) / <alpha-value>)",
          mute: "rgb(var(--p-mute) / <alpha-value>)",
          cobalt: "rgb(var(--p-cobalt) / <alpha-value>)",
          deep: "rgb(var(--p-deep) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        loja: ["var(--font-loja)", "system-ui", "sans-serif"],
        display: ["var(--font-loja-display)", "var(--font-loja)", "sans-serif"],
        serif: ["var(--font-loja-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        loja: "0 18px 50px -24px rgba(13, 22, 33, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
