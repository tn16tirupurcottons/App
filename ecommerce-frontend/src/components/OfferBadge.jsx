import React from "react";

export default function OfferBadge({ label = "Offer" }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-500/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-950 shadow-sm">
      {label}
    </span>
  );
}
