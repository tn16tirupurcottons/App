import React from "react";

export default function StockProgress({ remaining = 0, total = 0 }) {
  const percent = total > 0 ? Math.max(0, Math.min(100, ((total - remaining) / total) * 100)) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-neutral-600">
        <span>Only {remaining} left</span>
        <span>{Math.round(percent)}% sold</span>
      </div>
      <div className="h-2 rounded-full bg-white/20 overflow-hidden border border-white/20">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
