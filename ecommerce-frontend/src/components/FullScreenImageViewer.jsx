import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function FullScreenImageViewer({ 
  images, 
  initialIndex = 0, 
  isOpen, 
  onClose 
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [pinchStart, setPinchStart] = useState(null);
  const [pinchZoom, setPinchZoom] = useState(1);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setPinchZoom(1);
  }, [currentIndex]);

  // Reset zoom and position when viewer opens/closes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setPinchZoom(1);
      // Prevent body scroll when viewer is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        e.preventDefault();
        setCurrentIndex(currentIndex - 1);
      } else if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
        e.preventDefault();
        setCurrentIndex(currentIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, currentIndex, images.length, onClose]);

  // Mouse drag for panning when zoomed (desktop)
  const handleMouseDown = (e) => {
    if (zoom > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      e.preventDefault();
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({
        x: newX,
        y: newY,
      });
    }
  };

  const handleMouseUp = (e) => {
    if (isDragging) {
      e.preventDefault();
    }
    setIsDragging(false);
  };

  // Touch handlers for swipe and pinch zoom (mobile)
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      // Single touch - for swiping between images (only when not zoomed)
      if (zoom === 1) {
        setTouchStart(e.touches[0].clientX);
        setTouchEnd(null);
      } else {
        // Single touch when zoomed - for panning
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        });
      }
    } else if (e.touches.length === 2) {
      // Two touches - for pinch-to-zoom
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setPinchStart({
        distance,
        zoom: zoom,
        centerX: (touch1.clientX + touch2.clientX) / 2,
        centerY: (touch1.clientY + touch2.clientY) / 2,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && touchStart !== null && zoom === 1) {
      // Single touch swipe - only when not zoomed
      setTouchEnd(e.touches[0].clientX);
    } else if (e.touches.length === 1 && isDragging && zoom > 1) {
      // Single touch panning when zoomed
      e.preventDefault();
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      setPosition({
        x: newX,
        y: newY,
      });
    } else if (e.touches.length === 2 && pinchStart) {
      // Pinch-to-zoom
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const scale = distance / pinchStart.distance;
      const newZoom = Math.max(1, Math.min(3, pinchStart.zoom * scale));
      setZoom(newZoom);
      setPinchZoom(newZoom);
      
      // Adjust position to zoom from center
      if (newZoom > 1) {
        const deltaX = (touch1.clientX + touch2.clientX) / 2 - pinchStart.centerX;
        const deltaY = (touch1.clientY + touch2.clientY) / 2 - pinchStart.centerY;
        setPosition({
          x: position.x + deltaX,
          y: position.y + deltaY,
        });
      } else {
        setPosition({ x: 0, y: 0 });
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchStart !== null && touchEnd !== null && zoom === 1) {
      const distance = touchStart - touchEnd;
      const minSwipeDistance = 50;

      if (Math.abs(distance) > minSwipeDistance) {
        if (distance > 0 && currentIndex < images.length - 1) {
          // Swipe left - next image
          setCurrentIndex(currentIndex + 1);
        } else if (distance < 0 && currentIndex > 0) {
          // Swipe right - previous image
          setCurrentIndex(currentIndex - 1);
        }
      }
    }
    setIsDragging(false);
    setTouchStart(null);
    setTouchEnd(null);
    setPinchStart(null);
  };

  // Wheel zoom (desktop)
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((prev) => {
        const newZoom = Math.max(1, Math.min(3, prev + delta));
        if (newZoom === 1) {
          setPosition({ x: 0, y: 0 });
        }
        return newZoom;
      });
    }
  };

  // Double-click to zoom (desktop)
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (zoom === 1) {
      setZoom(2);
    } else {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black"
      onClick={(e) => {
        // Close when clicking on the backdrop
        if (e.target === containerRef.current) {
          onClose();
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* Close Button - Always visible, prominent */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClose();
        }}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[110] bg-white hover:bg-gray-100 text-black rounded-full transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl border-2 border-white/50 cursor-pointer flex items-center justify-center"
        aria-label="Close viewer"
        title="Close (Esc key)"
        style={{ 
          width: '48px',
          height: '48px',
          minWidth: '48px',
          minHeight: '48px'
        }}
      >
        <FaTimes size={20} />
      </button>

      {/* Navigation Arrows - Always visible on desktop, visible on mobile */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
            }}
            className="fixed left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-[105] bg-white/90 hover:bg-white text-black p-3 sm:p-4 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl border-2 border-white/50 cursor-pointer"
            aria-label="Previous image"
            title="Previous image (← Arrow key)"
            style={{
              width: '44px',
              height: '44px',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FaChevronLeft size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setCurrentIndex(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
            }}
            className="fixed right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-[105] bg-white/90 hover:bg-white text-black p-3 sm:p-4 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl border-2 border-white/50 cursor-pointer"
            aria-label="Next image"
            title="Next image (→ Arrow key)"
            style={{
              width: '44px',
              height: '44px',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FaChevronRight size={18} />
          </button>
        </>
      )}

      {/* Image Counter - Always visible */}
      {images.length > 1 && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[105] bg-white/90 backdrop-blur-md text-black px-4 py-2 rounded-full text-sm font-semibold shadow-2xl border-2 border-white/50">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Full-screen Image Container - Perfectly centered */}
      <div
        ref={scrollContainerRef}
        className="w-full h-full overflow-auto"
        onClick={(e) => {
          // Close when clicking backdrop
          if (e.target === scrollContainerRef.current) {
            onClose();
          }
        }}
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          cursor: zoom > 1 && isDragging ? 'grabbing' : 'default',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div 
          className="flex items-center justify-center w-full h-full p-4"
          style={{
            width: '100%',
            height: '100%',
            minHeight: '100%',
            boxSizing: 'border-box'
          }}
        >
          <img
            ref={imageRef}
            src={currentImage}
            alt={`Product view ${currentIndex + 1}`}
            className="select-none max-w-full max-h-full w-auto h-auto object-contain"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transition: isDragging || pinchStart ? "none" : "transform 0.2s ease-out",
              cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
              touchAction: "none",
              userSelect: "none",
              WebkitUserSelect: "none",
              pointerEvents: "auto",
              maxWidth: zoom > 1 ? "none" : "calc(100vw - 2rem)",
              maxHeight: zoom > 1 ? "none" : "calc(100vh - 2rem)",
              display: "block"
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
