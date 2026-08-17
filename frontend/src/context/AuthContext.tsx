import React, { createContext, useState, useEffect, useContext } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('teacher_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Set up token validation on mount
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // Do not force log out on network glitch, just handle loading state
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: 'Login failed. Please check credentials.' }));
        throw new Error(errData.detail || 'Login failed.');
      }

      const data = await response.json();
      const tokenVal = data.access_token;
      
      localStorage.setItem('teacher_token', tokenVal);
      setToken(tokenVal);
      
      // The profile hook will fetch the user info automatically once token is set
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in.');
      setLoading(false);
      throw err;
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: 'Registration failed. Choose a different email.' }));
        throw new Error(errData.detail || 'Registration failed.');
      }

      // Automatically log in after registration
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('teacher_token');
    setToken(null);
    setUser(null);
    setError(null);
    setLoading(false);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
