import React, { useEffect, useState } from "react";

const MODEL_VIEWER_SCRIPT = "https://unpkg.com/@google/model-viewer@1.24.0/dist/model-viewer.min.js";

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src='${src}']`);
    if (existingScript) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

export default function ARViewer({ model3dUrl, arModelUrl }) {
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (!model3dUrl && !arModelUrl) {
        setError("No 3D model configured for this product.");
        return;
      }
      try {
        await loadScript(MODEL_VIEWER_SCRIPT);
        setScriptReady(true);
      } catch {
        setError("Unable to load AR toolkit. Try again later.");
      }
    };

    init();
  }, [model3dUrl, arModelUrl]);

  if (error) {
    return <div className="rounded-xl border border-neutral-200 p-4 text-sm text-red-500">{error}</div>;
  }

  if (!scriptReady) {
    return <div className="rounded-xl border border-neutral-200 p-4 text-sm">Loading AR view...</div>;
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-4 bg-white">
      <h3 className="text-sm font-bold uppercase tracking-tight text-neutral-600 mb-2">AR Shopping</h3>
      <p className="text-xs text-neutral-500 mb-2">Point your camera to place the garment in real space.</p>

      <model-viewer
        style={{ width: "100%", height: "400px", minHeight: "300px" }}
        auto-rotate
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        src={model3dUrl || arModelUrl}
        ios-src={arModelUrl || model3dUrl}
        environment-image="neutral"
        shadow-intensity="1"
        alt="AR mesh for product"
      ></model-viewer>

      <p className="text-[11px] text-neutral-500 mt-2">Tap View in AR to place the product in your environment.</p>
    </div>
  );
}
