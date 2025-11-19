import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  // FIX: Updated login function to return the user object for immediate use after login.
  login: (email: string, password: string) => Promise<User>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (token: string, user: User) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const response = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    if (response.token && response.user) {
      handleAuthSuccess(response.token, response.user);
      // FIX: Return the user object.
      return response.user;
    } else {
      throw new Error('Login failed. Please check your credentials.');
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    // The register endpoint on the provided API doc does not return a token.
    // The user will need to log in after registering.
    const response = await api.post<{ message: string; user: User }>('/auth/register', userData);
    if (!response.user) {
      throw new Error('Registration failed. Please try again.');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    // Redirect logic will be in components that use this
  }, []);

  const value = {
    isAuthenticated: !!token && !!user,
    user,
    token,
    login,
    register,
    logout,
    isLoading
  };
  
  // No full-screen loader to avoid layout shifts during initial load
  // Components can use `isLoading` to show their own loaders if needed
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
