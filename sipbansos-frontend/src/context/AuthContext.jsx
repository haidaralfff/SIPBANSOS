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

  const login = ({ email, password, role, name }) => {
    const trimmedEmail = email?.trim();
    const trimmedPassword = password?.trim();
    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, message: "Email dan password wajib diisi." };
    }

    const resolvedRole = role || "admin";
    const fallbackName = trimmedEmail.split("@")[0] || "Pengguna";
    const resolvedName = (name || fallbackName).replace(/\b\w/g, (c) => c.toUpperCase());

    const nextUser = {
      name: resolvedName,
      email: trimmedEmail,
      role: resolvedRole,
      roleLabel: ROLE_LABELS[resolvedRole] || resolvedRole
    };

    setUser(nextUser);
    writeStoredUser(nextUser);
    return { success: true };
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
