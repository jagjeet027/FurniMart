// ============================================
// FIXED: axiosInstance.js
// ============================================
import axios from "axios";

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

// ⚡ FIXED: Token expiry check - only check if truly expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    const now = Date.now();
    
    // ✅ FIXED: Only consider expired if ACTUALLY expired (no buffer)
    // This prevents unnecessary refresh calls
    return exp < now;
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

// Handle auth failure
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

// ⚡ FIXED: Request interceptor - NO preemptive refresh
api.interceptors.request.use(
  async (config) => {
    // Skip token check for refresh-token endpoint
    if (config.url.includes('/refresh-token')) {
      return config;
    }

    const currentToken = localStorage.getItem("accessToken");
    
    // ✅ FIXED: Only add token, don't check expiry here
    // Let the server handle token validation
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ⚡ FIXED: Response interceptor - Only refresh on 401
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

    // ✅ FIXED: Only handle 401 errors from server
    if (error.response.status === 401 && !originalRequest._retry) {
      
      // If refresh token endpoint failed, logout
      if (originalRequest.url.includes('/refresh-token')) {
        console.error('Refresh token invalid or expired - logging out');
        handleAuthFailure();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Queue requests while refreshing
      if (isRefreshing) {
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
        
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        processQueue(null, newAccessToken);
        isRefreshing = false;
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        handleAuthFailure();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;