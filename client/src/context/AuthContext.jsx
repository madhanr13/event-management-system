/**
 * AuthContext — manages authentication state across the app.
 *
 * Responsibilities:
 *  - Persist JWT in localStorage
 *  - Auto-fetch user profile on mount if a token exists
 *  - Expose login / register / logout / updateProfile helpers
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // ── Bootstrap: fetch the current user when a token already exists ──
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data || data.user || data);
      } catch {
        // Token invalid / expired — clean up
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // ── Login ──────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const jwt = data.token;
    localStorage.setItem('token', jwt);
    setToken(jwt);
    setUser(data.data || data.user);
    return data;
  }, []);

  // ── Register ───────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    const jwt = data.token;
    localStorage.setItem('token', jwt);
    setToken(jwt);
    setUser(data.data || data.user);
    return data;
  }, []);

  // ── Logout ─────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  // ── Update Profile ─────────────────────────────────────────
  const updateProfile = useCallback(async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    setUser(data.user ?? data);
    return data;
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook — use inside any component that needs auth state.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
