import api from './api';

export const cargoDashboardAPI = {
  // ========== DASHBOARD STATISTICS ==========
  dashboard: {
    getStats: () => 
      api.get('/cargo/admin/dashboard/stats'),
    
    getRecentSubmissions: () => 
      api.get('/cargo/admin/dashboard/stats').then(res => res.data.data.recentSubmissions),
  },

  // ========== COMPANY MANAGEMENT ==========
  companies: {
    // Get pending companies
    getPending: (search = '', sortBy = 'newest') =>
      api.get('/cargo/admin/companies/pending', {
        params: { search, sortBy }
      }),

    // Get all companies with filters
    getAll: (filters = {}) =>
      api.get('/cargo/admin/companies', {
        params: filters
      }),

    // Get single company details
    getById: (id) =>
      api.get(`/cargo/admin/companies/${id}`),

    // Approve company
    approve: (id) =>
      api.post(`/cargo/admin/companies/${id}/approve`),

    // Reject company with reason
    reject: (id, reason) =>
      api.post(`/cargo/admin/companies/${id}/reject`, { reason }),

    // Delete company
    delete: (id) =>
      api.delete(`/cargo/admin/companies/${id}`),

    // Bulk approve companies
    bulkApprove: (companyIds) =>
      api.post('/cargo/admin/companies/bulk/approve', { companyIds }),

    // Export companies data
    export: () =>
      api.get('/cargo/admin/companies/export/data', {
        responseType: 'blob'
      }),
  },

  // ========== SHIPMENTS ==========
  shipments: {
    // Get all shipments with filters
    getAll: (filters = {}) =>
      api.get('/cargo/admin/shipments', {
        params: filters
      }),

    // Get shipment details
    getById: (id) =>
      api.get(`/cargo/admin/shipments/${id}`),

    // Get shipments by status
    getByStatus: (status, page = 1, limit = 10) =>
      api.get('/cargo/admin/shipments', {
        params: { status, page, limit }
      }),

    // Get shipments by cargo type
    getByCargoType: (cargoType, page = 1, limit = 10) =>
      api.get('/cargo/admin/shipments', {
        params: { cargoType, page, limit }
      }),

    // Get shipments by transport mode
    getByTransportMode: (transportMode, page = 1, limit = 10) =>
      api.get('/cargo/admin/shipments', {
        params: { transportMode, page, limit }
      }),
  },

  // ========== QUOTES ==========
  quotes: {
    // Get all quotes with filters
    getAll: (filters = {}) =>
      api.get('/cargo/admin/quotes', {
        params: filters
      }),

    // Get quote details
    getById: (id) =>
      api.get(`/cargo/admin/quotes/${id}`),

    // Get quotes by status
    getByStatus: (status, page = 1, limit = 10) =>
      api.get('/cargo/admin/quotes', {
        params: { status, page, limit }
      }),

    // Get quotes for shipment
    getForShipment: (shipmentId) =>
      api.get(`/cargo/admin/shipments/${shipmentId}/quotes`),
  },

  // ========== PAYMENTS ==========
  payments: {
    // Get all payments with filters
    getAll: (filters = {}) =>
      api.get('/cargo/admin/payments', {
        params: filters
      }),

    // Get payment details
    getById: (id) =>
      api.get(`/cargo/admin/payments/${id}`),

    // Get payment by order ID
    getByOrderId: (orderId) =>
      api.get(`/cargo/payments/order/${orderId}`),

    // Get payments by status
    getByStatus: (status, page = 1, limit = 10) =>
      api.get('/cargo/admin/payments', {
        params: { status, page, limit }
      }),

    // Get payment statistics
    getStatistics: () =>
      api.get('/cargo/payments/admin/statistics'),

    // Process refund
    refund: (paymentId, reason) =>
      api.post(`/cargo/payments/admin/refund/${paymentId}`, { reason }),
  },

  // ========== ANALYTICS ==========
  analytics: {
    // Get all analytics data
    getAll: () =>
      api.get('/cargo/admin/analytics/data'),

    // Get revenue analytics
    getRevenue: () =>
      api.get('/cargo/admin/analytics/data').then(res => res.data.data.revenueByMonth),

    // Get top performing companies
    getTopCompanies: () =>
      api.get('/cargo/admin/analytics/data').then(res => res.data.data.topCompanies),

    // Get company status distribution
    getStatusDistribution: () =>
      api.get('/cargo/admin/analytics/data').then(res => res.data.data.companyStatuses),

    // Get shipment analytics
    getShipmentAnalytics: () =>
      api.get('/cargo/admin/analytics/data').then(res => ({
        totalShipments: res.data.data.totalShipments,
        byMode: res.data.data.shipmentsByMode,
        byCargoType: res.data.data.cargoTypeDistribution
      })),
  },

  // ========== SYSTEM SETTINGS ==========
  settings: {
    // Get system settings
    get: () =>
      api.get('/cargo/admin/settings'),

    // Update system settings
    update: (settingsData) =>
      api.put('/cargo/admin/settings', settingsData),

    // Get listing fee
    getListingFee: () =>
      api.get('/cargo/admin/settings').then(res => res.data.data.listingFee),

    // Update listing fee
    updateListingFee: (newFee) =>
      api.put('/cargo/admin/settings', { listingFee: newFee }),
  },

  // ========== SEARCH & FILTER HELPERS ==========
  search: {
    // Search companies by name or email
    companies: (query) =>
      cargoDashboardAPI.companies.getAll({ search: query }),

    // Search shipments by cargo type
    shipments: (cargoType) =>
      cargoDashboardAPI.shipments.getByCargoType(cargoType),

    // Search payments by status
    payments: (status) =>
      cargoDashboardAPI.payments.getByStatus(status),
  },

  // ========== BULK OPERATIONS ==========
  bulk: {
    // Approve multiple companies
    approveCompanies: (companyIds) =>
      api.post('/cargo/admin/companies/bulk/approve', { companyIds }),

    // Reject multiple companies
    rejectCompanies: (companyIds, reason) =>
      api.post('/cargo/admin/companies/bulk/reject', { companyIds, reason }),

    // Delete multiple companies
    deleteCompanies: (companyIds) =>
      Promise.all(companyIds.map(id => cargoDashboardAPI.companies.delete(id))),
  },

  // ========== EXPORT FUNCTIONS ==========
  export: {
    // Export companies to CSV
    companies: async () => {
      try {
        const response = await cargoDashboardAPI.companies.export();
        downloadFile(response.data, 'companies_data.csv', 'text/csv');
        return { success: true };
      } catch (error) {
        console.error('Export failed:', error);
        throw error;
      }
    },

    // Export analytics to JSON
    analytics: async () => {
      try {
        const data = await cargoDashboardAPI.analytics.getAll();
        downloadFile(
          JSON.stringify(data, null, 2),
          'analytics_data.json',
          'application/json'
        );
        return { success: true };
      } catch (error) {
        console.error('Export failed:', error);
        throw error;
      }
    },

    // Export payments to CSV
    payments: async () => {
      try {
        const response = await api.get('/cargo/admin/payments/export/data', {
          responseType: 'blob'
        });
        downloadFile(response.data, 'payments_data.csv', 'text/csv');
        return { success: true };
      } catch (error) {
        console.error('Export failed:', error);
        throw error;
      }
    },
  }
};

// ========== HELPER FUNCTION ==========
// Download file helper
function downloadFile(data, filename, type) {
  const url = window.URL.createObjectURL(new Blob([data], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentElement.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// ========== PAGINATION HELPER ==========
export const createPaginationParams = (page = 1, limit = 10, filters = {}) => ({
  ...filters,
  page,
  limit
});

// ========== ERROR HANDLING WRAPPER ==========
export const withErrorHandling = async (apiCall) => {
  try {
    const response = await apiCall();
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
};