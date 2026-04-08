import api from '../axios/axiosInstance.js';

export const cargoAPI = {
  // Company APIs
  companies: {
    getAll: (filters) => api.get('/cargo/companies', { params: filters }),
    getApproved: () => api.get('/cargo/companies/approved'),
    register: (data) => api.post('/cargo/companies/register', data),
    getById: (id) => api.get(`/cargo/companies/${id}`),
    update: (id, data) => api.put(`/cargo/companies/${id}`, data),
    delete: (id) => api.delete(`/cargo/companies/${id}`),
    trackClick: (id) => api.post(`/cargo/companies/${id}/track-click`),
  },

  // Loan Provider APIs - NEW
  loanProviders: {
    getAll: (filters) => api.get('/cargo/loan-providers', { params: filters }),
    getApproved: () => api.get('/cargo/loan-providers/approved'),
    register: (data) => api.post('/cargo/loan-providers/register', data),
    getById: (id) => api.get(`/cargo/loan-providers/${id}`),
    update: (id, data) => api.put(`/cargo/loan-providers/${id}`, data),
    delete: (id) => api.delete(`/cargo/loan-providers/${id}`),
    trackClick: (id) => api.post(`/cargo/loan-providers/${id}/track-click`),
  },

  // Shipment APIs
  shipments: {
    search: (params) => api.get('/cargo/shipments/search', { params }),
    create: (data) => api.post('/cargo/shipments', data),
    getById: (id) => api.get(`/cargo/shipments/${id}`),
  },

  // Quote APIs
  quotes: {
    getForShipment: (shipmentId) => api.get(`/cargo/quotes/shipment/${shipmentId}`),
    create: (data) => api.post('/cargo/quotes', data),
    accept: (id) => api.put(`/cargo/quotes/${id}/accept`),
    reject: (id) => api.put(`/cargo/quotes/${id}/reject`),
  },

  payments: {
    // Create order - NO AUTH required (uses signature verification)
    createOrder: (companyId, type = 'insurance') => 
      api.post('/cargo/payments/create-listing-order', { companyId, type }),
    
    // Verify payment - NO AUTH required (uses signature verification)
    verifyPayment: (data) => 
      api.post('/cargo/payments/verify-payment', data),
    
    // Get payment history - REQUIRES AUTH
    getHistory: (companyId) => 
      api.get(`/cargo/payments/company/${companyId}`),
    
    // Get payment by order ID - REQUIRES AUTH
    getByOrderId: (orderId) => 
      api.get(`/cargo/payments/order/${orderId}`),
    
    // Refund payment - ADMIN ONLY
    refund: (paymentId, amount, reason) =>
      api.post('/cargo/payments/refund', { paymentId, amount, reason }),
  },
};