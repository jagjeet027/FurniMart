// axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // ✅ FIXED: Look for 'adminToken' instead of 'token'
    const token = localStorage.getItem('adminToken');
    
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No valid token found for request:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    const url = error.config?.url;
    const status = error.response?.status;
    
    console.error('❌ Response error:', {
      url,
      method: error.config?.method,
      status,
      data: error.response?.data
    });

    // Handle 401 errors
    if (status === 401) {
      localStorage.removeItem('adminToken');
      
      // Optional: Trigger logout in your app
      window.dispatchEvent(new CustomEvent('admin-unauthorized'));
    }

    // Create user-friendly error
    const customError = new Error();
    
    if (error.response) {
      customError.message = error.response.data?.message || 
                           `Server error: ${status}`;
      customError.status = status;
    } else if (error.request) {
      customError.message = 'Unable to connect to server. Please check your connection.';
    } else {
      customError.message = error.message || 'An unexpected error occurred';
    }
    
    customError.response = error.response;
    return Promise.reject(customError);
  }
);

export default api;