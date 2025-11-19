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
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm md:shadow p-4 md:p-6">
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Brand Settings">
      <div className="bg-graphite/80 border border-white/10 rounded-3xl p-4 md:p-6 space-y-6 md:space-y-8 text-white">
        <div className="border-b border-white/10 pb-4">
          <h2 className="text-lg font-semibold">Brand Assets</h2>
          <p className="text-sm text-white/60 mt-1">
            Upload and manage your brand logos, favicon, and hero images. Changes are reflected immediately.
          </p>
        </div>

        {/* Logo */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-3">
            Main Logo *
          </label>
          <ImageUploader
            images={logo ? [logo] : []}
            onChange={(images) => setLogo(images[0] || "")}
            maxImages={1}
            maxSizeMB={2}
          />
          {logo && (
            <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs text-white/50 mb-2">Preview:</p>
              <img src={logo} alt="Logo preview" className="h-16 object-contain" />
            </div>
          )}
        </div>

        {/* Favicon */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-3">
            Favicon (16x16 or 32x32 recommended)
          </label>
          <ImageUploader
            images={favicon ? [favicon] : []}
            onChange={(images) => setFavicon(images[0] || "")}
            maxImages={1}
            maxSizeMB={1}
          />
          {favicon && (
            <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs text-white/50 mb-2">Preview:</p>
              <img src={favicon} alt="Favicon preview" className="h-8 w-8 object-contain" />
            </div>
          )}
        </div>

        {/* Footer Logo */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-3">
            Footer Logo
          </label>
          <ImageUploader
            images={footerLogo ? [footerLogo] : []}
            onChange={(images) => setFooterLogo(images[0] || "")}
            maxImages={1}
            maxSizeMB={2}
          />
          {footerLogo && (
            <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs text-white/50 mb-2">Preview:</p>
              <img src={footerLogo} alt="Footer logo preview" className="h-12 object-contain" />
            </div>
          )}
        </div>

        {/* Hero Background */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-3">
            Hero Background Image
          </label>
          <ImageUploader
            images={heroBackground ? [heroBackground] : []}
            onChange={(images) => setHeroBackground(images[0] || "")}
            maxImages={1}
            maxSizeMB={5}
          />
          {heroBackground && (
            <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs text-white/50 mb-2">Preview:</p>
              <img src={heroBackground} alt="Hero background preview" className="h-32 w-full object-cover rounded-lg" />
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button
            onClick={handleSave}
            disabled={saveMutation.isLoading || !logo}
            className="flex-1 bg-white text-ink rounded-full py-3 font-semibold tracking-[0.3em] uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saveMutation.isLoading ? "Saving..." : "Save Brand Settings"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

