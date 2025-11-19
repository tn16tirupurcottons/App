import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../../admin/components/AdminLayout";
import ImageUploader from "../../components/ImageUploader";
import { useToast } from "../../components/Toast";
import axiosClient from "../../api/axiosClient";

export default function BrandSettings() {
  const toast = useToast();
  const qc = useQueryClient();
  const [logo, setLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [footerLogo, setFooterLogo] = useState("");
  const [heroBackground, setHeroBackground] = useState("");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["brandSettings"],
    queryFn: async () => {
      const res = await axiosClient.get("/admin/settings/brand");
      return res.data.settings || {};
    },
  });

  React.useEffect(() => {
    if (settings) {
      setLogo(settings.logo || "");
      setFavicon(settings.favicon || "");
      setFooterLogo(settings.footerLogo || "");
      setHeroBackground(settings.heroBackground || "");
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
      logo,
      favicon,
      footerLogo,
      heroBackground,
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

  return (
    <AdminLayout 
      title="Brand Settings"
      actions={
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending || !logo}
          className="bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveMutation.isPending ? "Saving..." : "Save Settings"}
        </button>
      }
    >
      <div className="card p-4 md:p-6 space-y-6 md:space-y-8">
        <div className="border-b border-border pb-4">
          <h2 className="text-lg md:text-xl font-semibold text-dark">Brand Assets</h2>
          <p className="text-sm text-muted mt-2">
            Upload and manage your brand logos, favicon, and hero images. Changes are reflected immediately.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Logo */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-3">
              Main Logo <span className="text-red-500">*</span>
            </label>
            <ImageUploader
              images={logo ? [logo] : []}
              onChange={(images) => setLogo(images[0] || "")}
              maxImages={1}
              maxSizeMB={2}
            />
            {logo && (
              <div className="mt-3 p-4 bg-light rounded-xl border border-border">
                <p className="text-xs text-muted mb-2 font-medium">Preview:</p>
                <img src={logo} alt="Logo preview" className="h-16 object-contain" />
              </div>
            )}
          </div>

          {/* Favicon */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-3">
              Favicon <span className="text-xs text-muted">(16x16 or 32x32 recommended)</span>
            </label>
            <ImageUploader
              images={favicon ? [favicon] : []}
              onChange={(images) => setFavicon(images[0] || "")}
              maxImages={1}
              maxSizeMB={1}
            />
            {favicon && (
              <div className="mt-3 p-4 bg-light rounded-xl border border-border">
                <p className="text-xs text-muted mb-2 font-medium">Preview:</p>
                <img src={favicon} alt="Favicon preview" className="h-8 w-8 object-contain" />
              </div>
            )}
          </div>

          {/* Footer Logo */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-3">
              Footer Logo
            </label>
            <ImageUploader
              images={footerLogo ? [footerLogo] : []}
              onChange={(images) => setFooterLogo(images[0] || "")}
              maxImages={1}
              maxSizeMB={2}
            />
            {footerLogo && (
              <div className="mt-3 p-4 bg-light rounded-xl border border-border">
                <p className="text-xs text-muted mb-2 font-medium">Preview:</p>
                <img src={footerLogo} alt="Footer logo preview" className="h-12 object-contain" />
              </div>
            )}
          </div>

          {/* Hero Background */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-3">
              Hero Background Image
            </label>
            <ImageUploader
              images={heroBackground ? [heroBackground] : []}
              onChange={(images) => setHeroBackground(images[0] || "")}
              maxImages={1}
              maxSizeMB={5}
            />
            {heroBackground && (
              <div className="mt-3 p-4 bg-light rounded-xl border border-border">
                <p className="text-xs text-muted mb-2 font-medium">Preview:</p>
                <img src={heroBackground} alt="Hero background preview" className="h-32 w-full object-cover rounded-lg" />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Save Button */}
        <div className="md:hidden pt-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending || !logo}
            className="w-full bg-primary text-white rounded-full py-3 font-semibold tracking-[0.3em] uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition"
          >
            {saveMutation.isPending ? "Saving..." : "Save Brand Settings"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

