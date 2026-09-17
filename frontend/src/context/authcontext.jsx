import { createContext, useContext, useState, useCallback } from "react";
import * as authApi from "../api/auth.api";

const AuthContext = createContext(null);

const STORAGE_KEY = "vas_auth";

const readStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Role → default landing route, used by Login and by "/" redirects.
export const landingRouteForRole = (role) => {
  if (role === "Admin") return "/admin/users";
  if (role === "Executive") return "/productivity";
  return "/home";
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(readStoredAuth);

  const login = useCallback(async (userId, password) => {
    const data = await authApi.login(userId, password); // { token, user }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setAuth(data);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {}); // best-effort; local logout always succeeds
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }, []);

  const value = {
    user: auth?.user ?? null,
    token: auth?.token ?? null,
    isAuthenticated: Boolean(auth?.token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};