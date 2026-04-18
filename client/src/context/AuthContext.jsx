import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("tvet_auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setAccessToken(parsed.accessToken);
        setRefreshToken(parsed.refreshToken);
      } catch (error) {
        console.warn(
          "Failed to parse stored auth data, clearing invalid localStorage.",
          error,
        );
        localStorage.removeItem("tvet_auth");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (accessToken && user) {
      api.setToken(accessToken);
    }
  }, [accessToken, user]);

  const saveAuth = (payload) => {
    setUser(payload.user);
    setAccessToken(payload.accessToken);
    setRefreshToken(payload.refreshToken);
    api.setToken(payload.accessToken);
    localStorage.setItem("tvet_auth", JSON.stringify(payload));
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    saveAuth(res.data);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    api.setToken(null);
    localStorage.removeItem("tvet_auth");
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
