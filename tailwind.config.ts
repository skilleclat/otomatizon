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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#f4f8f6",
          100: "#e5f0ea",
          200: "#cce1d6",
          300: "#a3cbb6",
          400: "#72ae91",
          500: "#499170",
          600: "#367458",
          700: "#2d5d47",
          800: "#264a3a",
          900: "#1f3c30",
          950: "#0f211a",
        },
        obsidian: {
          950: "#08080b",
          900: "#0e0e13",
          850: "#14141b",
          800: "#1a1a23",
          700: "#262633",
          600: "#363647",
        },
        accent: {
          emerald: "#10b981",
          gold: "#d4af37",
          amber: "#f59e0b",
          cyan: "#06b6d4",
          rose: "#f43f5e",
        },
        surface: {
          subtle: "rgba(255, 255, 255, 0.03)",
          card: "rgba(255, 255, 255, 0.05)",
          hover: "rgba(255, 255, 255, 0.08)",
          border: "rgba(255, 255, 255, 0.08)",
          borderLight: "rgba(255, 255, 255, 0.15)",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-outfit)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
