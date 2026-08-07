import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

const PERMISSION_MATRIX = {
  SUPER_ADMIN: [
    'DASHBOARD_VIEW', 'HERO_MANAGE', 'ABOUT_MANAGE', 'SERVICES_MANAGE',
    'PORTFOLIO_READ', 'PORTFOLIO_CREATE', 'PORTFOLIO_UPDATE', 'PORTFOLIO_DELETE',
    'GALLERY_MANAGE', 'BLOG_MANAGE', 'CONTACT_MANAGE', 'NEWSLETTER_MANAGE',
    'SEO_MANAGE', 'SETTINGS_MANAGE', 'USERS_MANAGE', 'USERS_DELETE',
    'USERS_CHANGE_ROLE', 'SYSTEM_LOGS_VIEW', 'PROFILE_UPDATE'
  ],
  ADMIN: [
    'DASHBOARD_VIEW', 'HERO_MANAGE', 'ABOUT_MANAGE', 'SERVICES_MANAGE',
    'PORTFOLIO_READ', 'PORTFOLIO_CREATE', 'PORTFOLIO_UPDATE', 'PORTFOLIO_DELETE',
    'GALLERY_MANAGE', 'BLOG_MANAGE', 'CONTACT_MANAGE', 'NEWSLETTER_MANAGE',
    'SEO_MANAGE', 'SYSTEM_LOGS_VIEW', 'PROFILE_UPDATE'
  ],
  CO_ADMIN: [
    'DASHBOARD_VIEW', 'HERO_MANAGE', 'ABOUT_MANAGE', 'SERVICES_MANAGE',
    'PORTFOLIO_READ', 'PORTFOLIO_CREATE', 'PORTFOLIO_UPDATE',
    'GALLERY_MANAGE', 'BLOG_MANAGE', 'CONTACT_MANAGE', 'NEWSLETTER_MANAGE',
    'PROFILE_UPDATE'
  ]
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('arch_user') || sessionStorage.getItem('arch_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Check login on startup and validate token with /auth/me
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = localStorage.getItem('arch_token') || sessionStorage.getItem('arch_token');
      const savedUser = localStorage.getItem('arch_user') || sessionStorage.getItem('arch_user');

      if (token && token !== 'null' && token !== 'undefined') {
        localStorage.setItem('arch_token', token);
        sessionStorage.removeItem('arch_token');

        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            if (isMounted) setUser(parsedUser);
            localStorage.setItem('arch_user', JSON.stringify(parsedUser));
            sessionStorage.removeItem('arch_user');
          } catch (e) {
            console.warn('[AUTH CONTEXT] Failed to parse saved user:', e);
          }
        }

        try {
          const res = await api.get('/auth/me');
          if (isMounted) {
            setUser(res.data);
            localStorage.setItem('arch_user', JSON.stringify(res.data));
          }
        } catch (err) {
          if (err.response && err.response.status === 401) {
            console.error('[AUTH CONTEXT] Session invalid or expired (401):', err);
            if (isMounted) logout();
          } else {
            console.warn('[AUTH CONTEXT] Network/server error during validation. Preserving cached session:', err);
          }
        }
      } else {
        if (isMounted) setUser(null);
      }

      if (isMounted) setLoading(false);
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Multi-tab synchronization and unauthorized event handling
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'arch_token' || e.key === 'arch_user') {
        const token = localStorage.getItem('arch_token');
        const savedUser = localStorage.getItem('arch_user');

        if (!token) {
          setUser(null);
        } else if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (err) {
            console.error('[AUTH CONTEXT] Storage event user parse error:', err);
          }
        }
      }
    };

    const handleUnauthorizedEvent = () => {
      logout();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:unauthorized', handleUnauthorizedEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:unauthorized', handleUnauthorizedEvent);
    };
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const res = await api.post('/auth/login', { email, password, rememberMe });
      const { token } = res.data;
      
      localStorage.setItem('arch_token', token);
      sessionStorage.removeItem('arch_token');

      // Fetch fresh profile from database via /auth/me to ensure single source of truth
      const profileRes = await api.get('/auth/me');
      const userData = profileRes.data;

      localStorage.setItem('arch_user', JSON.stringify(userData));
      sessionStorage.removeItem('arch_user');

      setUser(userData);
      return { success: true, user: userData };
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
    sessionStorage.removeItem('arch_token');
    sessionStorage.removeItem('arch_user');
    setUser(null);
  };

  const updateProfile = async (data) => {
    try {
      await api.put('/auth/profile', data);
      const profileRes = await api.get('/auth/me');
      const updated = profileRes.data;
      setUser(updated);
      localStorage.setItem('arch_user', JSON.stringify(updated));
      return { success: true, user: updated };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile.'
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setUser(prev => prev ? { ...prev, mustChangePassword: false } : null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password.'
      };
    }
  };

  const refreshUser = async () => {
    try {
      const profileRes = await api.get('/auth/me');
      setUser(profileRes.data);
      localStorage.setItem('arch_user', JSON.stringify(profileRes.data));
    } catch (error) {
      console.error('[AUTH CONTEXT] Failed to refresh user profile:', error);
    }
  };

  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    const list = PERMISSION_MATRIX[user.role] || [];
    return list.includes(permission);
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const isCoAdmin = user?.role === 'CO_ADMIN';

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isSuperAdmin,
    isAdmin,
    isCoAdmin,
    hasPermission,
    login,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
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
