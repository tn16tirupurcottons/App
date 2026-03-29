import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axiosClient from "../api/axiosClient";
import { APP_IMAGE_DEFAULTS, withCacheBust } from "../config/appImageDefaults";

const AppImagesContext = createContext({
  getImage: () => "",
  refresh: async () => {},
  loading: true,
  bust: 0,
  map: {},
});

export function AppImagesProvider({ children }) {
  const [map, setMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [bust, setBust] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await axiosClient.get("/images");
      const items = res.data?.items || [];
      const next = {};
      items.forEach((row) => {
        const k = row.key;
        const u = row.image_url;
        if (k && u && String(u).trim()) next[k] = String(u).trim();
      });
      setMap(next);
      setBust((b) => b + 1);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("App images unavailable, using defaults:", err?.message || err);
      }
      setMap({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 20000);
    const onEvt = () => load();
    window.addEventListener("app-images-updated", onEvt);
    return () => {
      clearInterval(id);
      window.removeEventListener("app-images-updated", onEvt);
    };
  }, [load]);

  const getImage = useCallback(
    (key) => {
      if (!key) return withCacheBust(APP_IMAGE_DEFAULTS.GLOBAL_FALLBACK_IMAGE, bust);
      const fromApi = map[key];
      if (fromApi && String(fromApi).trim()) {
        return withCacheBust(fromApi, bust);
      }
      const d = APP_IMAGE_DEFAULTS[key];
      if (d && String(d).trim()) {
        return withCacheBust(d, bust);
      }
      const g = map.GLOBAL_FALLBACK_IMAGE || APP_IMAGE_DEFAULTS.GLOBAL_FALLBACK_IMAGE;
      return withCacheBust(g, bust);
    },
    [map, bust]
  );

  const value = useMemo(
    () => ({
      getImage,
      refresh: load,
      loading,
      bust,
      map,
    }),
    [getImage, load, loading, bust, map]
  );

  return <AppImagesContext.Provider value={value}>{children}</AppImagesContext.Provider>;
}

export function useAppImages() {
  return useContext(AppImagesContext);
}
