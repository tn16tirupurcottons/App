import React, { createContext, useState, useEffect, useCallback } from "react";
import axiosClient from "../api/axiosClient";
import { postLogin } from "../api/authApi";

// Fast Refresh compatible: context export
const AuthContext = createContext();
export { AuthContext };

// Fast Refresh compatible: function declaration component
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/auth/me");
      setUser(res.data.user || null);
      setLoading(false);
    } catch {
      try {
        await axiosClient.post("/auth/refresh");
        const refreshed = await axiosClient.get("/auth/me");
        setUser(refreshed.data.user || null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
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
    const res = await postLogin({ identifier, password });
    setUser(res.data.user);
    return res;
  };

  const register = async (payload) => {
    const res = await axiosClient.post("/auth/register", payload);
    setUser(res.data.user);
    return res;
  };

  const logout = (callback) => {
    axiosClient.post("/auth/logout").catch(() => {});
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
