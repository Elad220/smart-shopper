import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as api from '../src/services/api';

export interface User {
  id: string;
  email: string;
  username: string;
  token: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => 
    localStorage.getItem('authToken')
  );
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Update authentication status whenever user or token changes
  useEffect(() => {
    setIsAuthenticated(!!user && !!token);
  }, [user, token]);

  const login = useCallback(async (credentials: { email?: string; username?: string; password: string }) => {
    setIsLoading(true);
    try {
      const data = await api.loginUserFlexible(credentials);
      const userData: User = {
        id: data.userId,
        email: data.user?.email || credentials.email || '',
        username: data.user?.username || credentials.username || '',
        token: data.token,
      };
      
      setUser(userData);
      setToken(data.token);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      toast.success(`Welcome back, ${userData.username || userData.email}! 🎉`, {
        duration: 8000, // Show login toast for 8 seconds
      });
      
      // Allow time for the toast to be seen before reloading
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      return { success: true };
    } catch (error: any) {
      const message = error.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: { username: string; email: string; password: string }) => {
    setIsLoading(true);
    try {
      await api.registerUser(data.username, data.email, data.password);
      toast.success('Account created successfully! 🎊');
      return { success: true };
    } catch (error: any) {
      const message = error.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('selectedListId');
    toast.success('Logged out successfully! 👋');
    
    // Redirect to landing page after logout
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, []);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };
};