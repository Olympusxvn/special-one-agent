import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
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
        muted: "var(--text-muted)",
        "muted-foreground": "var(--text-tertiary)",
        border: "var(--border-default)",
        "border-subtle": "var(--border-subtle)",
        surface: "var(--surface)",
        "surface-elevated": "var(--surface-elevated)",
        brand: {
          DEFAULT: "var(--brand-purple)",
          light: "var(--light-purple)",
        },
        accent: {
          DEFAULT: "var(--electric-cyan)",
          blue: "var(--soft-blue)",
        },
        charcoal: "var(--dark-charcoal)",
        separator: "var(--separator)",
        gold: {
          DEFAULT: "var(--gold)",
          soft: "var(--gold-soft)",
          deep: "var(--gold-deep)",
        },
        platinum: "var(--platinum)",
        champagne: "var(--champagne)",
        obsidian: "var(--obsidian)",
        midnight: "var(--midnight)",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      fontSize: {
        caption: ["0.875rem", { lineHeight: "1.21", fontWeight: "400" }],
        body: ["1.125rem", { lineHeight: "1.4", fontWeight: "500" }],
        nav: ["1rem", { lineHeight: "1.5", fontWeight: "400" }],
        h3: ["3.5rem", { lineHeight: "0.95", fontWeight: "450" }],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      maxWidth: {
        walrus: "1440px",
      },
      borderRadius: {
        walrus: "0px",
        pill: "26px",
        input: "4px",
      },
      boxShadow: {
        raised: "rgba(0, 0, 0, 0.1) 0px 4px 6px -4px",
        lifted: "rgba(0, 0, 0, 0.1) 0px 10px 15px -3px",
        elevated:
          "rgba(80, 80, 80, 0.12) 0px 9px 46px 8px, rgba(80, 80, 80, 0.14) 0px 24px 38px 3px",
        deep: "rgb(0, 0, 0) 0px 0px 24px -5px",
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
