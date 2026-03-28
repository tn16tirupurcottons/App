/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#171717",
        secondary: "#404040",
        accent: "#737373",
        dark: "#171717",
        light: "#f4f4f5",
        muted: "#6b7280",
        border: "rgba(15,23,42,0.1)",
      },
      fontFamily: {
        display: ['"Bebas Neue"', "Impact", "sans-serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px rgba(15, 23, 42, 0.06)",
        medium: "0 12px 40px rgba(15, 23, 42, 0.08)",
        large: "0 24px 64px rgba(15, 23, 42, 0.1)",
        glow: "0 0 40px rgba(15, 23, 42, 0.06)",
      },
      letterSpacing: {
        wide: "0.1em",
        display: "0.04em",
      },
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
