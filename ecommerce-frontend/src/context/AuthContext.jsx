import React, { createContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("tn16_token");
    if (token) {
      // optionally fetch user profile
      axiosClient.get("/auth/me").then(res => {
        setUser(res.data.user || null);
        setLoading(false);
      }).catch(() => {
        localStorage.removeItem("tn16_token");
        setUser(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await axiosClient.post("/auth/login", { email, password });
    localStorage.setItem("tn16_token", res.data.token);
    setUser(res.data.user);
    return res;
  };

  const register = async (payload) => {
    const res = await axiosClient.post("/auth/register", payload);
    localStorage.setItem("tn16_token", res.data.token);
    setUser(res.data.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem("tn16_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
