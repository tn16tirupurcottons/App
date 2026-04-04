import React, { useState, useCallback, useEffect, useRef } from "react";
import Cropper from "react-easy-crop";
import { Maximize2, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { useToast } from "./Toast";

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getRadianAngle = (degreeValue) => (degreeValue * Math.PI) / 180;

const rotateSize = (width, height, rotation) => {
  const rotRad = getRadianAngle(rotation);
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx || !pixelCrop) {
    throw new Error("Cannot crop image: invalid context or crop area");
  }

  const rotRad = getRadianAngle(rotation);
  const { width: rotWidth, height: rotHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = pixelCrop.width;
  outputCanvas.height = pixelCrop.height;
  outputCanvas.getContext("2d").putImageData(data, 0, 0);

  return new Promise((resolve, reject) => {
    outputCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      const fileUrl = URL.createObjectURL(blob);
      resolve({ fileUrl, blob });
    }, "image/png");
  });
}

export default function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  title = "Crop Image",
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const toast = useToast();
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const trapFocus = (event) => {
      if (!modalRef.current || !modalRef.current.contains(event.target)) return;

      if (event.key === "Tab") {
        const focusable = modalRef.current.querySelectorAll(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", trapFocus);
    return () => window.removeEventListener("keydown", trapFocus);
  }, [onCancel]);

  const handleCropAreaChange = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImage = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) {
      toast.error("Please adjust the crop area");
      return;
    }

    setIsCropping(true);
    try {
      const { fileUrl, blob } = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onCropComplete(fileUrl, blob);
      setIsCropping(false);
    } catch (err) {
      console.error("Crop error:", err);
      toast.error(err?.message || "Failed to crop image");
      setIsCropping(false);
    }
  }, [imageSrc, croppedAreaPixels, rotation, onCropComplete, toast]);

  return (
<div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Image cropper">
      <div ref={modalRef} className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Maximize2 size={20} />
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onCancel}
            aria-label="Close crop modal"
            className="text-white/60 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative bg-neutral-100 h-[400px] w-full overflow-hidden flex-shrink-0">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={(croppedArea, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
          />
        </div>

        {/* Controls */}
        <div className="overflow-y-auto px-6 py-4 space-y-4 min-h-0">
          <div className="max-h-[calc(90vh-520px)] overflow-y-auto">
          {/* Zoom Control */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-900">
              <div className="flex items-center gap-2 mb-2">
                <ZoomIn size={16} />
                Zoom (scroll to zoom)
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-neutral-500 mt-1">
                {(zoom * 100).toFixed(0)}%
              </span>
            </label>
          </div>

          {/* Rotation Control */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-900">
              <div className="flex items-center gap-2 mb-2">
                <RotateCw size={16} />
                Rotation
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-neutral-500 mt-1">
                {rotation}°
              </span>
            </label>
          </div>

          {/* Instructions */}
          <p className="text-xs text-neutral-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
            💡 <strong>Tip:</strong> Drag to move the image, use the zoom slider or scroll wheel
            to zoom in/out, and adjust rotation as needed.
          </p>
        </div>
      </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 flex gap-3 justify-end z-20">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 border-2 border-neutral-300 text-neutral-900 font-semibold rounded-lg hover:bg-neutral-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={getCroppedImage}
            disabled={isCropping}
            className="px-6 py-2.5 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition"
          >
            {isCropping ? "Cropping..." : "Save Crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
