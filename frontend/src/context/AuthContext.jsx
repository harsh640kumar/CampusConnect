import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('cc_token'));
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('cc_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const data = await authAPI.getCurrentUser();
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.warn('Session verification failed, logging out:', err.message);
      localStorage.removeItem('cc_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login({ email, password });
      if (data.success && data.token) {
        localStorage.setItem('cc_token', data.token);
        setToken(data.token);
        setUser(data.user);
        toast({
          title: 'Welcome Back!',
          message: `Signed in as ${data.user.name} (${data.user.role})`,
          type: 'success',
        });
        return { success: true, user: data.user };
      }
    } catch (error) {
      toast({
        title: 'Sign In Failed',
        message: error.message || 'Invalid credentials.',
        type: 'error',
      });
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      if (data.success && data.token) {
        localStorage.setItem('cc_token', data.token);
        setToken(data.token);
        setUser(data.user);
        toast({
          title: 'Account Created!',
          message: `Welcome to CampusConnect, ${data.user.name}!`,
          type: 'success',
        });
        return { success: true, user: data.user };
      }
    } catch (error) {
      toast({
        title: 'Registration Error',
        message: error.message || 'Could not complete registration.',
        type: 'error',
      });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    setToken(null);
    setUser(null);
    toast({
      title: 'Signed Out',
      message: 'You have been safely signed out.',
      type: 'info',
    });
  };

  const updateProfile = async (profileData) => {
    try {
      const data = await authAPI.updateProfile(profileData);
      if (data.success && data.user) {
        setUser((prev) => ({ ...prev, ...data.user }));
        toast({
          title: 'Profile Updated',
          message: 'Your profile changes have been saved.',
          type: 'success',
        });
        return { success: true };
      }
    } catch (error) {
      toast({
        title: 'Update Failed',
        message: error.message || 'Could not update profile.',
        type: 'error',
      });
      return { success: false, error: error.message };
    }
  };

  // Helper for instantaneous demo role switching
  const switchDemoAccount = async (role) => {
    let email = 'student@campusconnect.edu';
    if (role === 'coordinator') email = 'alex.chen@campusconnect.edu';
    if (role === 'admin') email = 'admin@campusconnect.edu';

    return await login(email, 'Password@123');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isCoordinator: user?.role === 'coordinator',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    refreshUser: fetchCurrentUser,
    switchDemoAccount,
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
