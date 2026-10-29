import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  switchRoleDemo: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('staffsync_token'));
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    const savedToken = localStorage.getItem('staffsync_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
    } catch {
      localStorage.removeItem('staffsync_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, pass);
      localStorage.setItem('staffsync_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('staffsync_token');
    setToken(null);
    setUser(null);
  };

  const switchRoleDemo = async (role: UserRole) => {
    let email = 'admin@staffsync.io';
    let pass = 'admin123';
    if (role === 'manager') {
      email = 'manager@staffsync.io';
      pass = 'manager123';
    } else if (role === 'employee') {
      email = 'employee@staffsync.io';
      pass = 'employee123';
    }

    await login(email, pass);
  };

  const refreshUser = async () => {
    try {
      const refreshed = await api.getCurrentUser();
      setUser(refreshed);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        switchRoleDemo,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
