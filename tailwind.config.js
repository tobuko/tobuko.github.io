/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0f1117",
          surface: "#0b0d11",
          border: "rgba(255,255,255,0.08)",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
        display: ["Syne", "sans-serif"],
      },
    },
  },
  plugins: [],
};
