import type { Config } from "tailwindcss";

const config: Config = {
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
        press: "var(--press)",
        "press-card": "var(--press-card)",
        "press-border": "var(--press-border)",
        gold: "var(--gold)",
        roast: "var(--roast)",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
