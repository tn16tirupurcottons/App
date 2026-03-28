import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AdminLayout from "../../admin/components/AdminLayout";
import AdminImageField from "../../components/admin/AdminImageField";
import { useToast } from "../../components/Toast";
import axiosClient from "../../api/axiosClient";
import { normalizeImageAssets } from "../../utils/imageAssetsConfig";
import { DEFAULT_IMAGE_ASSETS } from "../../config/imageAssets.defaults";

export default function ImageManagement() {
  const toast = useToast();
  const qc = useQueryClient();
  const [assets, setAssets] = useState(DEFAULT_IMAGE_ASSETS);
  const [themeTokensBase, setThemeTokensBase] = useState({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["brandSettings"],
    queryFn: async () => {
      const res = await axiosClient.get("/admin/settings/brand");
      return res.data.settings || {};
    },
  });

  useEffect(() => {
    if (!settings) return;
    const tokens = settings.themeTokens && typeof settings.themeTokens === "object" ? settings.themeTokens : {};
    setThemeTokensBase(tokens);
    setAssets(normalizeImageAssets(tokens.imageAssets));
  }, [settings]);

  const updateHome = (key, url) => {
    setAssets((prev) => ({ ...prev, home: { ...prev.home, [key]: url } }));
  };

  const updateCategory = (key, url) => {
    setAssets((prev) => ({ ...prev, categories: { ...prev.categories, [key]: url } }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const nextTokens = { ...themeTokensBase, imageAssets: assets };
      return axiosClient.post("/admin/settings/brand", { themeTokens: nextTokens });
    },
    onSuccess: () => {
      toast.success("Image settings saved");
      qc.invalidateQueries({ queryKey: ["brandSettings"] });
      window.dispatchEvent(new Event("brand-settings-updated"));
    },
    onError: (err) => toast.error(err.response?.data?.message || "Save failed"),
  });

  if (isLoading) {
    return (
      <AdminLayout title="Image management">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-neutral-100 rounded-xl" />
          <div className="h-32 bg-neutral-100 rounded-xl" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Image management"
      actions={
        <button
          type="button"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="bg-neutral-900 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-neutral-800 disabled:opacity-50"
        >
          {saveMutation.isPending ? "Saving…" : "Save all images"}
        </button>
      }
    >
      <div className="space-y-10 max-w-4xl">
        <p className="text-sm text-neutral-600 leading-relaxed">
          Control storefront images stored in brand <code className="text-xs bg-neutral-100 px-1 rounded">themeTokens.imageAssets</code>.
          Product photos are managed per product in{" "}
          <Link to="/admin/products" className="font-semibold text-neutral-900 underline underline-offset-2">
            Products
          </Link>{" "}
          (upload or URL). Hero slides from CMS remain under{" "}
          <Link to="/admin/banners" className="font-semibold text-neutral-900 underline underline-offset-2">
            Banners
          </Link>
          — these URLs override fallbacks when set.
        </p>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-200 pb-2">Home page</h2>
          <AdminImageField label="Hero banner (fallback when no banners)" value={assets.home.hero} onChange={(u) => updateHome("hero", u)} />
          <AdminImageField label="Promo strip 1" value={assets.home.promo1} onChange={(u) => updateHome("promo1", u)} />
          <AdminImageField label="Promo strip 2" value={assets.home.promo2} onChange={(u) => updateHome("promo2", u)} />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-200 pb-2">Category banners</h2>
          <p className="text-xs text-neutral-500">Used on catalog segment pages and category grid when set.</p>
          <AdminImageField label="Men" value={assets.categories.men} onChange={(u) => updateCategory("men", u)} />
          <AdminImageField label="Women" value={assets.categories.women} onChange={(u) => updateCategory("women", u)} />
          <AdminImageField label="Kids" value={assets.categories.kids} onChange={(u) => updateCategory("kids", u)} />
          <AdminImageField label="Accessories" value={assets.categories.accessories} onChange={(u) => updateCategory("accessories", u)} />
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-2">Product images</h2>
          <p className="text-sm text-neutral-600 mb-4">
            Add or edit images per SKU with upload and optional URL fields on create/edit product forms.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/create-product"
              className="inline-flex rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-semibold hover:bg-neutral-800"
            >
              New product
            </Link>
            <Link to="/admin/products" className="inline-flex rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50">
              All products
            </Link>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
