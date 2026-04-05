import React, { useState, useRef } from "react";
import { Upload, X, GripVertical, Star, Image as ImageIcon, Crop as CropIcon, Trash2 } from "lucide-react";
import axiosClient from "../api/axiosClient";
import { useToast } from "./Toast";
import ImageCropper from "./ImageCropper";

export default function EnhancedImageUploader({
  images = [],
  onChange,
  maxImages = 10,
  maxSizeMB = 5,
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
}) {
  const [uploading, setUploading] = useState(false);
  const [croppingImage, setCroppingImage] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState(null);
  const toast = useToast();
  const fileInputRef = useRef(null);

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
      const res = await axiosClient.post("/upload/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!res.data?.data?.url) {
        throw new Error("Unexpected upload response");
      }
      return res.data.data.url;
    } catch (err) {
      console.error("Upload error:", err);
      const message = err.response?.data?.message || err.message || "Upload failed";
      toast.error(message);
      throw err;
    }
  };

  const cleanupPreviewUrl = (url) => {
    try {
      if (url && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.warn("Failed to revoke object URL", err);
    }
  };

  const handleFiles = (files) => {
    const previews = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    const uniquePreviews = previews.filter(
      (preview) => !images.includes(preview.url)
    );

    const usablePreviews = uniquePreviews.slice(
      0,
      Math.max(0, maxImages - images.length)
    );

    if (usablePreviews.length === 0) {
      toast.error(`No new images added. Maximum ${maxImages} images allowed.`);
      return;
    }

    const newUrls = usablePreviews.map((preview) => preview.url);
    onChange([...new Set([...images, ...newUrls])]);

    const firstPreview = usablePreviews[0];
    setCroppingImage(firstPreview.url);
    setPendingFile(firstPreview.file);
    setPendingPreviewUrl(firstPreview.url);
  };

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(validateFile);

    if (validFiles.length === 0) return;
    if (images.length + validFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    handleFiles(validFiles);
  };

  const handleCropComplete = async (croppedUrl, blob) => {
    if (!blob) {
      toast.error("Failed to crop image");
      return;
    }

    setUploading(true);
    try {
      // Create File from blob to upload
      const croppedFile = new File([blob], pendingFile.name, {
        type: "image/png",
      });

      const url = await uploadFile(croppedFile);
      const merged = [...images];
      if (pendingPreviewUrl) {
        const previewIndex = merged.indexOf(pendingPreviewUrl);
        if (previewIndex >= 0) {
          merged[previewIndex] = url;
        } else {
          merged.push(url);
        }
      } else {
        merged.push(url);
      }
      onChange(Array.from(new Set(merged)));
      cleanupPreviewUrl(pendingPreviewUrl);
      toast.success("Image uploaded and cropped successfully");
      setCroppingImage(null);
      setPendingFile(null);
      setPendingPreviewUrl(null);
    } catch {
      toast.error("Failed to upload cropped image");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const removeImage = (index) => {
    const removedUrl = images[index];
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    cleanupPreviewUrl(removedUrl);
    toast.info("Image removed");
  };

  const setPrimary = (index) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[0], newImages[index]] = [newImages[index], newImages[0]];
    onChange(newImages);
    toast.success("Primary image updated");
  };

  const moveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const newImages = [...images];
    [newImages[fromIndex], newImages[toIndex]] = [
      newImages[toIndex],
      newImages[fromIndex],
    ];
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Crop Modal */}
      {croppingImage && (
        <ImageCropper
          imageSrc={croppingImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            cleanupPreviewUrl(pendingPreviewUrl);
            setCroppingImage(null);
            setPendingFile(null);
            setPendingPreviewUrl(null);
          }}
          aspectRatio={1}
          title="Crop Product Image"
        />
      )}

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-neutral-300 rounded-xl p-8 bg-neutral-50 hover:bg-neutral-100 transition text-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading}
        />

        <Upload className="mx-auto mb-3 text-neutral-400" size={32} />
        <h3 className="font-semibold text-neutral-900 mb-1">
          Drag & drop images here
        </h3>
        <p className="text-sm text-neutral-600">
          or click to browse. Images will be cropped before upload.
        </p>
        <p className="text-xs text-neutral-500 mt-2">
          Max {maxImages} images, {maxSizeMB}MB each
        </p>
      </div>

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-neutral-900">
            Images ({images.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((url, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border-2 border-neutral-200 hover:border-neutral-400 transition bg-neutral-100"
              >
                {/* Image */}
                <img
                  src={url}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.png";
                  }}
                />

                {/* Primary Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star size={12} fill="currentColor" />
                    Primary
                  </div>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  {index !== 0 && (
                    <button
                      onClick={() => setPrimary(index)}
                      className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                      title="Set as primary"
                    >
                      <Star size={16} fill="currentColor" />
                    </button>
                  )}
                  <button
                    onClick={() => removeImage(index)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Drag Handle */}
                {images.length > 1 && (
                  <div
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("fromIndex", index);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIndex = Number(e.dataTransfer.getData("fromIndex"));
                      if (fromIndex !== index) {
                        moveImage(fromIndex, index);
                      }
                    }}
                    className="absolute bottom-0 left-0 right-0 bg-neutral-900/50 p-1.5 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition"
                  >
                    <GripVertical size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
            💡 <strong>Tip:</strong> Drag images to reorder, click star icon to set as primary.
            First image will be the product thumbnail.
          </p>
        </div>
      )}

      {/* Status */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <p className="text-sm text-blue-700 font-medium">
            Processing image...
          </p>
        </div>
      )}
    </div>
  );
}
