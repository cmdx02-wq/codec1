'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useToast } from './ToastContext';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string;
  referralCode: string;
  affiliateBalance: number;
  bookmarks?: any[];
  notifications?: any[];
  certificates?: any[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: loginRegisterData['password']) => Promise<void>;
  register: (name: string, email: string, password: loginRegisterData['password'], referralCode?: string) => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  loginWithGoogle: (email: string, name: string, avatarUrl: string, googleId: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  toggleBookmark: (courseId?: string, blogId?: string) => Promise<boolean>;
  markNotificationRead: (id: string) => Promise<void>;
}

// Helper types
type loginRegisterData = Record<string, string>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    showToast('Logged out successfully', 'info');
  }, [showToast]);

  const loadCurrentUser = useCallback(async () => {
    try {
      const data = await api.get('/auth/me');
      setUser(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      loadCurrentUser();
    } else {
      setLoading(false);
    }
  }, [loadCurrentUser]);

  const login = async (email: string, password: loginRegisterData['password']) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: loginRegisterData['password'], referralCode?: string) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/register', { name, email, password, referralCode });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast('Registration successful! Welcome!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (email: string) => {
    try {
      const data = await api.post('/auth/otp/send', { email });
      showToast(data.message || 'OTP sent to your email', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send OTP', 'error');
      throw err;
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/otp/verify', { email, otp });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast(`Welcome, ${data.user.name}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'OTP verification failed', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (email: string, name: string, avatarUrl: string, googleId: string) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/google', { email, name, avatarUrl, googleId });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast(`Google Login successful, welcome ${data.user.name}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Google Login failed', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const data = await api.get('/auth/me');
      setUser(data);
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  const toggleBookmark = async (courseId?: string, blogId?: string): Promise<boolean> => {
    try {
      const data = await api.post('/users/bookmarks', { courseId, blogId });
      showToast(data.message, 'success');
      await refreshUser();
      return data.bookmarked;
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle bookmark', 'error');
      return false;
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.put(`/users/notifications/${id}/read`);
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          notifications: prev.notifications?.map((n) => n.id === id ? { ...n, read: true } : n) || [],
        };
      });
    } catch (err: any) {
      console.error('Failed to mark notification read:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        sendOtp,
        verifyOtp,
        loginWithGoogle,
        logout,
        refreshUser,
        toggleBookmark,
        markNotificationRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
