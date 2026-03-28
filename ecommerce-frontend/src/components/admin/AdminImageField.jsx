import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { useToast } from "../Toast";
import SafeImage from "../SafeImage";

/**
 * Admin control: upload (→ URL via API) OR paste URL, preview, clear.
 * @param {string} label
 * @param {string} value — image URL
 * @param {(url: string) => void} onChange
 */
export default function AdminImageField({ label, value = "", onChange, previewClassName = "" }) {
  const toast = useToast();
  const [urlInput, setUrlInput] = useState(value || "");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || "");

  useEffect(() => {
    setUrlInput(value || "");
    setPreview(value || "");
  }, [value]);

  const applyUrl = (next) => {
    const trimmed = (next || "").trim();
    setPreview(trimmed);
    onChange(trimmed);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    try {
      const res = await axiosClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedUrl = res.data?.url;
      if (!uploadedUrl) throw new Error("No URL returned");
      setUrlInput(uploadedUrl);
      applyUrl(uploadedUrl);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 md:p-5 space-y-4">
      <p className="text-sm font-semibold text-neutral-900">{label}</p>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-start">
        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-neutral-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors shrink-0">
          {uploading ? "Uploading…" : "Upload image"}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/jpg" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
        <div className="flex-1 min-w-0 space-y-2">
          <span className="text-xs text-neutral-500 block">Or enter image URL</span>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://…"
              className="flex-1 min-w-0 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-300"
            />
            <button
              type="button"
              onClick={() => applyUrl(urlInput)}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:bg-neutral-100 shrink-0"
            >
              Apply URL
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <SafeImage
          src={preview}
          alt={label}
          seed={label}
          className={`w-full h-auto max-h-64 object-cover ${previewClassName}`}
        />
      </div>

      {preview ? (
        <button
          type="button"
          onClick={() => {
            setUrlInput("");
            applyUrl("");
          }}
          className="text-xs font-semibold text-red-600 hover:text-red-800"
        >
          Remove image
        </button>
      ) : null}
    </div>
  );
}
