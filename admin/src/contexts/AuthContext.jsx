import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';

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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [checkingRegistration, setCheckingRegistration] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Use ref to prevent multiple simultaneous calls
  const checkingRef = useRef(false);
  const initializedRef = useRef(false);
  const refreshPromiseRef = useRef(null);

  const API_BASE = 'http://localhost:5000/api/admin';

  // Enhanced login with proper token storage
  const login = async (credentials) => {
    setLoading(true);
    try {
      // Input validation
      if (!credentials.adminId?.trim()) {
        return { success: false, error: 'Admin ID is required' };
      }
      if (!credentials.password?.trim()) {
        return { success: false, error: 'Password is required' };
      }
      if (!credentials.secretCode?.trim()) {
        return { success: false, error: 'Secret code is required' };
      }

      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          ...credentials,
          timestamp: Date.now()
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // FIXED: Store token in localStorage for axios to access
        localStorage.setItem('adminToken', data.token);
        
        setToken(data.token);
        setUser(data.admin);
        setLastActivity(Date.now());
        setSessionExpiry(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
        
        // Enhanced session storage
        const sessionData = {
          token: data.token,
          user: data.admin,
          loginTime: Date.now(),
          expiryTime: Date.now() + (24 * 60 * 60 * 1000)
        };
        
        try {
          sessionStorage.setItem('admin_session', JSON.stringify(sessionData));
        } catch (storageError) {
          console.warn('Session storage failed:', storageError);
        }
        
        console.log('✅ Admin login successful, token stored');
        return { success: true, data };
      } else {
        return { 
          success: false, 
          error: data.message || `Login failed: ${response.status}` 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { success: false, error: 'Unable to connect to server. Please check if the server is running.' };
      }
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced registration with proper token storage
  const register = async (userData) => {
    setLoading(true);
    try {
      // Enhanced validation
      const errors = [];
      
      if (!userData.email?.trim()) errors.push('Email is required');
      if (!userData.password?.trim()) errors.push('Password is required');
      if (!userData.secretCode?.trim()) errors.push('Secret code is required');
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (userData.email && !emailRegex.test(userData.email.trim())) {
        errors.push('Please enter a valid email address');
      }

      // Password strength validation
      if (userData.password) {
        if (userData.password.length < 8) {
          errors.push('Password must be at least 8 characters long');
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
          errors.push('Password must contain uppercase, lowercase, and number');
        }
      }

      if (errors.length > 0) {
        return { success: false, error: errors[0] };
      }

      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          ...userData,
          email: userData.email.trim().toLowerCase(),
          registrationTime: Date.now()
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // FIXED: Store token in localStorage for axios to access
        localStorage.setItem('adminToken', data.token);
        
        setToken(data.token);
        setUser(data.admin);
        setIsRegistered(true);
        setLastActivity(Date.now());
        setSessionExpiry(Date.now() + (24 * 60 * 60 * 1000));
        
        // Store session data
        const sessionData = {
          token: data.token,
          user: data.admin,
          loginTime: Date.now(),
          expiryTime: Date.now() + (24 * 60 * 60 * 1000)
        };
        
        try {
          sessionStorage.setItem('admin_session', JSON.stringify(sessionData));
        } catch (storageError) {
          console.warn('Session storage failed:', storageError);
        }
        
        console.log('✅ Admin registration successful, token stored');
        return { success: true, data };
      } else {
        return { 
          success: false, 
          error: data.message || `Registration failed: ${response.status}` 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { success: false, error: 'Unable to connect to server. Please check if the server is running.' };
      }
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced logout with complete cleanup
  const logout = useCallback(() => {
    // FIXED: Clear localStorage token
    localStorage.removeItem('adminToken');
    
    setToken(null);
    setUser(null);
    setLastActivity(null);
    setSessionExpiry(null);
    setRefreshing(false);
    
    // Clear refresh promise
    refreshPromiseRef.current = null;
    
    // Clear all stored data
    try {
      sessionStorage.removeItem('admin_session');
      sessionStorage.removeItem('admin_preferences');
      localStorage.removeItem('admin_settings');
    } catch (error) {
      console.warn('Storage cleanup failed:', error);
    }
    
    console.log('✅ Admin logout complete, all tokens cleared');
  }, []);

  const checkRegistrationStatus = useCallback(async () => {
  // Prevent duplicate calls
  if (checkingRef.current) return;
  
  checkingRef.current = true;
  setCheckingRegistration(true);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(
      `${API_BASE}/check-registration-status?t=${Date.now()}`,
      {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      setIsRegistered(data.isRegistered ?? false);
      console.log('✅ Registration status checked:', data.isRegistered);
    } else {
      console.warn('Registration check returned status:', response.status);
      setIsRegistered(false);
    }
  } catch (error) {
    console.warn('Registration check error:', error.message);
    setIsRegistered(false);
  } finally {
    setCheckingRegistration(false);
    checkingRef.current = false;
  }
}, [API_BASE]);

  // Enhanced token refresh with proper localStorage sync
  const refreshToken = useCallback(async () => {
    // Return early if no token or already refreshing
    if (!token || refreshing) {
      return false;
    }

    // If there's already a refresh in progress, wait for it
    if (refreshPromiseRef.current) {
      return await refreshPromiseRef.current;
    }

    // Create new refresh promise
    const refreshPromise = (async () => {
      setRefreshing(true);
      
      try {
        console.log('Refreshing admin token...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch(`${API_BASE}/refresh-token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          
          // Validate response data
          if (!data.token) {
            throw new Error('Invalid refresh response: missing token');
          }
          
          console.log('✅ Admin token refreshed successfully');
          
          // FIXED: Update localStorage with new token
          localStorage.setItem('adminToken', data.token);
          
          // Update state
          setToken(data.token);
          setSessionExpiry(Date.now() + (24 * 60 * 60 * 1000));
          setLastActivity(Date.now());
          
          // Update session storage
          try {
            const existingSession = sessionStorage.getItem('admin_session');
            const sessionData = existingSession ? JSON.parse(existingSession) : {};
            
            sessionData.token = data.token;
            sessionData.refreshedAt = Date.now();
            sessionData.expiryTime = Date.now() + (24 * 60 * 60 * 1000);
            
            sessionStorage.setItem('admin_session', JSON.stringify(sessionData));
          } catch (storageError) {
            console.warn('Session storage update failed:', storageError);
          }
          
          return true;
        } else {
          // Handle different error responses
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || `Refresh failed: ${response.status}`;
          
          console.error('Token refresh failed:', errorMessage);
          
          // If token is invalid/expired, logout user
          if (response.status === 401 || response.status === 403) {
            console.log('Admin token expired, logging out user');
            logout();
          }
          
          return false;
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        
        // Handle specific error types
        if (error.name === 'AbortError') {
          console.warn('Token refresh timed out');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
          console.warn('Network error during token refresh');
        } else {
          console.error('Unexpected error during token refresh:', error);
        }
        
        return false;
      } finally {
        setRefreshing(false);
        refreshPromiseRef.current = null;
      }
    })();

    // Store the promise to prevent duplicate calls
    refreshPromiseRef.current = refreshPromise;
    
    return await refreshPromise;
  }, [token, refreshing, logout, API_BASE]);

  // Update activity with throttling
  const updateActivity = useCallback((() => {
    let lastUpdate = 0;
    return () => {
      const now = Date.now();
      if (now - lastUpdate > 60000) { // Throttle to once per minute
        setLastActivity(now);
        lastUpdate = now;
      }
    };
  })(), []);

  useEffect(() => {
  if (initializedRef.current) return;
  initializedRef.current = true;
  
  const initializeAuth = async () => {
    console.log('Initializing admin auth context...');
    
    try {
      // Check localStorage for token
      const storedToken = localStorage.getItem('adminToken');
      
      if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
        console.log('Found stored token, attempting to validate...');
        
        try {
          const response = await fetch(`${API_BASE}/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setToken(storedToken);
            setUser(data.data);
            setLastActivity(Date.now());
            setSessionExpiry(Date.now() + (24 * 60 * 60 * 1000));
            console.log('✅ Session restored from stored token');
          } else if (response.status === 401) {
            console.log('Stored token is invalid, clearing...');
            localStorage.removeItem('adminToken');
          }
        } catch (validationError) {
          console.warn('Token validation failed:', validationError.message);
          localStorage.removeItem('adminToken');
        }
      } else {
        console.log('No stored token found');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      // Check registration status - separate from token check
      setTimeout(() => {
        checkRegistrationStatus().catch(err => 
          console.warn('Registration check failed:', err.message)
        );
      }, 500);
    }
  };

  initializeAuth();
}, []);

  // Session management with better refresh timing
  useEffect(() => {
    if (!token) return;

    const checkSession = async () => {
      const now = Date.now();
      
      // Check session expiry
      if (sessionExpiry && now > sessionExpiry) {
        console.log('Admin session expired, logging out');
        logout();
        return;
      }
      
      // Check inactivity (30 minutes)
      const inactiveTime = now - lastActivity;
      const maxInactiveTime = 30 * 60 * 1000;

      if (inactiveTime > maxInactiveTime) {
        console.log('Admin session inactive, logging out');
        logout();
        return;
      }
      
      // Auto-refresh token if needed (refresh 2 hours before expiry)
      if (sessionExpiry && (sessionExpiry - now) < (2 * 60 * 60 * 1000)) {
        console.log('Admin token approaching expiry, attempting refresh');
        const refreshSuccess = await refreshToken();
        
        if (!refreshSuccess) {
          console.log('Admin token refresh failed, logging out');
          logout();
        }
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [token, lastActivity, sessionExpiry, logout, refreshToken]);

  // Network status monitoring with token refresh
  useEffect(() => {
    const handleOnline = async () => {
      if (token && navigator.onLine) {
        console.log('Network back online, refreshing admin token...');
        // Small delay to ensure connection is stable
        setTimeout(async () => {
          const success = await refreshToken();
          if (success) {
            console.log('Admin token refreshed after network reconnection');
          }
        }, 2000);
      }
    };

    const handleOffline = () => {
      console.log('Network went offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [token, refreshToken]);

  // Manual refresh token method that can be called from components
  const manualRefreshToken = useCallback(async () => {
    if (!token) {
      return { success: false, error: 'No admin token available' };
    }

    const success = await refreshToken();
    return { 
      success, 
      error: success ? null : 'Failed to refresh admin token'
    };
  }, [token, refreshToken]);

  const contextValue = {
    // State
    user,
    token,
    loading,
    isRegistered,
    lastActivity,
    sessionExpiry,
    checkingRegistration,
    refreshing,
    
    // Methods
    login,
    register,
    logout,
    checkRegistrationStatus,
    refreshToken,
    manualRefreshToken,
    updateActivity,
    
    // Config
    API_BASE,
    
    // Utils
    isAuthenticated: !!token && !!user,
    isSessionValid: sessionExpiry ? Date.now() < sessionExpiry : false,
    timeToExpiry: sessionExpiry ? Math.max(0, sessionExpiry - Date.now()) : 0
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;