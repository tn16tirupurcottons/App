import React, { createContext, useState, useEffect, useCallback } from "react";
import axiosClient from "../api/axiosClient";

// Fast Refresh compatible: context export
const AuthContext = createContext();
export { AuthContext };

// Fast Refresh compatible: function declaration component
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("tn16_token");
    if (token) {
      try {
        // Try regular auth endpoint first
        const res = await axiosClient.get("/auth/me");
        setUser(res.data.user || null);
        setLoading(false);
      } catch (err) {
        // If regular auth fails, try admin profile
        try {
          const adminRes = await axiosClient.get("/admin/profile");
          setUser(adminRes.data.user || null);
          setLoading(false);
        } catch (adminErr) {
          // Both failed, clear token
          localStorage.removeItem("tn16_token");
          setUser(null);
          setLoading(false);
        }
      }
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    // Listen for custom auth update event (when token is set from admin login)
    const handleAuthUpdate = () => {
      fetchUser();
    };
    window.addEventListener("auth-update", handleAuthUpdate);
    window.addEventListener("storage", handleAuthUpdate);
    
    return () => {
      window.removeEventListener("auth-update", handleAuthUpdate);
      window.removeEventListener("storage", handleAuthUpdate);
    };
  }, [fetchUser]);

  const login = async (identifier, password) => {
    const res = await axiosClient.post("/auth/login", {
      identifier,
      password,
    });
    // Handle both token and accessToken formats
    const token = res.data.accessToken || res.data.token;
    if (token) {
      localStorage.setItem("tn16_token", token);
    }
    setUser(res.data.user);
    return res;
  };

  const register = async (payload) => {
    const res = await axiosClient.post("/auth/register", payload);
    // Handle both token and accessToken formats
    const token = res.data.accessToken || res.data.token;
    if (token) {
      localStorage.setItem("tn16_token", token);
    }
    setUser(res.data.user);
    return res;
  };

  const logout = (callback) => {
    localStorage.removeItem("tn16_token");
    setUser(null);
    if (callback && typeof callback === "function") {
      callback();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider };
