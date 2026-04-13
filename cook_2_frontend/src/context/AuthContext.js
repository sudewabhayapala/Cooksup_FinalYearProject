import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    return savedToken;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set default authorization header when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const register = async (email, password, firstName, lastName, phone, userType, location, postalCode, level2CertificationNumber) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        firstName,
        lastName,
        phone,
        userType,
        location,
        postalCode,
        level2CertificationNumber
      });

      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const getCurrentUser = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/profile`);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (err) {
      console.error('Error fetching current user:', err);
      // Only logout on authentication errors (401), not on other errors like network issues
      if (err.response?.status === 401) {
        logout();
      }
      throw err;
    }
  }, [logout]);

  const updateCurrentUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const updateProfile = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, payload);
      const profile = response.data?.profile;
      if (profile) {
        updateCurrentUser(profile);
      }
      return profile;
    } catch (err) {
      const message = err.response?.data?.error || 'Profile update failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [updateCurrentUser]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      error,
      register,
      login,
      logout,
      getCurrentUser,
      updateProfile,
      updateCurrentUser,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
