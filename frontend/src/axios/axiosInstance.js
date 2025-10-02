import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api`,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true, // CRITICAL: This sends cookies with every request
  timeout: 10000,
});

// Track if we're currently refreshing to avoid multiple refresh calls
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

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const currentToken = localStorage.getItem("accessToken"); 
    
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
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

    // Handle 401 errors (Unauthorized) - Token expired
    if (error.response.status === 401 && !originalRequest._retry) {
      
      // If this is already a refresh token request that failed, logout
      if (originalRequest.url.includes('/refresh-token')) {
        console.error('Refresh token invalid or expired - logging out');
        handleAuthFailure();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
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

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 Attempting to refresh token...');
        
        // Try to refresh the token
        // The refresh token is sent automatically via cookies (withCredentials: true)
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/users/refresh-token`,
          {}, // Empty body
          {
            withCredentials: true, // Send cookies
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (refreshResponse.data.success && refreshResponse.data.accessToken) {
          const newAccessToken = refreshResponse.data.accessToken;
          
          // Update localStorage
          localStorage.setItem('accessToken', newAccessToken);
          
          // Update default header
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          
          // Update the failed request's header
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          console.log('✅ Token refreshed successfully');
          
          // Process queued requests
          processQueue(null, newAccessToken);
          
          isRefreshing = false;
          
          // Retry the original request
          return api(originalRequest);
        } else {
          throw new Error('Invalid refresh response');
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError.response?.data || refreshError.message);
        
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Refresh failed, logout user
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

// Helper function to handle authentication failure
const handleAuthFailure = () => {
  console.log('🚪 Logging out user...');
  
  // Clear tokens
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userData");
  localStorage.removeItem("refreshToken"); // Just in case it's stored here
  
  // Clear axios default header
  delete api.defaults.headers.common['Authorization'];
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    // Small delay to ensure cleanup completes
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }
};

export default api;