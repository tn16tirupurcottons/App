import React, { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { normalizeImageAssets } from "../utils/imageAssetsConfig";
import { DEFAULT_IMAGE_ASSETS } from "../config/imageAssets.defaults";

/**
 * Default storefront: light, editorial. Dark API payloads are rejected for shell colors.
 * Valid light payloads from `/theme/active` merge fully; otherwise safe accents + logo only.
 */
export const defaultLightTheme = {
  primaryColor: "#171717",
  secondaryColor: "#404040",
  accentColor: "#737373",
  backgroundColor: "#FFFFFF",
  surfaceColor: "#FFFFFF",
  textColor: "#111111",
  headingFont: '"Bebas Neue", Impact, sans-serif',
  bodyFont: '"DM Sans", system-ui, sans-serif',
  headerBackground: "rgba(255, 255, 255, 0.94)",
  headerTextColor: "#111111",
  headerPrimaryText: "TNEXT",
  headerSecondaryText: "Cotton studio · made in India",
  footerBackground: "#FAFAFA",
  footerTextColor: "#525252",
  containerRadius: "12px",
  logo: null,
  heroBoxBackground:
    "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 55%, rgba(241,245,249,0.9) 100%)",
  heroBoxBorder: "rgba(15, 23, 42, 0.08)",
  heroTextColor: "#0f172a",
  heroTitleShadow: "none",
  heroSubtitleShadow: "none",
};

/** @deprecated use defaultLightTheme */
export const defaultDarkTheme = defaultLightTheme;

function normalizeHex(value) {
  if (typeof value !== "string") return null;
  let v = value.trim();
  if (!v.startsWith("#")) v = `#${v}`;
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return null;
  if (v.length === 4) {
    const r = v[1];
    const g = v[2];
    const b = v[3];
    v = `#${r}${r}${g}${g}${b}${b}`;
  }
  return v.toLowerCase();
}

function relativeLuminance(hex) {
  const n = normalizeHex(hex);
  if (!n) return 1;
  const r = parseInt(n.slice(1, 3), 16) / 255;
  const g = parseInt(n.slice(3, 5), 16) / 255;
  const b = parseInt(n.slice(5, 7), 16) / 255;
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function isReasonableLogoUrl(logo) {
  if (typeof logo !== "string" || logo.length < 8) return false;
  return logo.startsWith("http://") || logo.startsWith("https://") || logo.startsWith("/");
}

function mergeSafeAccentsOnly(base, incoming) {
  const t = { ...base };
  if (isReasonableLogoUrl(incoming.logo)) t.logo = incoming.logo;
  ["primaryColor", "secondaryColor", "accentColor"].forEach((key) => {
    const hex = normalizeHex(incoming[key]);
    if (hex && relativeLuminance(hex) < 0.92) t[key] = hex;
  });
  if (incoming.containerRadius && /^\d+px$/.test(String(incoming.containerRadius).trim())) {
    t.containerRadius = incoming.containerRadius.trim();
  }
  if (typeof incoming.headerPrimaryText === "string" && incoming.headerPrimaryText.length < 80) {
    t.headerPrimaryText = incoming.headerPrimaryText;
  }
  if (typeof incoming.headerSecondaryText === "string" && incoming.headerSecondaryText.length < 120) {
    t.headerSecondaryText = incoming.headerSecondaryText;
  }
  return t;
}

/**
 * Always keeps the light shell (backgrounds, header/footer text colors, hero defaults).
 * `/theme/active` may only contribute: logo, accent hexes, radius, optional header copy strings.
 * Never applies API background, text, or header colors (prevents white-on-white / dark overrides).
 */
export function mergeStorefrontTheme(apiSettings) {
  const base = { ...defaultLightTheme };
  const incoming = apiSettings && typeof apiSettings === "object" ? apiSettings : null;

  if (!incoming) {
    return { theme: base, apiAccepted: false, reason: "no_api", apiValid: false };
  }

  return {
    theme: mergeSafeAccentsOnly(base, incoming),
    apiAccepted: true,
    reason: "forced_light_shell",
    apiValid: false,
  };
}

const defaultImageAssetsNormalized = normalizeImageAssets(DEFAULT_IMAGE_ASSETS);

const BrandThemeContext = createContext({
  theme: defaultLightTheme,
  themeMeta: { apiAccepted: false, reason: "initial", apiValid: false },
  imageAssets: defaultImageAssetsNormalized,
  refreshTheme: () => {},
});

const applyThemeToDocument = (theme) => {
  const root = document.documentElement;
  const muted = relativeLuminance(theme.textColor) > 0.5 ? "#525252" : "#A1A1AA";
  root.style.setProperty("--color-primary", theme.primaryColor);
  root.style.setProperty("--color-secondary", theme.secondaryColor);
  root.style.setProperty("--color-accent", theme.accentColor);
  root.style.setProperty("--background-color", theme.backgroundColor);
  root.style.setProperty("--surface-color", theme.surfaceColor);
  root.style.setProperty("--surface-elevated", theme.surfaceColor);
  root.style.setProperty("--text-color", theme.textColor);
  root.style.setProperty("--text-muted", muted);
  root.style.setProperty("--heading-font", theme.headingFont);
  root.style.setProperty("--body-font", theme.bodyFont);
  root.style.setProperty("--header-background", theme.headerBackground);
  root.style.setProperty("--header-text-color", theme.headerTextColor);
  root.style.setProperty("--header-primary-text", theme.headerPrimaryText);
  root.style.setProperty("--header-secondary-text", theme.headerSecondaryText);
  root.style.setProperty("--footer-background", theme.footerBackground);
  root.style.setProperty("--footer-text-color", theme.footerTextColor);
  root.style.setProperty("--container-radius", theme.containerRadius);
  root.style.setProperty("--hero-box-background", theme.heroBoxBackground);
  root.style.setProperty("--hero-box-border", theme.heroBoxBorder);
  root.style.setProperty("--hero-text-color", theme.heroTextColor);
  root.style.setProperty("--hero-title-shadow", theme.heroTitleShadow);
  root.style.setProperty("--hero-subtitle-shadow", theme.heroSubtitleShadow);
  const isLightBg = relativeLuminance(theme.backgroundColor) > 0.5;
  root.style.setProperty("--border-subtle", isLightBg ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.08)");
  if (theme.logo) {
    root.style.setProperty("--logo-url", `url(${theme.logo})`);
  } else {
    root.style.setProperty("--logo-url", "none");
  }
};

const BrandThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultLightTheme);
  const [themeMeta, setThemeMeta] = useState({ apiAccepted: false, reason: "initial", apiValid: false });
  const [imageAssets, setImageAssets] = useState(defaultImageAssetsNormalized);
  const [loading, setLoading] = useState(false);

  const fetchTheme = async () => {
    setLoading(true);
    applyThemeToDocument(defaultLightTheme);
    try {
      const res = await axiosClient.get("/theme/active");
      const incoming = res.data?.settings || {};
      const { theme: merged, apiAccepted, reason, apiValid } = mergeStorefrontTheme(incoming);
      setTheme(merged);
      setThemeMeta({ apiAccepted, reason, apiValid: Boolean(apiValid) });
      applyThemeToDocument(merged);
      const tokens = incoming.themeTokens && typeof incoming.themeTokens === "object" ? incoming.themeTokens : {};
      setImageAssets(normalizeImageAssets(tokens.imageAssets));
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("Brand theme API unavailable, using default light:", err?.message || err);
      }
      setTheme(defaultLightTheme);
      setThemeMeta({ apiAccepted: false, reason: "network_error", apiValid: false });
      setImageAssets(defaultImageAssetsNormalized);
      applyThemeToDocument(defaultLightTheme);
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
    <BrandThemeContext.Provider value={{ theme, themeMeta, imageAssets, refreshTheme: fetchTheme, loading }}>
      {children}
    </BrandThemeContext.Provider>
  );
};

function useBrandTheme() {
  return useContext(BrandThemeContext);
}

export { BrandThemeProvider, useBrandTheme };
export default BrandThemeProvider;
