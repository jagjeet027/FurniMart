import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '../axios/axiosInstance';

const AuthContext = createContext(null);

// Helper to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    const now = Date.now();
    
    // Token is expired or will expire in next 60 seconds
    return exp < (now + 60000);
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

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

        console.log('🔍 Initializing auth...', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken,
          isAccessTokenExpired: accessToken ? isTokenExpired(accessToken) : 'N/A'
        });

        // No tokens at all
        if (!accessToken && !refreshToken) {
          console.log('❌ No tokens found');
          setIsLoading(false);
          return;
        }

        // Access token is missing or expired, but we have refresh token
        if ((!accessToken || isTokenExpired(accessToken)) && refreshToken) {
          console.log('🔄 Access token expired/missing, attempting refresh...');
          
          try {
            const response = await api.post('/users/refresh-token', {}, {
              withCredentials: true,
            });

            if (response.data.success && response.data.accessToken) {
              console.log('✅ Token refreshed successfully');
              localStorage.setItem('accessToken', response.data.accessToken);
              setIsAuthenticated(true);
              
              const userData = localStorage.getItem('userData');
              if (userData) {
                setUser(JSON.parse(userData));
              }
            } else {
              throw new Error('Invalid refresh response');
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            handleLogout();
          }
        } else if (accessToken && !isTokenExpired(accessToken)) {
          // Valid access token exists
          console.log('✅ Valid access token found');
          setIsAuthenticated(true);
          const userData = localStorage.getItem('userData');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        } else {
          // No valid tokens
          console.log('❌ No valid tokens');
          handleLogout();
        }
      } catch (err) {
        console.error('❌ Auth initialization error:', err);
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
      console.log('🔐 Attempting login...');
      
      const response = await api.post('/users/login', { email, password }, {
        withCredentials: true,
      });
  
      const data = response.data;
      
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }
      
      console.log('✅ Login successful');
      
      // Store tokens and user data
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      setUser(data.user);
      setIsAuthenticated(true);
      setError(null);
      
      return data;
    } catch (err) {
      console.error('❌ Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    }
  };
  
  // Logout function
  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      await api.post('/users/logout', {}, {
        withCredentials: true,
      });
    } catch (err) {
      console.error('❌ Logout error:', err);
    } finally {
      // Clean up regardless of server response
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
      Cookies.remove('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      console.log('✅ Logout complete');
    }
  };

  // Refresh user data from server
  const refreshUserData = async () => {
    try {
      console.log('🔄 Refreshing user data...');
      
      const response = await api.get('/users/me');

      if (response.data.success) {
        const updatedUser = response.data.user;
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        console.log('✅ User data refreshed');
        return { success: true, user: updatedUser };
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (err) {
      console.error("❌ Error refreshing user data:", err);
      const errorMessage = err.response?.data?.message || "Failed to refresh user data";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update user to manufacturer
  const updateUserToManufacturer = async (manufacturerData) => {
    try {
      console.log('🏭 Updating user to manufacturer...');
      
      const response = await api.put('/users/me', manufacturerData);

      if (response.data.success) {
        const updatedUser = response.data.user;
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        console.log('✅ User updated to manufacturer');
        return { success: true, user: updatedUser };
      } else {
        throw new Error('Failed to update user');
      }
    } catch (err) {
      console.error("❌ Error updating user to manufacturer:", err);
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
      console.log('🏭 Registering as manufacturer...');
      
      const response = await api.post('/manufacturers/register', manufacturerData, {
        withCredentials: true,
      });

      if (response.data.success || response.status === 200 || response.status === 201) {
        const updatedUser = response.data.user || response.data;
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        console.log('✅ Manufacturer registration successful');
        return { success: true, user: updatedUser };
      } else {
        throw new Error('Failed to register as manufacturer');
      }
    } catch (err) {
      console.error("❌ Error registering as manufacturer:", err);
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
      console.log('🔄 Updating user role...');
      
      const response = await api.post('/manufacturers/register', formDataToSend, {
        withCredentials: true,
      });
  
      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to update manufacturer status');
      }
  
      const updatedUser = { ...user, isManufacturer };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
  
      console.log('✅ User role updated');
      return true;
    } catch (err) {
      console.error('❌ Error updating user role:', err);
      throw err;
    }
  };

  // Validate current token
  const validateToken = () => {
    const token = localStorage.getItem('accessToken');
    return token && !isTokenExpired(token);
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
      registerAsManufacturer,
      validateToken
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