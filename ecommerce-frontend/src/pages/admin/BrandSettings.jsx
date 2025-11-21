import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../../admin/components/AdminLayout";
import ImageUploader from "../../components/ImageUploader";
import { useToast } from "../../components/Toast";
import axiosClient from "../../api/axiosClient";

const DEFAULT_THEME = {
  primaryColor: "#1d4ed8",
  secondaryColor: "#9333ea",
  accentColor: "#f97316",
  backgroundColor: "#ffffff",
  surfaceColor: "#f8fafc",
  textColor: "#111827",
  headerBackground: "rgba(255,255,255,0.95)",
  headingFont: '"Playfair Display", serif',
  bodyFont: '"Inter", system-ui, sans-serif',
  containerRadius: "24px",
};

export default function BrandSettings() {
  const toast = useToast();
  const qc = useQueryClient();
  const [assets, setAssets] = useState({
    logo: "",
    favicon: "",
    footerLogo: "",
    heroBackground: "",
  });
  const [theme, setTheme] = useState(DEFAULT_THEME);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["brandSettings"],
    queryFn: async () => {
      const res = await axiosClient.get("/admin/settings/brand");
      return res.data.settings || {};
    },
  });

  React.useEffect(() => {
    if (settings) {
      setAssets((prev) => ({
        ...prev,
        logo: settings.logo || "",
        favicon: settings.favicon || "",
        footerLogo: settings.footerLogo || "",
        heroBackground: settings.heroBackground || "",
      }));
      setTheme((prev) => ({
        ...prev,
        ...Object.keys(DEFAULT_THEME).reduce((acc, key) => {
          acc[key] = settings[key] !== null && settings[key] !== undefined ? settings[key] : DEFAULT_THEME[key];
          return acc;
        }, {}),
      }));
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (payload) =>
      axiosClient.post("/admin/settings/brand", payload),
    onSuccess: () => {
      toast.success("Brand settings saved successfully!");
      qc.invalidateQueries({ queryKey: ["brandSettings"] });
      window.dispatchEvent(new Event("brand-settings-updated"));
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save settings");
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      ...assets,
      ...theme,
    });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Brand Settings">
        <div className="card p-4 md:p-6">
          <div className="space-y-4">
            <div className="h-32 bg-light rounded-xl animate-pulse" />
            <div className="h-32 bg-light rounded-xl animate-pulse" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  const colorFields = [
    { key: "primaryColor", label: "Primary Color" },
    { key: "secondaryColor", label: "Secondary Accent" },
    { key: "accentColor", label: "Highlight Accent" },
    { key: "backgroundColor", label: "Page Background" },
    { key: "surfaceColor", label: "Card Surface" },
    { key: "textColor", label: "Body Text" },
    { key: "headerBackground", label: "Header Background" },
    { key: "headerTextColor", label: "Header Text Color" },
    { key: "footerBackground", label: "Footer Background" },
    { key: "footerTextColor", label: "Footer Text Color" },
  ];

  return (
    <AdminLayout
      title="Brand Settings"
      actions={
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveMutation.isPending ? "Saving..." : "Save Settings"}
        </button>
      }
    >
      <div className="card p-4 md:p-6 space-y-8">
        <section className="space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg md:text-xl font-semibold text-dark">
              Brand Assets
            </h2>
            <p className="text-sm text-muted mt-2">
              Upload brand-owned logos and hero visuals. Files sync to
              Cloudinary and update instantly across the storefront.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: "Main Logo *", key: "logo", max: 2 },
              { label: "Favicon (32x32)", key: "favicon", max: 1 },
              { label: "Footer Logo", key: "footerLogo", max: 2 },
              { label: "Hero Background", key: "heroBackground", max: 5 },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-dark mb-3">
                  {field.label}
                </label>
                <ImageUploader
                  images={assets[field.key] && assets[field.key].trim() ? [assets[field.key]] : []}
                  onChange={(images) =>
                    setAssets((prev) => ({
                      ...prev,
                      [field.key]: images && images.length > 0 ? images[0] : "",
                    }))
                  }
                  maxImages={1}
                  maxSizeMB={field.max}
                />
                {assets[field.key] && (
                  <div className="mt-3 p-3 bg-light rounded-xl border border-border">
                    <p className="text-xs text-muted mb-2 font-medium">
                      Preview
                    </p>
                    <img
                      src={assets[field.key]}
                      alt={`${field.key} preview`}
                      className={`${
                        field.key === "heroBackground"
                          ? "h-32 w-full object-cover rounded-lg"
                          : "h-16 object-contain"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg md:text-xl font-semibold text-dark">
              Global Theme Controls
            </h2>
            <p className="text-sm text-muted mt-2">
              Adjust luxury palette, typography, and spacing tokens. The main
              app updates live without a page refresh.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {colorFields.map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm font-semibold text-dark mb-2 block">
                  {label}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme[key]}
                    onChange={(e) =>
                      setTheme((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="w-14 h-14 rounded-xl border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme[key]}
                    onChange={(e) =>
                      setTheme((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="flex-1 border border-border rounded-full px-4 py-2 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6 border-t border-border pt-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-lg font-semibold text-dark">Header Text Content</h3>
              <p className="text-sm text-muted mt-1">Edit the primary and secondary text displayed in the header</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-dark mb-2 block">
                  Header Primary Text
                </label>
                <input
                  type="text"
                  value={theme.headerPrimaryText || ""}
                  onChange={(e) =>
                    setTheme((prev) => ({ ...prev, headerPrimaryText: e.target.value }))
                  }
                  className="w-full border border-border rounded-full px-4 py-3 text-sm"
                  placeholder="TN16 · Luxury Cotton Studio"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-dark mb-2 block">
                  Header Secondary Text
                </label>
                <input
                  type="text"
                  value={theme.headerSecondaryText || ""}
                  onChange={(e) =>
                    setTheme((prev) => ({ ...prev, headerSecondaryText: e.target.value }))
                  }
                  className="w-full border border-border rounded-full px-4 py-3 text-sm"
                  placeholder="Worldwide shipping · curated edits"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-dark mb-2 block">
                Heading Typeface
              </label>
              <select
                value={theme.headingFont}
                onChange={(e) =>
                  setTheme((prev) => ({ ...prev, headingFont: e.target.value }))
                }
                className="w-full border border-border rounded-full px-4 py-3"
              >
                <option value='"Playfair Display", serif'>
                  Playfair Display
                </option>
                <option value='"Cormorant Garamond", serif'>
                  Cormorant Garamond
                </option>
                <option value='"Marcellus", serif'>Marcellus</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-dark mb-2 block">
                Container Radius
              </label>
              <input
                type="text"
                value={theme.containerRadius}
                onChange={(e) =>
                  setTheme((prev) => ({
                    ...prev,
                    containerRadius: e.target.value,
                  }))
                }
                className="w-full border border-border rounded-full px-4 py-3"
                placeholder="24px"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-dark mb-2 block">
                Body Typeface
              </label>
              <select
                value={theme.bodyFont}
                onChange={(e) =>
                  setTheme((prev) => ({ ...prev, bodyFont: e.target.value }))
                }
                className="w-full border border-border rounded-full px-4 py-3"
              >
                <option value='"Inter", system-ui, sans-serif'>Inter</option>
                <option value='"Sora", sans-serif'>Sora</option>
                <option value='"Manrope", sans-serif'>Manrope</option>
              </select>
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-border p-6 bg-white">
            <p className="text-sm text-muted mb-4">
              Live preview updates as you tweak controls.
            </p>
            <div
              className="rounded-3xl p-6 text-white space-y-3"
              style={{ background: theme.primaryColor }}
            >
              <p className="text-xs uppercase tracking-[0.4em] opacity-80">
                Preview
              </p>
              <h3
                className="text-2xl font-bold"
                style={{ fontFamily: theme.headingFont }}
              >
                Signature Palette
              </h3>
              <p className="text-sm" style={{ fontFamily: theme.bodyFont }}>
                Buttons, headlines, and surfaces inherit these values instantly.
              </p>
            </div>
          </div>
        </section>

        <div className="md:hidden pt-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="w-full bg-primary text-white rounded-full py-3 font-semibold tracking-[0.3em] uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition"
          >
            {saveMutation.isPending ? "Saving..." : "Save Brand Settings"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

