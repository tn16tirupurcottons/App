import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useContext(AuthContext);

  // While checking token
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  // Not logged in → login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If route is adminOnly but user is normal user
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
