import { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.data);
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
    return data;
  };

  const register = async (name, email, password, role) => {
    const data = await authService.register(name, email, password, role);
    setUser(data.data);
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isProjectManager = () => {
    return user?.role === 'project-manager';
  };

  const canManageProjects = () => {
    return user?.role === 'admin' || user?.role === 'project-manager';
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAdmin,
    isProjectManager,
    canManageProjects,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
