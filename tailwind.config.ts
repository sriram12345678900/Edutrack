import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Forces Tailwind to use the "dark" class on HTML instead of OS preferences
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#4F46E5",
          dark: "#4338CA",
          light: "#818CF8",
        },
        secondary: {
          DEFAULT: "#10B981",
          dark: "#059669",
        },
        "slate-450": "#7e8d9f",
        "slate-505": "#607086",
        "slate-555": "#54647a",
        "slate-650": "#404f65",
        "slate-655": "#3c495c",
        "slate-750": "#2e3949",
        "slate-855": "#1c2431",
        "slate-955": "#0d121c",
        "indigo-505": "#5c4fe5",
        "indigo-650": "#4338ca",
        "indigo-955": "#1e1b4b",
        "emerald-450": "#22c595",
        "emerald-650": "#059669",
        "purple-650": "#8438db",
        "purple-750": "#6d20be",
        "amber-450": "#fbbf24",
        "amber-505": "#eab308",
        "amber-555": "#ca8a04",
        "amber-650": "#b45309",
        "blue-650": "#1d4ed8",
        "rose-450": "#fb6080",
        "rose-955": "#500b1a",
        "fuchsia-505": "#d946ef",
      },
      spacing: {
        "4.5": "1.125rem", // 18px
        "5.5": "1.375rem", // 22px
        "6.5": "1.625rem", // 26px
        "9.5": "2.375rem", // 38px
        "13": "3.25rem",   // 52px
        "22": "5.5rem",    // 88px
        "66": "16.5rem",   // 264px
      },
      fontSize: {
        "2.5xl": ["1.625rem", { lineHeight: "2.125rem" }], // 26px
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out 4s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
