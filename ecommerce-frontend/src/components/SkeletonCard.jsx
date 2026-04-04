import React, { memo } from "react";

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-square bg-neutral-200/70 skeleton-shimmer" />
      <div className="p-2 md:p-2.5">
        <div className="h-3 w-16 bg-neutral-200/70 rounded skeleton-shimmer" />
        <div className="mt-2 h-3 w-full bg-neutral-200/70 rounded skeleton-shimmer" />
        <div className="mt-2 h-3 w-3/5 bg-neutral-200/70 rounded skeleton-shimmer" />
        <div className="mt-3 h-4 w-24 bg-neutral-200/70 rounded skeleton-shimmer" />
      </div>
    </div>
  );
});

export default SkeletonCard;