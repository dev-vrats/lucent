import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        primary: "#0C3D48",
        secondary: "#A4BF9D",
        "bg-base": "#071A1F",
        "bg-surface": "#0F2E36",
        "text-primary": "#EAF3F0",
        "text-secondary": "#93AFA8",
        "text-muted": "#5E7A76",
        "glow-a": "#0145F2",
        "glow-b": "#EDF15F",
        "score-high": "#A4BF9D",
        "score-mid": "#E8C468",
        "score-low": "#D97878",
        "border-glass": "rgba(164, 191, 157, 0.14)",
      },
      backgroundImage: {
        "glass": "linear-gradient(135deg, rgba(15, 46, 54, 0.55), rgba(15, 46, 54, 0.35))",
      },
      borderRadius: {
        "bento": "28px",
      },
      boxShadow: {
        "glow-sm": "0 0 20px rgba(1, 69, 242, 0.15)",
        "glow-md": "0 0 40px rgba(1, 69, 242, 0.2)",
        "card": "0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)",
        "card-hover": "0 16px 48px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        "drift": "drift 22s ease-in-out infinite alternate",
        "count-up": "count-up 1s ease-out forwards",
        "scan": "scan 1.2s ease-out forwards",
        "shimmer": "shimmer 2s infinite",
        "fade-up": "fadeUp 0.5s ease-out forwards",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(40px, 30px) scale(1.08)" },
          "100%": { transform: "translate(-20px, 60px) scale(0.96)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        scan: {
          "0%": { top: "-100%", opacity: "0.8" },
          "100%": { top: "100%", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
