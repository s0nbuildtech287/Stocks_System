"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "MEMBER" | "PRO";
  avatarBg: string;
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  isGuest: boolean;
  login: (email: string, pass: string) => { success: boolean; error?: string };
  register: (name: string, email: string, pass: string) => { success: boolean; error?: string };
  quickLoginDemo: () => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  loginModalReason: string;
  openLoginModal: (reason?: string) => void;
  closeLoginModal: () => void;
  getUserData: <T>(key: string, defaultValue: T) => T;
  saveUserData: <T>(key: string, data: T) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const XUAN_SON_USER: User = {
  id: "user-xu4ns0n",
  name: "Xuân Sơn (xu4ns0n)",
  email: "xu4ns0n",
  role: "PRO",
  avatarBg: "bg-[#F0B90B]",
  createdAt: "12/10/2026",
};

const DEMO_USER: User = XUAN_SON_USER;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalReason, setLoginModalReason] = useState("");
  const [isReady, setIsReady] = useState(false);

  // Load user on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("ss_auth_current_user");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to load user session", e);
    }
    setIsReady(true);
  }, []);

  const isGuest = currentUser === null;

  const openLoginModal = (reason: string = "") => {
    setLoginModalReason(reason);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginModalReason("");
  };

  // Register function
  const register = (name: string, email: string, pass: string) => {
    if (!name.trim() || !email.trim() || !pass.trim()) {
      return { success: false, error: "Vui lòng nhập đầy đủ thông tin!" };
    }
    if (pass.length < 6) {
      return { success: false, error: "Mật khẩu phải từ 6 ký tự trở lên!" };
    }

    try {
      const cleanId = email.trim().toLowerCase();
      // Auto accept xu4ns0n / 123456
      if ((cleanId === "xu4ns0n" || cleanId === "xu4ns0n@gmail.com") && pass === "123456") {
        setCurrentUser(XUAN_SON_USER);
        localStorage.setItem("ss_auth_current_user", JSON.stringify(XUAN_SON_USER));
        closeLoginModal();
        return { success: true };
      }

      const usersRaw = localStorage.getItem("ss_auth_users_db") || "[]";
      const users: any[] = JSON.parse(usersRaw);

      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: "Email này đã được đăng ký tài khoản!" };
      }

      const colors = ["bg-amber-500", "bg-emerald-500", "bg-cyan-500", "bg-purple-500", "bg-rose-500"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newUser: User = {
        id: "user-" + Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: "MEMBER",
        avatarBg: randomColor,
        createdAt: new Date().toLocaleDateString("vi-VN"),
      };

      users.push({ ...newUser, password: pass });
      localStorage.setItem("ss_auth_users_db", JSON.stringify(users));

      // Auto login
      setCurrentUser(newUser);
      localStorage.setItem("ss_auth_current_user", JSON.stringify(newUser));
      closeLoginModal();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Lỗi lưu tài khoản!" };
    }
  };

  // Login function
  const login = (email: string, pass: string) => {
    if (!email.trim() || !pass.trim()) {
      return { success: false, error: "Vui lòng nhập email và mật khẩu!" };
    }

    try {
      const cleanId = email.trim().toLowerCase();
      // Auto accept xu4ns0n / 123456
      if ((cleanId === "xu4ns0n" || cleanId === "xu4ns0n@gmail.com") && pass === "123456") {
        setCurrentUser(XUAN_SON_USER);
        localStorage.setItem("ss_auth_current_user", JSON.stringify(XUAN_SON_USER));
        closeLoginModal();
        return { success: true };
      }

      const usersRaw = localStorage.getItem("ss_auth_users_db") || "[]";
      const users: any[] = JSON.parse(usersRaw);

      const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === pass
      );

      if (found) {
        const userObj: User = {
          id: found.id,
          name: found.name,
          email: found.email,
          role: found.role || "MEMBER",
          avatarBg: found.avatarBg || "bg-amber-500",
          createdAt: found.createdAt || new Date().toLocaleDateString("vi-VN"),
        };
        setCurrentUser(userObj);
        localStorage.setItem("ss_auth_current_user", JSON.stringify(userObj));
        closeLoginModal();
        return { success: true };
      }

      // Check if it's the demo account
      if (email.toLowerCase().includes("demo") || email.toLowerCase().includes("xuanson")) {
        setCurrentUser(DEMO_USER);
        localStorage.setItem("ss_auth_current_user", JSON.stringify(DEMO_USER));
        closeLoginModal();
        return { success: true };
      }

      return { success: false, error: "Sai email hoặc mật khẩu!" };
    } catch (e: any) {
      return { success: false, error: e.message || "Lỗi đăng nhập!" };
    }
  };

  // Quick Demo Login
  const quickLoginDemo = () => {
    setCurrentUser(DEMO_USER);
    localStorage.setItem("ss_auth_current_user", JSON.stringify(DEMO_USER));
    closeLoginModal();
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("ss_auth_current_user");
  };

  // Read User-Specific Data
  const getUserData = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === "undefined") return defaultValue;
    try {
      if (currentUser) {
        const storageKey = `ss_user_${currentUser.id}_${key}`;
        const item = localStorage.getItem(storageKey);
        return item !== null ? JSON.parse(item) : defaultValue;
      }
      return defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Save User-Specific Data
  const saveUserData = <T,>(key: string, data: T): boolean => {
    if (isGuest) {
      openLoginModal(`Vui lòng đăng nhập để lưu trữ dữ liệu "${key}" của bạn trên hệ thống!`);
      return false;
    }

    try {
      const storageKey = `ss_user_${currentUser!.id}_${key}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Save error", e);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isGuest,
        login,
        register,
        quickLoginDemo,
        logout,
        isLoginModalOpen,
        loginModalReason,
        openLoginModal,
        closeLoginModal,
        getUserData,
        saveUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
