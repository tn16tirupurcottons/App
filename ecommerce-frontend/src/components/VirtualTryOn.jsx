import React, { useEffect, useRef, useState } from "react";

const MEDIAPIPE_POSE_SCRIPT = "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.0/pose.js";
const MEDIAPIPE_DRAWING_SCRIPT = "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.5.0/drawing_utils.js";
const MEDIAPIPE_CAMERA_SCRIPT = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.5.0/camera_utils.js";

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src='${src}']`);
    if (existing) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });

export default function VirtualTryOn({ overlayImage }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!overlayImage) {
      setError("No try-on overlay is available for this product.");
      setReady(false);
      return;
    }
    setError(null);
  }, [overlayImage]);

  useEffect(() => {
    let pose;
    let camera;

    const setup = async () => {
      if (!overlayImage) {
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera access is not supported in this browser.");
        return;
      }

      try {
        await loadScript(MEDIAPIPE_POSE_SCRIPT);
        await loadScript(MEDIAPIPE_DRAWING_SCRIPT);
        await loadScript(MEDIAPIPE_CAMERA_SCRIPT);

        const { Pose, Camera } = window;
        const { drawConnectors, drawLandmarks } = window;

        if (!Pose || !Camera) {
          throw new Error("MediaPipe pose or camera support is unavailable");
        }

        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        if (!videoElement || !canvasElement) {
          throw new Error("Unable to initialize virtual try-on display.");
        }
        const canvasCtx = canvasElement.getContext("2d");

        pose = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.0/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results) => {
          if (!canvasElement || !videoElement) return;

          canvasElement.width = videoElement.videoWidth;
          canvasElement.height = videoElement.videoHeight;

          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
          canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

          if (results.poseLandmarks) {
            drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS, {
              color: "rgba(0, 255, 255, 0.5)",
              lineWidth: 2,
            });
            drawLandmarks(canvasCtx, results.poseLandmarks, {
              color: "rgba(255, 0, 255, 0.7)",
              lineWidth: 1,
            });

            const landmarks = results.poseLandmarks;

            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];

            if (leftShoulder && rightShoulder && leftHip && rightHip && overlayImage) {
              const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
              const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;
              const hipCenterX = (leftHip.x + rightHip.x) / 2;
              const hipCenterY = (leftHip.y + rightHip.y) / 2;

              const overlayWidth = Math.hypot((leftShoulder.x - rightShoulder.x) * canvasElement.width, (leftShoulder.y - rightShoulder.y) * canvasElement.height) * 2.4;
              const overlayHeight = Math.hypot((hipCenterY - shoulderCenterY) * canvasElement.height, (hipCenterX - shoulderCenterX) * canvasElement.width) * 1.8;

              const overlayX = shoulderCenterX * canvasElement.width - overlayWidth / 2;
              const overlayY = shoulderCenterY * canvasElement.height - overlayHeight * 0.25;

              const image = new Image();
              image.src = overlayImage;
              image.onload = () => {
                canvasCtx.globalAlpha = 0.75;
                canvasCtx.drawImage(image, overlayX, overlayY, overlayWidth, overlayHeight);
                canvasCtx.globalAlpha = 1;
              };
              image.onerror = () => {
                setError("Cannot load the try-on asset. Please choose another product or try again later.");
              };
            }
          }
        });

        camera = new Camera(videoElement, {
          onFrame: async () => {
            await pose.send({ image: videoElement });
          },
          width: 640,
          height: 480,
        });

        await camera.start();
        setReady(true);
      } catch (e) {
        setError(e.message || "Failed to start Virtual Try-On");
      }
    };

    setup();

    return () => {
      if (camera && camera.stop) camera.stop();
      if (pose) pose.close && pose.close();
    };
  }, [overlayImage]);

  return (
    <div className="rounded-xl border border-neutral-200 p-3 bg-white shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-600 mb-2">Virtual Try-On</h3>
      {error ? (
        <div className="text-xs text-red-500">{error}</div>
      ) : !ready ? (
        <div className="text-xs text-neutral-500">Loading camera and pose model...</div>
      ) : (
        <div className="relative w-full max-w-xl">
          <video ref={videoRef} className="w-full rounded-lg" autoPlay playsInline muted style={{ display: "none" }} />
          <canvas ref={canvasRef} className="w-full rounded-lg bg-black" />
          <div className="absolute top-2 left-2 text-xs text-white bg-black/50 rounded px-2 py-1">
            Align your body with the guide and the overlay updates live.
          </div>
        </div>
      )}
    </div>
  );
}
