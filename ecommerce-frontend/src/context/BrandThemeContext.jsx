import React, { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const defaultTheme = {
  primaryColor: "#1d4ed8",
  secondaryColor: "#9333ea",
  accentColor: "#f97316",
  backgroundColor: "#ffffff",
  surfaceColor: "#f5f5f5",
  textColor: "#111827",
  headingFont: '"Playfair Display", serif',
  bodyFont: '"Inter", system-ui, sans-serif',
  // Luxury default header - light background with luxury black text
  headerBackground:
    "linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #f1f3f5 100%)",
  headerTextColor: "#0a0a0a", // Luxury black
  headerPrimaryText: "TN16 · Luxury Cotton Studio",
  headerSecondaryText: "Worldwide shipping · curated edits",
  footerBackground: "#f8fafc",
  footerTextColor: "#111827",
  containerRadius: "24px",
};

// Fast Refresh compatible: context creation
const BrandThemeContext = createContext({
  theme: defaultTheme,
  refreshTheme: () => {},
});

const applyThemeToDocument = (theme) => {
  const root = document.documentElement;
  root.style.setProperty("--color-primary", theme.primaryColor);
  root.style.setProperty("--color-secondary", theme.secondaryColor);
  root.style.setProperty("--color-accent", theme.accentColor);
  root.style.setProperty("--background-color", theme.backgroundColor);
  root.style.setProperty("--surface-color", theme.surfaceColor);
  root.style.setProperty("--text-color", theme.textColor);
  root.style.setProperty("--heading-font", theme.headingFont);
  root.style.setProperty("--body-font", theme.bodyFont);
  root.style.setProperty("--header-background", theme.headerBackground);
  root.style.setProperty("--header-text-color", theme.headerTextColor);
  root.style.setProperty("--header-primary-text", theme.headerPrimaryText);
  root.style.setProperty("--header-secondary-text", theme.headerSecondaryText);
  root.style.setProperty("--footer-background", theme.footerBackground);
  root.style.setProperty("--footer-text-color", theme.footerTextColor);
  root.style.setProperty("--container-radius", theme.containerRadius);
};

// Fast Refresh compatible: component export
const BrandThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);
  const [loading, setLoading] = useState(false);

  const fetchTheme = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/theme/active");
      const incoming = res.data?.settings || {};
      const merged = { ...defaultTheme, ...incoming };
      setTheme(merged);
      applyThemeToDocument(merged);
    } catch (err) {
      // Only log in development
      if (import.meta.env.DEV) {
        console.warn("Failed to load brand theme", err);
      }
      applyThemeToDocument(defaultTheme);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
    const handler = () => fetchTheme();
    window.addEventListener("brand-settings-updated", handler);
    return () => window.removeEventListener("brand-settings-updated", handler);
  }, []);

  return (
    <BrandThemeContext.Provider
      value={{ theme, refreshTheme: fetchTheme, loading }}
    >
      {children}
    </BrandThemeContext.Provider>
  );
};

// Hook for consuming the theme context
function useBrandTheme() {
  return useContext(BrandThemeContext);
}

// Named exports
export { BrandThemeProvider, useBrandTheme };
// Default export
export default BrandThemeProvider;

