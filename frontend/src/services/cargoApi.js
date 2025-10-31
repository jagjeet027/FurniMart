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

  // Payment APIs
  payments: {
    createOrder: (companyId) => api.post('/cargo/payments/create-listing-order', { companyId }),
    verifyPayment: (data) => api.post('/cargo/payments/verify-payment', data),
  },
};