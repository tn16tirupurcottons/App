import React from "react";

export default function MegaMenu({ segment }) {
  if (!segment) return null;

  return (
    <div
      className="hidden md:block absolute left-0 right-0 top-full bg-white shadow-xl border-t border-gray-100 z-40"
      style={{ borderTopColor: segment.accent }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-4 lg:grid-cols-5 gap-6 px-6 py-8 text-sm text-gray-700">
        {segment.menuColumns?.map((col) => (
          <div key={col.title}>
            <p className="font-semibold text-gray-900 mb-3">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a href={`/catalog?segment=${segment.key}`} className="hover:text-pink-600">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="hidden lg:flex flex-col justify-between rounded-2xl overflow-hidden border border-gray-100">
          <div
            className="h-32 bg-cover bg-center"
            style={{ backgroundImage: `url(${segment.banner})` }}
          />
          <div className="p-4" style={{ background: `${segment.primary}10` }}>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500">
              {segment.label} Drop
            </p>
            <p className="text-gray-900 font-semibold mt-2">
              {segment.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

