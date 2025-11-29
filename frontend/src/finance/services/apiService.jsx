import axios from 'axios';

// API base URL - adjust this based on your backend server
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL  || 'http://localhost:5000/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Track loan application click
export const trackLoanApplication = async (loanData) => {
  try {
    const response = await apiClient.post('/track-application', {
      loanId: loanData.id,
      loanName: loanData.name,
      lender: loanData.lender,
      country: loanData.country,
      category: loanData.category,
      lenderType: loanData.lenderType,
      applicationUrl: loanData.applicationUrl,
    });
    
    console.log('Successfully tracked loan application:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to track loan application:', error);
    // Don't throw error to prevent disrupting user flow
    return { success: false, error: error.message };
  }
};

// Get application analytics (for admin/dashboard use)
export const getApplicationAnalytics = async (limit = 50, offset = 0) => {
  try {
    const response = await apiClient.get('/analytics/applications', {
      params: { limit, offset }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch application analytics:', error);
    throw error;
  }
};

// Get application statistics
export const getApplicationStats = async () => {
  try {
    const response = await apiClient.get('/analytics/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch application stats:', error);
    throw error;
  }
};

// Get popular loans
export const getPopularLoans = async () => {
  try {
    const response = await apiClient.get('/analytics/popular-loans');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch popular loans:', error);
    throw error;
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

// Generic analytics tracking (for future use)
export const trackAnalyticsEvent = async (eventData) => {
  try {
    // This could be extended for other analytics events
    console.log('Analytics event:', eventData);
    return { success: true };
  } catch (error) {
    console.error('Failed to track analytics event:', error);
    return { success: false, error: error.message };
  }
};

export default {
  trackLoanApplication,
  getApplicationAnalytics,
  getApplicationStats,
  getPopularLoans,
  healthCheck,
  trackAnalyticsEvent,
};