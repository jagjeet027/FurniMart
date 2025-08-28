// axiosInstance.js - Replace with this improved version:
import axios from 'axios';

const api = axios.create({
  baseURL:'http://localhost:5000/api',
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Create a more user-friendly error object
    const customError = {
      message: 'Network Error',
      originalError: error,
      status: error.response?.status,
      data: error.response?.data
    };

    if (error.response) {
      // Server responded with error status
      customError.message = error.response.data?.message || 
                            `Server error: ${error.response.status}`;
      
      if (error.response.status === 401) {
        customError.message = 'Authentication failed';
        localStorage.removeItem('token');
        // Don't redirect here, let components handle it
      }
    } else if (error.request) {
      // Network error
      customError.message = 'Unable to connect to the server. Please check your internet connection.';
    } else {
      // Other error
      customError.message = error.message || 'An unexpected error occurred';
    }

    return Promise.reject(customError);
  }
);

export default api;