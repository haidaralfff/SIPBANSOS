import { createContext, useContext, useMemo, useState } from "react";
import { ROLE_LABELS } from "../utils/roleGuard";

const STORAGE_KEY = "sipbansos_auth";

const readStoredUser = () => {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeStoredUser = (user) => {
  if (typeof localStorage === "undefined") return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());
  const isAuthenticated = Boolean(user);

  const login = async ({ identifier, email, password }) => {
    const resolvedIdentifier = (identifier ?? email)?.trim();
    const trimmedPassword = password?.trim();
    if (!resolvedIdentifier || !trimmedPassword) {
      return { success: false, message: "Email/username dan password wajib diisi." };
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

    try {
      const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          identifier: resolvedIdentifier,
          password: trimmedPassword
        })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          message: payload?.error || "Login gagal."
        };
      }

      const userPayload = payload?.user || {};
      const resolvedRole = userPayload.role || "admin";
      const fallbackName = resolvedIdentifier.split("@")[0] || "Pengguna";
      const resolvedName = (userPayload.full_name || userPayload.username || fallbackName).replace(
        /\b\w/g,
        (c) => c.toUpperCase()
      );

      const nextUser = {
        name: resolvedName,
        email: userPayload.email || resolvedIdentifier,
        role: resolvedRole,
        roleLabel: ROLE_LABELS[resolvedRole] || resolvedRole,
        accessToken: payload?.access_token,
        refreshToken: payload?.refresh_token
      };

      setUser(nextUser);
      writeStoredUser(nextUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: "Gagal terhubung ke server."
      };
    }
  };

  const logout = () => {
    setUser(null);
    writeStoredUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      login,
      logout
    }),
    [user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
