import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#edf4f1",
        surface: "#ffffff",
        border: "#cce3db",
        "border-hi": "#b0d4ca",
        "text-primary": "#062924",
        "text-secondary": "#2d7870",
        "text-muted": "#8ab8b0",
        accent: "#02c39a",
        teal: "#028090",
        verdigris: "#00a896",
        baltic: "#05668d",
        cream: "#f0f3bd",
      },
      fontFamily: {
        ui: ['"Space Grotesk"', "sans-serif"],
        body: ['"DM Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
        lg: "10px",
      },
      maxWidth: {
        page: "1440px",
      },
    },
  },
} satisfies Config;
