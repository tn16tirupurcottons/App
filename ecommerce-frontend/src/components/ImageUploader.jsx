import React, { useState, useCallback } from "react";
import { Upload, X, GripVertical, Star, Image as ImageIcon } from "lucide-react";
import axiosClient from "../api/axiosClient";
import { useToast } from "./Toast";

export default function ImageUploader({
  images = [],
  onChange,
  maxImages = 10,
  maxSizeMB = 5,
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
}) {
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const toast = useToast();

  const validateFile = (file) => {
    if (!acceptedTypes.includes(file.type)) {
      toast.error(`Invalid file type. Allowed: ${acceptedTypes.join(", ")}`);
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }
    return true;
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axiosClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
      throw err;
    }
  };

  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(validateFile);

    if (validFiles.length === 0) return;
    if (images.length + validFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = validFiles.map(uploadFile);
      const urls = await Promise.all(uploadPromises);
      onChange([...images, ...urls]);
      toast.success(`${urls.length} image(s) uploaded successfully`);
    } catch (err) {
      // Error already handled by toast in uploadFile
      if (import.meta.env.DEV) {
        console.error("Upload error:", err);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files);
      }
    },
    [images]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    toast.info("Image removed");
  };

  const setPrimary = (index) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[0], newImages[index]] = [newImages[index], newImages[0]];
    onChange(newImages);
    toast.success("Primary image updated");
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOverItem = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    onChange(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition
          ${uploading ? "border-pink-500 bg-pink-50" : "border-gray-300 hover:border-pink-400 hover:bg-gray-50"}
        `}
      >
        <input
          type="file"
          id="image-upload"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading || images.length >= maxImages}
        />
        <label
          htmlFor="image-upload"
          className={`cursor-pointer flex flex-col items-center gap-3 ${
            uploading || images.length >= maxImages ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent" />
              <p className="text-sm font-semibold text-gray-700">Uploading...</p>
            </>
          ) : (
            <>
              <Upload size={32} className="text-gray-400" />
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Drag & drop images here or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {images.length}/{maxImages} images • Max {maxSizeMB}MB each
                </p>
              </div>
            </>
          )}
        </label>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">
            Product Images ({images.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOverItem(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative group rounded-xl overflow-hidden border-2 transition
                  ${index === 0 ? "border-pink-500 ring-2 ring-pink-200" : "border-gray-200"}
                  ${draggedIndex === index ? "opacity-50" : ""}
                `}
              >
                <img
                  src={url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x300?text=Image+Error";
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPrimary(index)}
                    className={`p-2 rounded-full ${
                      index === 0
                        ? "bg-pink-600 text-white"
                        : "bg-white/90 text-gray-700 hover:bg-white"
                    } opacity-0 group-hover:opacity-100 transition`}
                    title={index === 0 ? "Primary image" : "Set as primary"}
                  >
                    {index === 0 ? <Star size={16} fill="currentColor" /> : <Star size={16} />}
                  </button>
                  <button
                    onClick={() => removeImage(index)}
                    className="p-2 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
                    title="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded">
                    Primary
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <GripVertical size={12} />
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            💡 Drag images to reorder • First image is the primary/thumbnail
          </p>
        </div>
      )}
    </div>
  );
}

