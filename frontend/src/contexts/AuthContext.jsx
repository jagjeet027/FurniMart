import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '../axios/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = Cookies.get('refreshToken');

        if (!accessToken && !refreshToken) {
          setIsLoading(false);
          return;
        }

        if (!accessToken && refreshToken) {
          // Try to refresh the token
          const response = await api.post('/users/refresh-token', {}, {
            withCredentials: true, 
          });

          if (response.status === 200) {
            const data = response.data;
            localStorage.setItem('accessToken', data.accessToken);
            setIsAuthenticated(true);
            const userData = localStorage.getItem('userData');
            if (userData) {
              setUser(JSON.parse(userData));
            }
          } else {
            handleLogout();
          }
        } else if (accessToken) {
          // Validate existing access token
          setIsAuthenticated(true);
          const userData = localStorage.getItem('userData');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password }, {
        withCredentials: true,
      });
  
      const data = response.data;
      
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store tokens and user data
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      setUser(data.user);
      setIsAuthenticated(true);
      setError(null);
      
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    }
  };
  
  // Logout function
  const handleLogout = async () => {
    try {
      await api.post('/users/logout', {}, {
        withCredentials: true,
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clean up regardless of server response
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
      Cookies.remove('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  // Refresh user data from server
  const refreshUserData = async () => {
    try {
      const response = await api.get('/users/me', {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.data.success) {
        const updatedUser = response.data.user;
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        return { success: true, user: updatedUser };
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (err) {
      console.error("Error refreshing user data:", err);
      const errorMessage = err.response?.data?.message || "Failed to refresh user data";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update user to manufacturer
  const updateUserToManufacturer = async (manufacturerData) => {
    try {
      const response = await api.put('/users/me', manufacturerData, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.data.success) {
        const updatedUser = response.data.user;
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        return { success: true, user: updatedUser };
      } else {
        throw new Error('Failed to update user');
      }
    } catch (err) {
      console.error("Error updating user to manufacturer:", err);
      const errorMessage = err.response?.data?.message || "Failed to update user to manufacturer";
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // Register as manufacturer
  const registerAsManufacturer = async (manufacturerData) => {
    try {
      const response = await api.post('/manufacturers/register', manufacturerData, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        withCredentials: true,
      });

      if (response.data.success || response.status === 200 || response.status === 201) {
        const updatedUser = response.data.user || response.data;
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        return { success: true, user: updatedUser };
      } else {
        throw new Error('Failed to register as manufacturer');
      }
    } catch (err) {
      console.error("Error registering as manufacturer:", err);
      const errorMessage = err.response?.data?.message || "Failed to register as manufacturer";
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // Update user role (legacy support)
  const updateUserRole = async (isManufacturer, formDataToSend) => {
    try {
      const response = await api.post('/manufacturers/register', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        withCredentials: true,
      });
  
      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to update manufacturer status');
      }
  
      const updatedUser = { ...user, isManufacturer };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
  
      return true;
    } catch (err) {
      console.error('Error updating user role:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      login,
      logout: handleLogout,
      error,
      isLoading,
      updateUserRole,
      refreshUserData,
      updateUserToManufacturer,
      registerAsManufacturer
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;