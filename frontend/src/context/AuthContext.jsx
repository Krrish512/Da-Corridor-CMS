import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login on startup
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('arch_token');
      const savedUser = localStorage.getItem('arch_user');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Verify token is still valid by requesting profile
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('arch_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('[AUTH CONTEXT] Local session invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, ...userData } = res.data;
      
      localStorage.setItem('arch_token', token);
      localStorage.setItem('arch_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('[AUTH LOGIN ERROR]:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Check your network or credentials.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('arch_token');
    localStorage.removeItem('arch_user');
    setUser(null);
    window.location.href = '/';
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password.'
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
