'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ============================================
// 类型定义
// ============================================

/**
 * 用户信息
 */
export interface AuthUser {
  id: string;
  username: string;
}

/**
 * 登录参数
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * 注册参数
 */
export interface RegisterCredentials {
  username: string;
  password: string;
}

/**
 * AuthContext 类型
 */
interface AuthContextType {
  user: AuthUser | null;      // 当前登录用户
  isLoading: boolean;         // 是否正在加载状态
  isLoggedIn: boolean;        // 是否已登录
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;  // 检查登录状态
}

// ============================================
// Context 创建
// ============================================
const AuthContext = createContext<AuthContextType | null>(null);

// ============================================
// Provider 组件
// ============================================
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 是否已登录
  const isLoggedIn = !!user;

  /**
   * 检查当前登录状态
   */
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();

      if (data.loggedIn) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('[Auth] Check status failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 用户登录
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('[Auth] Login failed:', error);
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }, []);

  /**
   * 用户注册
   */
  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        // 注册成功后自动登录
        return await login(credentials);
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('[Auth] Register failed:', error);
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }, [login]);

  /**
   * 用户退出登录
   */
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('[Auth] Logout failed:', error);
    } finally {
      setUser(null);
    }
  }, []);

  // 初始化时检查登录状态
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    isLoading,
    isLoggedIn,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// Hook
// ============================================
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
