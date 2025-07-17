import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '../axios/axiosInstance';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on mount and handle token refresh
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
          const response = await api.post('/auth/refresh-token', {}, {
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
            // If refresh fails, clean up
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
        setError(err.message);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password }, {
        withCredentials: true, // Important for receiving cookies
      });
  
      const data = response.data;
      
      // Store tokens and user data
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };
  
  const handleLogout = async () => {
    try {
      await api.post('/users/logout', {}, {
        withCredentials: true,
      });
    } finally {
      // Clean up regardless of server response
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
      Cookies.remove('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

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

  // Fixed refreshUserData function
  const refreshUserData = async () => {
    try {
      const response = await api.get('/users/me', {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const updatedUser = response.data;
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error("Error refreshing user data:", err);
      setError(err.response?.data?.message || "Failed to refresh user data");
      return { success: false, error: err.response?.data?.message || "Failed to refresh user data" };
    }
  };

  // New function to update user to manufacturer
  const updateUserToManufacturer = async (manufacturerData) => {
    try {
      const response = await api.put('/users/me', manufacturerData, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const updatedUser = response.data;
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error("Error updating user to manufacturer:", err);
      setError(err.response?.data?.message || "Failed to update user to manufacturer");
      return { 
        success: false, 
        error: err.response?.data?.message || "Failed to update user to manufacturer" 
      };
    }
  };

  // Alternative function for manufacturer registration
  const registerAsManufacturer = async (manufacturerData) => {
    try {
      const response = await api.post('/manufacturers/register', manufacturerData, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        withCredentials: true,
      });

      const updatedUser = response.data.user || response.data;
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error("Error registering as manufacturer:", err);
      setError(err.response?.data?.message || "Failed to register as manufacturer");
      return { 
        success: false, 
        error: err.response?.data?.message || "Failed to register as manufacturer" 
      };
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

export const useAuth = () => useContext(AuthContext);

export default AuthContext;