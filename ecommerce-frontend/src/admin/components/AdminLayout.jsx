import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ title, actions, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-ink min-h-screen text-white">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
        <div className="md:ml-64 transition-all duration-300">
        {/* Mobile header with menu button */}
          <div className="md:hidden bg-ink border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-white/10"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
            <h1 className="text-lg font-bold text-white">{title || "Admin"}</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Content area */}
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Desktop title and actions */}
          <div className="hidden md:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {title && <h1 className="text-2xl font-display text-white">{title}</h1>}
            {actions}
          </div>
          
          {/* Mobile actions */}
          {actions && (
            <div className="md:hidden flex justify-end">
              {actions}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}

