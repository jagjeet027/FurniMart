import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api`,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Helper to check if token is expired or about to expire
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    
    // Token is expired or will expire in next 30 seconds
    return exp < (now + 30000);
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

// Helper to refresh token
const refreshAccessToken = async () => {
  try {
    console.log('🔄 Refreshing access token...');
    
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/users/refresh-token`,
      {},
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    if (response.data.success && response.data.accessToken) {
      const newToken = response.data.accessToken;
      localStorage.setItem('accessToken', newToken);
      console.log('✅ Token refreshed successfully');
      return newToken;
    }
    
    throw new Error('Invalid refresh response');
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    throw error;
  }
};

// Helper function to handle authentication failure
const handleAuthFailure = () => {
  console.log('🚪 Logging out user due to auth failure...');
  
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userData");
  localStorage.removeItem("refreshToken");
  
  delete api.defaults.headers.common['Authorization'];
  
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }
};

// Request interceptor - Check token before each request
api.interceptors.request.use(
  async (config) => {
    // Skip token check for refresh-token endpoint
    if (config.url.includes('/refresh-token')) {
      return config;
    }

    let currentToken = localStorage.getItem("accessToken");
    
    // Check if token is expired or about to expire
    if (currentToken && isTokenExpired(currentToken)) {
      console.log('⚠️ Token expired or expiring soon, refreshing before request...');
      
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          currentToken = await refreshAccessToken();
          isRefreshing = false;
          processQueue(null, currentToken);
        } catch (error) {
          isRefreshing = false;
          processQueue(error, null);
          handleAuthFailure();
          return Promise.reject(error);
        }
      } else {
        // Wait for the ongoing refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        });
      }
    }
    
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject({
        message: "Unable to connect to the server. Please check your internet connection.",
        originalError: error
      });
    }

    // Handle 401 errors (Unauthorized)
    if (error.response.status === 401 && !originalRequest._retry) {
      
      // If this is a refresh token request that failed, logout
      if (originalRequest.url.includes('/refresh-token')) {
        console.error('Refresh token invalid or expired - logging out');
        handleAuthFailure();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();
        
        // Update default header
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        
        // Update the failed request's header
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Process queued requests
        processQueue(null, newAccessToken);
        isRefreshing = false;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        handleAuthFailure();
        return Promise.reject(refreshError);
      }
    }

    // Handle other status codes
    switch (error.response.status) {
      case 403:
        console.error("Access forbidden");
        break;
      case 404:
        console.error("Resource not found");
        break;
      case 429:
        console.error("Too many requests");
        break;
      case 500:
        console.error("Server error");
        break;
    }

    return Promise.reject(error);
  }
);

export default api;