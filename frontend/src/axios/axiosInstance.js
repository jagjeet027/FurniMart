import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api`,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Add a request interceptor to handle token injection
api.interceptors.request.use(
  (config) => {
    // Always get the latest token from localStorage
    const currentToken = localStorage.getItem("accessToken"); 
    
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    
    // Ensure CORS headers are properly set
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors and token refresh
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
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await api.post('/auth/refresh-token');
        
        if (refreshResponse.data.accessToken) {
          // Update the token in localStorage
          localStorage.setItem('accessToken', refreshResponse.data.accessToken);
          
          // Update the Authorization header for this request
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
          
          // Retry the original request
          return api(originalRequest);
        } else {
          // Refresh failed, redirect to login
          handleAuthFailure();
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        console.error('Token refresh failed:', refreshError);
        handleAuthFailure();
      }
    }

    // Handle other specific error cases
    switch (error.response.status) {
      case 401:
        console.error("Unauthorized access");
        handleAuthFailure();
        break;
      case 403:
        console.error("Access forbidden");
        break;
      case 429:
        console.error("Too many requests");
        break;
      case 500:
        console.error("Server error");
        break;
      default:
        console.error("Request failed:", error.response.data);
    }

    return Promise.reject(error);
  }
);

// Helper function to handle authentication failure
const handleAuthFailure = () => {
  // Clear tokens
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userData");
  
  // Remove cookies if using js-cookie
  if (typeof window !== 'undefined' && window.Cookies) {
    window.Cookies.remove('refreshToken');
  }
  
  // Redirect to login page (you might want to use your router here)
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

export default api;