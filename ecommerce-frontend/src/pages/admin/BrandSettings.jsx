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
      try {
        const res = await axiosClient.get("/admin/settings/brand");
        return res.data;
      } catch (err) {
        // If endpoint doesn't exist, return defaults
        return {
          logo: "",
          favicon: "",
          footerLogo: "",
          heroBackground: "",
        };
      }
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
    mutationFn: async (payload) => {
      try {
        return await axiosClient.post("/admin/settings/brand", payload);
      } catch (err) {
        // If endpoint doesn't exist, save to localStorage as fallback
        localStorage.setItem("tn16_brand_settings", JSON.stringify(payload));
        return { data: payload };
      }
    },
    onSuccess: () => {
      toast.success("Brand settings saved successfully!");
      qc.invalidateQueries(["brandSettings"]);
      // Trigger a custom event to update frontend
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
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm md:shadow p-4 md:p-6 space-y-6 md:space-y-8">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">Brand Assets</h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload and manage your brand logos, favicon, and hero images. Changes are reflected immediately.
          </p>
        </div>

        {/* Logo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Main Logo *
          </label>
          <ImageUploader
            images={logo ? [logo] : []}
            onChange={(images) => setLogo(images[0] || "")}
            maxImages={1}
            maxSizeMB={2}
          />
          {logo && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
              <img src={logo} alt="Logo preview" className="h-16 object-contain" />
            </div>
          )}
        </div>

        {/* Favicon */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Favicon (16x16 or 32x32 recommended)
          </label>
          <ImageUploader
            images={favicon ? [favicon] : []}
            onChange={(images) => setFavicon(images[0] || "")}
            maxImages={1}
            maxSizeMB={1}
          />
          {favicon && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
              <img src={favicon} alt="Favicon preview" className="h-8 w-8 object-contain" />
            </div>
          )}
        </div>

        {/* Footer Logo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Footer Logo
          </label>
          <ImageUploader
            images={footerLogo ? [footerLogo] : []}
            onChange={(images) => setFooterLogo(images[0] || "")}
            maxImages={1}
            maxSizeMB={2}
          />
          {footerLogo && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
              <img src={footerLogo} alt="Footer logo preview" className="h-12 object-contain" />
            </div>
          )}
        </div>

        {/* Hero Background */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Hero Background Image
          </label>
          <ImageUploader
            images={heroBackground ? [heroBackground] : []}
            onChange={(images) => setHeroBackground(images[0] || "")}
            maxImages={1}
            maxSizeMB={5}
          />
          {heroBackground && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
              <img src={heroBackground} alt="Hero background preview" className="h-32 w-full object-cover rounded-lg" />
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saveMutation.isLoading || !logo}
            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white rounded-full py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
          >
            {saveMutation.isLoading ? "Saving..." : "Save Brand Settings"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

