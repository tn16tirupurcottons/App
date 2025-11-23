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
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const imageContainerRef = useRef(null);

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Reset zoom and position when viewer opens/closes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      // Prevent body scroll when viewer is open
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const scrollY = window.scrollY;
      
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
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

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for swipe and pinch zoom (mobile)
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      if (zoom === 1) {
        setTouchStart(e.touches[0].clientX);
        setTouchEnd(null);
      } else {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        });
      }
    } else if (e.touches.length === 2) {
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
      setTouchEnd(e.touches[0].clientX);
    } else if (e.touches.length === 1 && isDragging && zoom > 1) {
      e.preventDefault();
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      setPosition({
        x: newX,
        y: newY,
      });
    } else if (e.touches.length === 2 && pinchStart) {
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
          setCurrentIndex(currentIndex + 1);
        } else if (distance < 0 && currentIndex > 0) {
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
      className="fixed inset-0 z-[9999]"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.3s ease-in-out'
      }}
      onClick={(e) => {
        if (e.target === containerRef.current) {
          onClose();
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Centered Image Box Container - Dark Frame Style */}
      <div
        style={{
          position: 'relative',
          width: '90%',
          maxWidth: '1200px',
          height: '90%',
          maxHeight: '90vh',
          backgroundColor: '#2a2a2a',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Top Right, White Circle, Inside Frame */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClose();
          }}
          className="absolute top-4 right-4 z-[10000] bg-white text-gray-900 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl cursor-pointer flex items-center justify-center"
          aria-label="Close viewer"
          title="Close (Esc key)"
          style={{ 
            width: '40px',
            height: '40px',
            minWidth: '40px',
            minHeight: '40px',
            zIndex: 10000
          }}
        >
          <FaTimes className="w-5 h-5 text-gray-900" />
        </button>

        {/* Navigation Arrows - Inside Frame */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-[10000] bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg border border-white/20 cursor-pointer flex items-center justify-center"
              aria-label="Previous image"
              title="Previous image (← Arrow key)"
              style={{
                width: '40px',
                height: '40px',
                minWidth: '40px',
                minHeight: '40px',
                zIndex: 10000
              }}
            >
              <FaChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setCurrentIndex(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-[10000] bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg border border-white/20 cursor-pointer flex items-center justify-center"
              aria-label="Next image"
              title="Next image (→ Arrow key)"
              style={{
                width: '40px',
                height: '40px',
                minWidth: '40px',
                minHeight: '40px',
                zIndex: 10000
              }}
            >
              <FaChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </>
        )}

        {/* Image Container - Centered in Dark Frame */}
        <div
          ref={imageContainerRef}
          className="flex-1 flex items-center justify-center"
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            margin: 0,
            boxSizing: 'border-box',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            cursor: zoom > 1 && isDragging ? 'grabbing' : 'default'
          }}
          onClick={(e) => {
            if (e.target === imageContainerRef.current) {
              // Don't close on click inside frame
            }
          }}
        >
          <img
            ref={imageRef}
            src={currentImage}
            alt={`Product view ${currentIndex + 1}`}
            className="select-none"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transition: isDragging || pinchStart ? "none" : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
              touchAction: "none",
              userSelect: "none",
              WebkitUserSelect: "none",
              pointerEvents: "auto",
              maxWidth: zoom > 1 ? "none" : "100%",
              maxHeight: zoom > 1 ? "none" : "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              display: "block",
              margin: "0 auto"
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

        {/* Bottom Section - Counter and Help Text */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            zIndex: 10000
          }}
        >
          {/* Image Counter */}
          {images.length > 1 && (
            <div 
              className="text-white/70 text-xs font-medium"
              style={{ 
                textAlign: 'center'
              }}
            >
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Help Text - Bottom Center, Exact Style Match */}
          <div 
            className="text-white text-sm font-medium"
            style={{ 
              textAlign: 'center'
            }}
          >
            Click to zoom, drag to move
          </div>
        </div>
      </div>
    </div>
  );
}
