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
        midnight: "var(--midnight)",
        pitch: "var(--pitch)",
        "pitch-dark": "var(--pitch-dark)",
        gold: "var(--gold)",
        "gold-bright": "var(--gold-bright)",
        roast: "var(--roast)",
        "accent-red": "var(--accent-red)",
        "wc-navy": "var(--wc-navy)",
        "wc-red": "var(--wc-red)",
        "wc-green": "var(--wc-green)",
        "wc-white": "var(--wc-white)",
        "wc-black": "var(--wc-black)",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer-text 4s ease-in-out infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
        "confetti-float": "confetti-float 4s ease-in-out infinite",
      },
      keyframes: {
        "shimmer-text": {
          "0%, 100%": { backgroundPosition: "0% center" },
          "50%": { backgroundPosition: "100% center" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "confetti-float": {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.6" },
          "50%": { transform: "translateY(-6px)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
