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

  // FIXED: Check registration status endpoint
  const checkRegistrationStatus = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (checkingRef.current) {
      console.log('Registration check already in progress, skipping...');
      return;
    }
    
    checkingRef.current = true;
    setCheckingRegistration(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const timestamp = Date.now();
      // FIXED: Use the correct endpoint
      const response = await fetch(`${API_BASE}/check-registration-status?t=${timestamp}`, {
        method: 'GET',
        headers: { 
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setIsRegistered(data.isRegistered);
      console.log('✅ Registration status checked:', data.isRegistered);
      
    } catch (error) {
      console.error('Error checking registration:', error);
      
      // Only show user-friendly error for network issues
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.warn('Server appears to be offline. Using default settings.');
      }
      
      // Set default values on error
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

  // FIXED: Initialize with proper token restoration
  useEffect(() => {
    if (initializedRef.current) return; // Prevent re-initialization
    initializedRef.current = true;
    
    const initializeAuth = async () => {
      console.log('Initializing admin auth context...');
      
      // FIXED: First check localStorage for admin token
      const storedToken = localStorage.getItem('adminToken');
      
      if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
        console.log('Found stored admin token, attempting to restore session...');
        
        // Try to validate the token by making a test request
        try {
          const testResponse = await fetch(`${API_BASE}/refresh-token`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (testResponse.ok) {
            const tokenData = await testResponse.json();
            
            // Update with fresh token
            localStorage.setItem('adminToken', tokenData.token);
            setToken(tokenData.token);
            setUser(tokenData.admin);
            setLastActivity(Date.now());
            setSessionExpiry(Date.now() + (24 * 60 * 60 * 1000));
            
            console.log('✅ Admin session restored with fresh token');
          } else {
            // Token is invalid, clear it
            console.log('Stored admin token is invalid, clearing...');
            localStorage.removeItem('adminToken');
          }
        } catch (error) {
          console.error('Error validating stored admin token:', error);
          localStorage.removeItem('adminToken');
        }
      }
      
      // Restore from session storage as fallback
      try {
        const sessionData = sessionStorage.getItem('admin_session');
        if (sessionData && !token) {
          const parsed = JSON.parse(sessionData);
          const now = Date.now();
          
          // Check if session is still valid
          if (parsed.expiryTime && now < parsed.expiryTime && parsed.token) {
            localStorage.setItem('adminToken', parsed.token);
            setToken(parsed.token);
            setUser(parsed.user);
            setLastActivity(now);
            setSessionExpiry(parsed.expiryTime);
            console.log('✅ Admin session restored from sessionStorage');
          } else {
            // Session expired, clean up
            sessionStorage.removeItem('admin_session');
            console.log('Admin session expired, cleaned up');
          }
        }
      } catch (error) {
        console.error('Session restoration failed:', error);
        sessionStorage.removeItem('admin_session');
      }
      
      // Then check registration status
      await checkRegistrationStatus();
    };

    initializeAuth();
  }, []); // Empty dependency array - only run once

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