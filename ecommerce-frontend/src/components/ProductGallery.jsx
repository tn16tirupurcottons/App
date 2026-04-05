import React, { useState, useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, Video, RotateCcw } from "lucide-react";
import { handleImageError, FALLBACK_IMAGES, isValidImageUrl } from "../utils/imageUtils";

const isYouTubeUrl = (url) => /(?:youtu(?:\.be|be\.com)\/.*(?:v=|embed\/)?)([\w-]+)/.test(url);
const getYouTubeEmbedUrl = (url) => {
  const match = url.match(/(?:v=|embed\/|youtu\.be\/)([\w-]+)/);
  if (!match) return null;
  return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`;
};

function SpinViewer({ frames = [], autoplay = true }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isPlaying && frames.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % frames.length);
      }, 90);
      return () => clearInterval(interval);
    }
  }, [isPlaying, frames.length]);

  useEffect(() => {
    setFrameIndex(currentIndex);
  }, [currentIndex]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX || e.touches?.[0]?.clientX || 0);
    setIsPlaying(false);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const x = e.clientX || e.touches?.[0]?.clientX || 0;
    const delta = x - startX;
    const step = Math.sign(delta);
    if (Math.abs(delta) > 12) {
      setStartX(x);
      setFrameIndex((prev) => {
        let next = prev - step;
        if (next < 0) next = frames.length - 1;
        if (next >= frames.length) next = 0;
        return next;
      });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const activeFrame = frames[frameIndex] || "";

  return (
    <div className="relative group border border-neutral-200 rounded-xl overflow-hidden bg-black">
      <img
        src={activeFrame}
        alt={`360° view frame ${frameIndex + 1}`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 z-10 flex items-end justify-between p-3 pointer-events-none">
        <span className="rounded-lg bg-black/60 text-white text-xs px-2 py-1">Frame {frameIndex + 1}/{frames.length}</span>
        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          className="pointer-events-auto bg-white/90 text-neutral-900 rounded-lg px-2 py-1 text-xs font-semibold"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>

      <div
        className="absolute inset-0 cursor-grab"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
    </div>
  );
}

function ZoomImage({ src, alt, onZoomTap }) {
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [fallbackSrc, setFallbackSrc] = useState(null);
  const imageRef = useRef(null);

  useEffect(() => {
    setFallbackSrc(null);
  }, [src]);

  const handleMouseMove = (e) => {
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
    const y = Math.min(Math.max(0, e.clientY - rect.top), rect.height);
    setPosition({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleImageLoad = (e) => {
    setNaturalSize({ width: e.target.naturalWidth, height: e.target.naturalHeight });
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-white" style={{ minHeight: "42vh" }}>
      <img
        ref={imageRef}
        src={fallbackSrc || src || FALLBACK_IMAGES.product}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300 cursor-zoom-in"
        onMouseEnter={() => setIsZoomActive(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsZoomActive(false)}
        onClick={onZoomTap}
        onLoad={handleImageLoad}
        onError={() => setFallbackSrc(FALLBACK_IMAGES.product)}
      />
      <div className="pointer-events-none absolute top-3 right-3 rounded-full bg-white/90 p-2 shadow-sm text-neutral-800">
        <ZoomIn size={16} />
      </div>

      {isZoomActive && naturalSize.width > 0 && (
        <div
          className="absolute top-2 right-2 w-44 h-44 border border-neutral-300 rounded-lg overflow-hidden shadow-xl"
          style={{ zIndex: 20 }}
        >
          <div
            className="w-full h-full bg-no-repeat"
            style={{
              backgroundImage: `url('${fallbackSrc || src}')`,
              backgroundSize: `${naturalSize.width * 2}px ${naturalSize.height * 2}px`,
              backgroundPosition: `${position.x}% ${position.y}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function ProductGallery({
  images = [],
  spinImages = [],
  videoUrl = "",
  productName = "",
  onImageClick,
  selectedIndex: controlledSelectedIndex,
  onSelectedIndexChange,
  showThumbnails = true,
}) {
  const isControlled = typeof controlledSelectedIndex === "number";
  const [internalSelectedIndex, setInternalSelectedIndex] = useState(0);
  const selectedIndex = isControlled ? controlledSelectedIndex : internalSelectedIndex;
  const [currentVideoError, setCurrentVideoError] = useState(false);

  const mediaItems = useMemo(() => {
    const items = [];
    (images || []).forEach((src) => {
      if (isValidImageUrl(src)) items.push({ type: "image", src });
    });

    if (videoUrl) {
      items.push({ type: "video", src: videoUrl });
    }

    if (spinImages && Array.isArray(spinImages) && spinImages.length > 0) {
      const validFrames = spinImages.filter(isValidImageUrl);
      if (validFrames.length > 0) {
        items.push({ type: "spin", frames: validFrames });
      }
    }

    if (items.length === 0) {
      items.push({ type: "image", src: FALLBACK_IMAGES.product });
    }

    return items;
  }, [images, videoUrl, spinImages]);

  const activeItem = mediaItems[selectedIndex] || mediaItems[0];

  useEffect(() => {
    if (selectedIndex >= mediaItems.length) {
      setSelectedIndex(0);
    }
  }, [mediaItems.length, selectedIndex]);

  const setSelected = (next) => {
    if (isControlled) {
      onSelectedIndexChange?.(next);
    } else {
      setInternalSelectedIndex(next);
    }
  };

  const goPrev = () => setSelected((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  const goNext = () => setSelected((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));

  const isVideo = activeItem.type === "video";
  const isSpin = activeItem.type === "spin";

  return (
    <div className="w-full space-y-4 product-gallery">
      {showThumbnails && (
        <div className="product-gallery-thumbnails space-y-2">
          <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Product media</p>
          <div className="product-gallery-thumbnails-list flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {mediaItems.map((item, index) => {
              const isActive = index === selectedIndex;
              const icon = item.type === "video" ? <Video size={14} /> : item.type === "spin" ? <RotateCcw size={14} /> : null;
              const thumbSrc = item.type === "spin" ? item.frames[0] : item.src;

              return (
                <button
                  key={`${item.type}-${index}`}
                  onClick={() => {
                    setSelected(index);
                    if (item.type === "spin") setCurrentVideoError(false);
                  }}
                  className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    isActive ? "border-neutral-900 shadow-lg" : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <img
                    src={thumbSrc}
                    alt={`${item.type} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => handleImageError(e, FALLBACK_IMAGES.product)}
                  />
                  {icon && (
                    <div className="absolute top-1 left-1 bg-black/70 rounded-full p-1 text-white">{icon}</div>
                  )}
                  {item.type === "spin" && (
                    <span className="absolute bottom-1 right-1 rounded-full bg-black/70 text-white text-[10px] px-1">360°</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 product-gallery-main">
        <div className="relative">
          {isSpin ? (
            <div className="p-2">
              <div className="mb-2 flex items-center justify-between p-2 bg-black/10 rounded-md">
                <span className="text-xs font-semibold">360° View</span>
                <div className="inline-flex items-center gap-2 text-xs text-neutral-700">
                  <RotateCcw size={16} />
                  Drag left/right for spin
                </div>
              </div>
              <SpinViewer frames={activeItem.frames} />
            </div>
          ) : isVideo ? (
            <div className="relative aspect-square bg-black">
              {isYouTubeUrl(activeItem.src) ? (
                <iframe
                  title="Product video"
                  className="w-full h-full"
                  src={getYouTubeEmbedUrl(activeItem.src)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeItem.src}
                  controls
                  className="w-full h-full object-cover"
                  onError={() => setCurrentVideoError(true)}
                />
              )}
              {currentVideoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-sm">
                  Unable to load video
                </div>
              )}
            </div>
          ) : (
            <ZoomImage
              src={activeItem.src}
              alt={`${productName} image`}
              onZoomTap={() => onImageClick?.(activeItem.src)}
            />
          )}

          {mediaItems.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous media"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-sm hover:bg-white"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next media"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-sm hover:bg-white"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/30 text-white text-[10px] tracking-wider uppercase px-3 py-1 rounded-full">
            {selectedIndex + 1} / {mediaItems.length} • {activeItem.type.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
