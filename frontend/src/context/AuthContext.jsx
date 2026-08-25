import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token and user exist in storage
    const token = localStorage.getItem('metroToken');
    const storedUser = localStorage.getItem('metroUser');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, phone, password) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, phone, password);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const data = await authService.updateProfile(profileData);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Profile update failed';
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAdmin = user && user.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout, isAuthenticated: !!user, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
