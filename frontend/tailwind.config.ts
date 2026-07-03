import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Claude Peach Design System
        peach: {
          50:  "#FFF8F3",
          100: "#FFF0E5",
          200: "#FFD6C2",
          300: "#FFBDA0",
          400: "#FFA07D",
          500: "#FF8C42",
          600: "#F07030",
          700: "#C8561E",
          800: "#9E3E0E",
          900: "#6B2800",
        },
        coral: {
          400: "#FF7B5E",
          500: "#FF5C3E",
          600: "#E84A2C",
        },
        sand: {
          50:  "#FDFAF6",
          100: "#FAF4EC",
          200: "#F2E5D3",
          300: "#E8D0B8",
          400: "#D4B896",
        },
        // Keep brand for accent links
        brand: {
          50:  "#FFF8F3",
          100: "#FFE8D6",
          200: "#FFCBA8",
          300: "#FFA870",
          400: "#FF8C42",
          500: "#F07030",
          600: "#C8561E",
          700: "#9E3E0E",
          800: "#6B2800",
          900: "#3D1600",
        },
        saffron: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
        // Semantic
        surface: {
          DEFAULT: "rgba(255,255,255,0.65)",
          solid: "#FFFFFF",
          muted: "rgba(255,255,255,0.40)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      lineHeight: {
        relaxed: "1.75",
        loose: "2",
      },
      backdropBlur: {
        xs: "2px",
        sm: "6px",
        md: "12px",
        lg: "20px",
      },
      backgroundImage: {
        "peach-radial":
          "radial-gradient(ellipse 120% 80% at 50% -10%, #FFD6C2 0%, #FFF0E5 45%, #FFF8F3 100%)",
        "peach-mesh":
          "radial-gradient(at 20% 20%, #FFD6C2 0%, transparent 50%), radial-gradient(at 80% 80%, #FFBDA0 0%, transparent 50%), linear-gradient(135deg, #FFF0E5 0%, #FFF8F3 100%)",
        "coral-gradient": "linear-gradient(135deg, #FF8C42 0%, #FF5C3E 100%)",
        "amber-gradient": "linear-gradient(135deg, #FFA07D 0%, #FF8C42 100%)",
      },
      boxShadow: {
        glass: "0 4px 24px rgba(255,140,66,0.10), 0 1px 4px rgba(0,0,0,0.04)",
        "glass-lg": "0 8px 40px rgba(255,140,66,0.14), 0 2px 8px rgba(0,0,0,0.06)",
        peach: "0 4px 20px rgba(255,140,66,0.25)",
        "peach-lg": "0 8px 40px rgba(255,140,66,0.35)",
      },
      animation: {
        shimmer: "shimmer 1.8s infinite linear",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16,1,0.3,1)",
        pulse: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,140,66,0.4)" },
          "50%": { boxShadow: "0 0 0 6px rgba(255,140,66,0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
