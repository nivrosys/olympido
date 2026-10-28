"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { User, UserRole } from "../types/api";
import {
  authApi,
  LoginDto,
  RegisterStudentDto,
  RegisterOrganizerDto,
  getAccessToken,
  clearTokens,
  notificationsApi,
} from "../lib/api";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  unreadNotificationsCount: number;
  login: (dto: LoginDto) => Promise<void>;
  registerStudent: (dto: RegisterStudentDto) => Promise<any>;
  registerOrganizer: (dto: RegisterOrganizerDto) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshNotificationsCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  const refreshNotificationsCount = useCallback(async () => {
    if (!getAccessToken()) return;
    try {
      const res = await notificationsApi.getUnreadCount();
      setUnreadNotificationsCount(res.unreadCount || 0);
    } catch {
      // Ignore background notification count fetch failures
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const freshUser = await authApi.getMe();
      setUser(freshUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("olympido_user", JSON.stringify(freshUser));
      }
      void refreshNotificationsCount();
    } catch (err: any) {
      console.debug("Failed to load authenticated user profile (session fallback active):", err?.message || err);
      // If unauthorized, clean up
      if (err.statusCode === 401) {
        clearTokens();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [refreshNotificationsCount]);

  useEffect(() => {
    // Optimistically load cached user from localStorage to eliminate flicker
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("olympido_user");
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          // Ignore parse errors
        }
      }
    }

    void refreshUser();

    // Listen for global unauthorized events dispatched by API client
    const handleUnauthorized = () => {
      setUser(null);
      setUnreadNotificationsCount(0);
    };

    window.addEventListener("olympido_unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("olympido_unauthorized", handleUnauthorized);
    };
  }, [refreshUser]);

  const login = async (dto: LoginDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const tokens = await authApi.login(dto);
      // Fetch full profile with student stats & institution
      const fullUser = await authApi.getMe();
      setUser(fullUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("olympido_user", JSON.stringify(fullUser));
      }
      void refreshNotificationsCount();
    } catch (err: any) {
      const msg = err.message || "Failed to log in";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerStudent = async (dto: RegisterStudentDto) => {
    setIsLoading(true);
    setError(null);
    try {
      return await authApi.registerStudent(dto);
    } catch (err: any) {
      const msg = err.message || "Registration failed";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerOrganizer = async (dto: RegisterOrganizerDto) => {
    setIsLoading(true);
    setError(null);
    try {
      return await authApi.registerOrganizer(dto);
    } catch (err: any) {
      const msg = err.message || "Organizer registration failed";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setUnreadNotificationsCount(0);
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const role = user?.role || null;
  const isAuthenticated = Boolean(user && getAccessToken());

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        error,
        unreadNotificationsCount,
        login,
        registerStudent,
        registerOrganizer,
        logout,
        refreshUser,
        refreshNotificationsCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
