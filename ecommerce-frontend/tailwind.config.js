/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#36c1f8ff",
        secondary: "#7c3aed",
        accent: "#f59e0b",
        dark: "#1f2937",
        light: "#cc1616ff",
        muted: "#3a3439ff",
        border: "#e5e7eb",
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.08)",
        medium: "0 4px 16px rgba(0, 0, 0, 0.12)",
        large: "0 8px 24px rgba(0, 0, 0, 0.16)",
      },
      letterSpacing: {
        wide: "0.1em",
      },

      // ADD THIS ↓↓↓
      container: {
        center: false,
        padding: "0rem",
        screens: {
          sm: "100%",
          md: "100%",
          lg: "100%",
          xl: "100%",
          "2xl": "100%",
        },
      },
    },
  },
  plugins: [],
};
