import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await authAPI.me();
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
  try {
    const response = await authAPI.login({ email, password });
    const { token, ...userData } = response.data;
    localStorage.setItem('token', token);
    setToken(token);
    setUser(userData);
    toast.success('Login successful!');
    return { success: true };
  } catch (error) {
    // ✅ Get error message from backend
    const message = error.response?.data?.message || 'Invalid email or password. Please try again.';
    // ✅ Don't show toast here - let the component show the error
    // toast.error(message); // ❌ REMOVE THIS - causes double error
    return { success: false, error: message };
  }
};

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      toast.success('Registration successful! Please login.');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const isAdmin = user?.role === 'Admin';
  const isAgent = user?.role === 'Agent' || user?.role === 'TravelAgent';
  const isLocalGuide = user?.role === 'LocalGuide';
  const isTraveler = user?.role === 'Traveler';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        login,
        register,
        logout,
        isAdmin,
        isAgent,
        isLocalGuide,
        isTraveler,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};