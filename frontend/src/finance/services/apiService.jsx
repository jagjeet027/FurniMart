// frontend/src/finance/services/apiService.jsx - FIXED VERSION
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

console.log('🔌 API Base URL:', API_BASE_URL);

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// ✅ Add session ID to requests
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
  
  // Add auth token if exists
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log(`📤 [${config.method?.toUpperCase()}] ${config.url}`);
  return config;
});

// Error handler
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    const url = error.config?.url;
    const status = error.response?.status;
    
    console.error(`❌ API Error [${status}]:`, {
      url,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

// ===== LOAN ENDPOINTS =====

export const getLoans = async (filters = {}) => {
  try {
    console.log('🔍 Fetching loans with filters:', filters);
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
    console.error('❌ Failed to fetch loans:', error.message);
    throw error;
  }
};

export const getLoanById = async (loanId) => {
  try {
    const response = await apiClient.get(`/loans/${loanId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch loan:', error.message);
    throw error;
  }
};

export const getLoansByCountry = async (country) => {
  try {
    const response = await apiClient.get(`/loans-by-country/${country}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch loans by country:', error.message);
    throw error;
  }
};

export const getCountries = async () => {
  try {
    const response = await apiClient.get('/countries');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch countries:', error.message);
    throw error;
  }
};

// ===== APPLICATION TRACKING =====

export const trackLoanApplication = async (loanData) => {
  try {
    console.log('📊 Tracking loan application:', loanData.name);
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
    console.error('⚠️ Failed to track application (non-critical):', error.message);
    // Don't throw - this shouldn't block user flow
    return { success: false };
  }
};

// ===== ANALYTICS =====

export const getApplicationStats = async () => {
  try {
    console.log('📊 Fetching application stats');
    const response = await apiClient.get('/analytics/stats');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch stats:', error.message);
    throw error;
  }
};

export const getPopularLoans = async (limit = 10) => {
  try {
    console.log('⭐ Fetching popular loans');
    const response = await apiClient.get(`/analytics/popular-loans?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch popular loans:', error.message);
    throw error;
  }
};

export const getApplicationAnalytics = async (limit = 50, skip = 0) => {
  try {
    console.log('📈 Fetching application analytics');
    const response = await apiClient.get(`/analytics/applications?limit=${limit}&skip=${skip}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch analytics:', error.message);
    throw error;
  }
};

// ===== ORGANIZATIONS =====

// ✅ FIXED: Submit organization - ensure data is sent correctly
export const submitOrganization = async (organizationData) => {
  try {
    console.log('📝 Submitting organization:', organizationData);
    
    // Validate required fields
    if (!organizationData.organizationName || !organizationData.email || !organizationData.country) {
      throw new Error('Missing required fields: organizationName, email, country');
    }

    const response = await apiClient.post('/organizations', {
      organizationName: organizationData.organizationName,
      organizationType: organizationData.organizationType,
      registrationNumber: organizationData.registrationNumber || '',
      establishedYear: organizationData.establishedYear || new Date().getFullYear(),
      contactPerson: organizationData.contactPerson,
      designation: organizationData.designation || '',
      email: organizationData.email,
      phone: organizationData.phone,
      website: organizationData.website || '',
      address: organizationData.address,
      city: organizationData.city,
      state: organizationData.state || '',
      country: organizationData.country,
      zipCode: organizationData.zipCode || '',
      loanTypes: organizationData.loanTypes || [],
      minLoanAmount: organizationData.minLoanAmount || 0,
      maxLoanAmount: organizationData.maxLoanAmount || 0,
      interestRateRange: organizationData.interestRateRange || '',
      description: organizationData.description || '',
      specialPrograms: organizationData.specialPrograms || '',
      eligibilityCriteria: organizationData.eligibilityCriteria || ''
    });

    console.log('✅ Organization submitted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to submit organization:', error);
    throw error;
  }
};

// ✅ Get organizations with all filters
export const getOrganizations = async (filters = {}) => {
  try {
    console.log('🔍 Fetching organizations with filters:', filters);
    
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.organizationType) params.append('organizationType', filters.organizationType);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.skip) params.append('skip', filters.skip);

    const response = await apiClient.get(`/organizations?${params.toString()}`);
    
    console.log('✅ Organizations fetched:', response.data.data?.length);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch organizations:', error.message);
    throw error;
  }
};

export const getOrganizationById = async (organizationId) => {
  try {
    const response = await apiClient.get(`/organizations/${organizationId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch organization:', error.message);
    throw error;
  }
};

// ✅ Review organization (ADMIN)
export const reviewOrganization = async (organizationId, reviewData) => {
  try {
    console.log('📝 Reviewing organization:', organizationId);
    
    const response = await apiClient.put(`/organizations/${organizationId}/review`, {
      status: reviewData.status,
      reviewNotes: reviewData.reviewNotes || '',
      reviewerName: reviewData.reviewerName
    });
    
    console.log('✅ Review submitted:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Review submission failed:', error);
    throw error;
  }
};

export const getOrganizationStats = async () => {
  try {
    console.log('📊 Fetching organization stats');
    const response = await apiClient.get('/organizations-stats');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch organization stats:', error.message);
    throw error;
  }
};

// ===== ADMIN FUNCTIONS =====

export const addLoan = async (loanData) => {
  try {
    const response = await apiClient.post('/admin/loans', loanData);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to add loan:', error.message);
    throw error;
  }
};

export const updateLoan = async (loanId, loanData) => {
  try {
    const response = await apiClient.put(`/admin/loans/${loanId}`, loanData);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to update loan:', error.message);
    throw error;
  }
};

export const deleteLoan = async (loanId) => {
  try {
    const response = await apiClient.delete(`/admin/loans/${loanId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to delete loan:', error.message);
    throw error;
  }
};

export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
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