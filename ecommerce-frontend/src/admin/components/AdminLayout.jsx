import React from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ title, actions, children }) {
  return (
    <div className="bg-gray-100 min-h-screen">
      <AdminSidebar />
      <div className="md:ml-64 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
          {actions}
        </div>
        {children}
      </div>
    </div>
  );
}

