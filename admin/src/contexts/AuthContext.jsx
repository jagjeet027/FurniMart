// ==================== src/contexts/AuthContext.jsx ====================
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import { STORAGE_KEYS } from '../utils/constants';

// Create Auth Context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  });

  // Initialize authentication on app load
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const result = await apiService.verifyToken(token);
          if (result.success) {
            setUser(result.user);
            // Store user data in localStorage for quick access
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(result.user));
          } else {
            throw new Error('Token verification failed');
          }
        } catch (error) {
          console.error('Authentication initialization failed:', error);
          // Clear invalid token and user data
          clearAuthData();
        }
      } else {
        // If no token, check if we have cached user data
        const cachedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser);
            // Only use cached data if it's recent (within 24 hours)
            if (userData.cachedAt && Date.now() - userData.cachedAt < 24 * 60 * 60 * 1000) {
              setUser(userData);
            } else {
              localStorage.removeItem(STORAGE_KEYS.USER_DATA);
            }
          } catch (error) {
            console.error('Error parsing cached user data:', error);
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  // Clear authentication data
  const clearAuthData = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    setToken(null);
    setUser(null);
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await apiService.login(email, password);
      
      if (result.success) {
        // Store token and user data with timestamp
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, result.token);
        const userDataWithTimestamp = {
          ...result.user,
          cachedAt: Date.now()
        };
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userDataWithTimestamp));
        
        setToken(result.token);
        setUser(result.user);
        
        return { success: true, user: result.user };
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      
      if (token) {
        await apiService.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
      setLoading(false);
    }
  };

  // Update user profile
  const updateUser = (updatedUserData) => {
    const newUserData = { 
      ...user, 
      ...updatedUserData,
      cachedAt: Date.now()
    };
    setUser(newUserData);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUserData));
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.some(role => user?.role === role);
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!token) return;

    try {
      const result = await apiService.verifyToken(token);
      if (result.success) {
        const userDataWithTimestamp = {
          ...result.user,
          cachedAt: Date.now()
        };
        setUser(result.user);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userDataWithTimestamp));
        return result.user;
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      clearAuthData();
    }
  };

  const contextValue = {
    // State
    user,
    token,
    loading,
    isAuthenticated: !!user,
    
    // Methods
    login,
    logout,
    updateUser,
    refreshUser,
    
    // Role checking utilities
    hasRole,
    hasAnyRole,
    
    // User utilities
    isAdmin: user?.role === 'admin',
    isSuperAdmin: user?.role === 'super_admin',
    userName: user?.name || user?.email || 'User',
    userEmail: user?.email || '',
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};