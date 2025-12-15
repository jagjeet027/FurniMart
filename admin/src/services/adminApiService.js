// frontend/src/finance/services/adminApiService.jsx
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

console.log('🔐 Admin API Base URL:', API_BASE_URL);

// Create axios instance for admin
const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
adminApiClient.interceptors.request.use((config) => {
  // Add auth token
  const token = localStorage.getItem('adminToken') || localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log(`🔐 [ADMIN ${config.method?.toUpperCase()}] ${config.url}`);
  return config;
});

// Response interceptor
adminApiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Admin Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    const url = error.config?.url;
    const status = error.response?.status;
    
    console.error(`❌ Admin API Error [${status}]:`, {
      url,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    
    // Handle unauthorized
    if (status === 401 || status === 403) {
      console.error('🚫 Unauthorized access - redirecting to login');
      // You can add redirect logic here if needed
    }
    
    return Promise.reject(error);
  }
);

// ===== ORGANIZATION MANAGEMENT =====

/**
 * Get all organizations with filters
 */
export const getOrganizations = async (filters = {}) => {
  try {
    console.log('📋 [ADMIN] Fetching organizations with filters:', filters);
    
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.organizationType) params.append('organizationType', filters.organizationType);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.skip !== undefined) params.append('skip', filters.skip);

    const queryString = params.toString();
    const url = queryString ? `finance/organizations?${queryString}` : 'finance/organizations';
    
    const response = await adminApiClient.get(url);
    
    console.log('✅ Organizations fetched:', response.data.data?.length || 0);
    return {
      success: true,
      data: response.data.data || [],
      total: response.data.total || 0
    };
  } catch (error) {
    console.error('❌ Failed to fetch organizations:', error);
    throw error;
  }
};

/**
 * Get organization by ID
 */
export const getOrganizationById = async (organizationId) => {
  try {
    console.log('🔍 [ADMIN] Fetching organization:', organizationId);
    const response = await adminApiClient.get(`finance/organizations/${organizationId}`);
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('❌ Failed to fetch organization:', error);
    throw error;
  }
};

/**
 * Get organization statistics
 */
export const getOrganizationStats = async () => {
  try {
    console.log('📊 [ADMIN] Fetching organization stats');
    const response = await adminApiClient.get('finance/organizations-stats');
    
    return {
      success: true,
      data: response.data.data || {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0
      }
    };
  } catch (error) {
    console.error('❌ Failed to fetch stats:', error);
    throw error;
  }
};

/**
 * Review organization (Approve/Reject)
 */
export const reviewOrganization = async (organizationId, reviewData) => {
  try {
    console.log('📝 [ADMIN] Reviewing organization:', organizationId);
    
    if (!reviewData.status) {
      throw new Error('Status is required');
    }
    if (!reviewData.reviewerName) {
      throw new Error('Reviewer name is required');
    }

    const payload = {
      status: reviewData.status,
      reviewNotes: reviewData.reviewNotes?.trim() || '',
      reviewerName: reviewData.reviewerName.trim()
    };
    
    const response = await adminApiClient.put(
      `finance/organizations/${organizationId}/review`,
      payload
    );
    
    console.log('✅ Review submitted successfully');
    return {
      success: true,
      data: response.data.data,
      message: 'Organization reviewed successfully'
    };
  } catch (error) {
    console.error('❌ Review submission failed:', error);
    throw error;
  }
};

/**
 * Delete organization
 */
export const deleteOrganization = async (organizationId) => {
  try {
    console.log('🗑️ [ADMIN] Deleting organization:', organizationId);
    
    const response = await adminApiClient.delete(`finance/organizations/${organizationId}`);
    
    console.log('✅ Organization deleted successfully');
    return {
      success: true,
      message: 'Organization deleted successfully'
    };
  } catch (error) {
    console.error('❌ Failed to delete organization:', error);
    throw error;
  }
};

/**
 * Update organization
 */
export const updateOrganization = async (organizationId, updateData) => {
  try {
    console.log('✏️ [ADMIN] Updating organization:', organizationId);
    
    const response = await adminApiClient.put(
      `finance/organizations/${organizationId}`,
      updateData
    );
    
    console.log('✅ Organization updated successfully');
    return {
      success: true,
      data: response.data.data,
      message: 'Organization updated successfully'
    };
  } catch (error) {
    console.error('❌ Failed to update organization:', error);
    throw error;
  }
};

// ===== LOAN MANAGEMENT =====

/**
 * Get all loans
 */
export const getLoans = async (filters = {}) => {
  try {
    console.log('📋 [ADMIN] Fetching loans');
    
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.country) params.append('country', filters.country);
    if (filters.category) params.append('category', filters.category);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await adminApiClient.get(`/loans?${params.toString()}`);
    
    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    console.error('❌ Failed to fetch loans:', error);
    throw error;
  }
};

/**
 * Add new loan
 */
export const addLoan = async (loanData) => {
  try {
    console.log('➕ [ADMIN] Adding new loan');
    
    const response = await adminApiClient.post('/admin/loans', loanData);
    
    console.log('✅ Loan added successfully');
    return {
      success: true,
      data: response.data.data,
      message: 'Loan added successfully'
    };
  } catch (error) {
    console.error('❌ Failed to add loan:', error);
    throw error;
  }
};

/**
 * Update loan
 */
export const updateLoan = async (loanId, loanData) => {
  try {
    console.log('✏️ [ADMIN] Updating loan:', loanId);
    
    const response = await adminApiClient.put(`/admin/loans/${loanId}`, loanData);
    
    console.log('✅ Loan updated successfully');
    return {
      success: true,
      data: response.data.data,
      message: 'Loan updated successfully'
    };
  } catch (error) {
    console.error('❌ Failed to update loan:', error);
    throw error;
  }
};

/**
 * Delete loan
 */
export const deleteLoan = async (loanId) => {
  try {
    console.log('🗑️ [ADMIN] Deleting loan:', loanId);
    
    const response = await adminApiClient.delete(`/admin/loans/${loanId}`);
    
    console.log('✅ Loan deleted successfully');
    return {
      success: true,
      message: 'Loan deleted successfully'
    };
  } catch (error) {
    console.error('❌ Failed to delete loan:', error);
    throw error;
  }
};

// ===== ANALYTICS =====

/**
 * Get application statistics
 */
export const getApplicationStats = async () => {
  try {
    console.log('📊 [ADMIN] Fetching application stats');
    
    const response = await adminApiClient.get('/analytics/stats');
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('❌ Failed to fetch stats:', error);
    throw error;
  }
};

/**
 * Get popular loans
 */
export const getPopularLoans = async (limit = 10) => {
  try {
    console.log('⭐ [ADMIN] Fetching popular loans');
    
    const response = await adminApiClient.get(`/analytics/popular-loans?limit=${limit}`);
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('❌ Failed to fetch popular loans:', error);
    throw error;
  }
};

/**
 * Get application analytics
 */
export const getApplicationAnalytics = async (limit = 50, skip = 0) => {
  try {
    console.log('📈 [ADMIN] Fetching application analytics');
    
    const response = await adminApiClient.get(
      `/analytics/applications?limit=${limit}&skip=${skip}`
    );
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('❌ Failed to fetch analytics:', error);
    throw error;
  }
};

// Export all functions
export default {
  // Organizations
  getOrganizations,
  getOrganizationById,
  getOrganizationStats,
  reviewOrganization,
  deleteOrganization,
  updateOrganization,
  
  // Loans
  getLoans,
  addLoan,
  updateLoan,
  deleteLoan,
  
  // Analytics
  getApplicationStats,
  getPopularLoans,
  getApplicationAnalytics
};