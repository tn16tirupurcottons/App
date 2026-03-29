import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AdminLayout from "../../admin/components/AdminLayout";
import AdminImageField from "../../components/admin/AdminImageField";
import { useToast } from "../../components/Toast";
import axiosClient from "../../api/axiosClient";

export default function ImageManagement() {
  const toast = useToast();
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["adminAppImages"],
    queryFn: async () => {
      const res = await axiosClient.get("/admin/app-images");
      return res.data?.items || [];
    },
  });

  const filtered = useMemo(() => {
    const items = data || [];
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (row) =>
        String(row.key || "")
          .toLowerCase()
          .includes(s) ||
        String(row.label || "")
          .toLowerCase()
          .includes(s) ||
        String(row.description || "")
          .toLowerCase()
          .includes(s)
    );
  }, [data, q]);

  const updateMutation = useMutation({
    mutationFn: async ({ key, image_url }) => {
      const enc = encodeURIComponent(key);
      return axiosClient.put(`/admin/app-images/${enc}`, { image_url });
    },
    onSuccess: () => {
      toast.success("Image updated — storefront will refresh automatically");
      qc.invalidateQueries({ queryKey: ["adminAppImages"] });
      window.dispatchEvent(new Event("app-images-updated"));
    },
    onError: (err) => toast.error(err.response?.data?.message || "Update failed"),
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
          onClick={() => {
            qc.invalidateQueries({ queryKey: ["adminAppImages"] });
            window.dispatchEvent(new Event("app-images-updated"));
            toast.success("Refreshed");
          }}
          className="rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
        >
          Refresh list
        </button>
      }
    >
      <div className="space-y-8 max-w-5xl">
        <p className="text-sm text-neutral-600 leading-relaxed">
          Each slot has a stable <strong>key</strong> (shown on the card). Updates apply to the live storefront within
          seconds (polling + instant event). Product photos remain per-SKU in{" "}
          <Link to="/admin/products" className="font-semibold text-neutral-900 underline underline-offset-2">
            Products
          </Link>
          . CMS hero slides:{" "}
          <Link to="/admin/banners" className="font-semibold text-neutral-900 underline underline-offset-2">
            Banners
          </Link>
          .
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <label className="text-sm font-semibold text-neutral-800 shrink-0">Search by key / label / description</label>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. HOME_EDITORIAL or category"
            className="w-full max-w-md rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-200"
          />
          <span className="text-xs text-neutral-500">{filtered.length} match(es)</span>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {filtered.map((row) => (
            <article key={row.key} className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6 shadow-sm space-y-3">
              <div className="flex flex-wrap gap-2 items-baseline justify-between gap-y-1">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Key</p>
                  <code className="text-sm font-mono text-neutral-900 break-all">{row.key}</code>
                </div>
                <p className="text-xs text-neutral-500">
                  Updated{" "}
                  {row.updatedAt
                    ? new Date(row.updatedAt).toLocaleString()
                    : row.updated_at
                      ? new Date(row.updated_at).toLocaleString()
                      : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{row.label}</p>
                {row.description ? <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{row.description}</p> : null}
              </div>
              <AdminImageField
                label="Image URL / upload"
                value={row.image_url || row.imageUrl || ""}
                onChange={(url) => updateMutation.mutate({ key: row.key, image_url: url })}
                previewClassName="max-h-72"
              />
            </article>
          ))}
        </div>

        {!filtered.length && (
          <p className="text-sm text-neutral-500">No images match your search.</p>
        )}
      </div>
    </AdminLayout>
  );
}
