// frontend/src/finance/services/apiService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add session ID to requests
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

apiClient.interceptors.request.use((config) => {
  config.headers['x-session-id'] = getSessionId();
  return config;
});

// Error handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ===== LOAN ENDPOINTS =====

export const getLoans = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.country) params.append('country', filters.country);
    if (filters.category) params.append('category', filters.category);
    if (filters.lenderType) params.append('lenderType', filters.lenderType);
    if (filters.minAmount) params.append('minAmount', filters.minAmount);
    if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
    if (filters.collateralRequired !== undefined) params.append('collateralRequired', filters.collateralRequired);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await apiClient.get(`/loans?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch loans:', error);
    throw error;
  }
};

export const getLoanById = async (loanId) => {
  try {
    const response = await apiClient.get(`/loans/${loanId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch loan:', error);
    throw error;
  }
};

export const getLoansByCountry = async (country) => {
  try {
    const response = await apiClient.get(`/loans-by-country/${country}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch loans by country:', error);
    throw error;
  }
};

export const getCountries = async () => {
  try {
    const response = await apiClient.get('/countries');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch countries:', error);
    throw error;
  }
};

// ===== APPLICATION TRACKING =====

export const trackLoanApplication = async (loanData) => {
  try {
    const response = await apiClient.post('/track-application', {
      loanId: loanData.id,
      loanName: loanData.name,
      lender: loanData.lender,
      country: loanData.country,
      category: loanData.category,
      lenderType: loanData.lenderType,
      applicationUrl: loanData.applicationUrl
    });
    return response.data;
  } catch (error) {
    console.error('Failed to track application:', error);
    // Don't throw - this shouldn't block user flow
    return { success: false };
  }
};

// ===== ANALYTICS =====

export const getApplicationStats = async () => {
  try {
    const response = await apiClient.get('/analytics/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    throw error;
  }
};

export const getPopularLoans = async (limit = 10) => {
  try {
    const response = await apiClient.get(`/analytics/popular-loans?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch popular loans:', error);
    throw error;
  }
};

export const getApplicationAnalytics = async (limit = 50, skip = 0) => {
  try {
    const response = await apiClient.get(`/analytics/applications?limit=${limit}&skip=${skip}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    throw error;
  }
};

// ===== ORGANIZATIONS =====

export const submitOrganization = async (organizationData) => {
  try {
    const response = await apiClient.post('/organizations', organizationData);
    return response.data;
  } catch (error) {
    console.error('Failed to submit organization:', error);
    throw error;
  }
};

export const getOrganizations = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.organizationType) params.append('organizationType', filters.organizationType);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.skip) params.append('skip', filters.skip);

    const response = await apiClient.get(`/organizations?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
    throw error;
  }
};

export const getOrganizationById = async (organizationId) => {
  try {
    const response = await apiClient.get(`/organizations/${organizationId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch organization:', error);
    throw error;
  }
};

export const reviewOrganization = async (organizationId, reviewData) => {
  try {
    const response = await apiClient.put(`/organizations/${organizationId}/review`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Failed to review organization:', error);
    throw error;
  }
};

export const getOrganizationStats = async () => {
  try {
    const response = await apiClient.get('/organizations-stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch organization stats:', error);
    throw error;
  }
};

// ===== ADMIN FUNCTIONS =====

export const addLoan = async (loanData) => {
  try {
    const response = await apiClient.post('/admin/loans', loanData);
    return response.data;
  } catch (error) {
    console.error('Failed to add loan:', error);
    throw error;
  }
};

export const updateLoan = async (loanId, loanData) => {
  try {
    const response = await apiClient.put(`/admin/loans/${loanId}`, loanData);
    return response.data;
  } catch (error) {
    console.error('Failed to update loan:', error);
    throw error;
  }
};

export const deleteLoan = async (loanId) => {
  try {
    const response = await apiClient.delete(`/admin/loans/${loanId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete loan:', error);
    throw error;
  }
};

export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export default {
  getLoans,
  getLoanById,
  getLoansByCountry,
  getCountries,
  trackLoanApplication,
  getApplicationStats,
  getPopularLoans,
  getApplicationAnalytics,
  submitOrganization,
  getOrganizations,
  getOrganizationById,
  reviewOrganization,
  getOrganizationStats,
  addLoan,
  updateLoan,
  deleteLoan,
  healthCheck
};