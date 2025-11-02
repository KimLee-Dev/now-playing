import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async () => {
    try {
      const authUrl = await authService.login();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleCallback = async (code: string) => {
    try {
      const user = await authService.handleCallback(code);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Callback handling failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = authService.isAuthenticated();

  return {
    user,
    loading,
    isAuthenticated,
    login,
    handleCallback,
    logout,
  };
};
