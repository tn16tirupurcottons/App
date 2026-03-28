import React from "react";

export default function MegaMenu({ segment }) {
  if (!segment) return null;

  return (
    <div
      className="hidden md:block absolute left-0 right-0 top-full bg-white/95 backdrop-blur-xl border-t border-border shadow-medium z-40"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-4 lg:grid-cols-5 gap-6 px-6 py-8 text-sm text-dark/70">
        {segment.menuColumns?.map((col) => (
          <div key={col.title}>
            <p className="font-semibold text-dark mb-3 uppercase tracking-[0.3em] text-[11px]">
              {col.title}
            </p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href={`/catalog?segment=${segment.key}`}
                    className="hover:text-primary"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="hidden lg:flex flex-col justify-between rounded-2xl overflow-hidden border border-border shadow-soft bg-white">
          <div
            className="h-32 bg-cover bg-center relative"
            style={{ 
              backgroundImage: `url(${segment.backgroundImage || segment.banner})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.15
            }}
          >
            <div className="absolute inset-0 bg-white" />
          </div>
          <div className="p-4 bg-white">
            <p className="text-xs uppercase tracking-[0.4em] text-muted">
              {segment.label} Collection
            </p>
            <p className="text-dark font-semibold mt-2">
              {segment.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

