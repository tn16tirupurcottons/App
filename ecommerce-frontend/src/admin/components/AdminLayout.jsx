import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ title, actions, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-white min-h-screen text-neutral-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <div className="md:ml-64 transition-all duration-300">
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-900"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-neutral-900">{title || "Admin"}</h1>
          <div className="w-10" />
        </div>

        <div className="p-4 md:p-8 space-y-4 md:space-y-6 min-h-screen bg-white">
          <div className="hidden md:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {title && <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">{title}</h1>}
            {actions}
          </div>

          {actions && <div className="md:hidden flex justify-end">{actions}</div>}

          {children}
        </div>
      </div>
    </div>
  );
}
