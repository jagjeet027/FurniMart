// routes/cargo/cargoAdminRoutes.js
import express from 'express';
import {
  getDashboardStats,
  getPendingCompanies,
  getAllCompaniesAdmin,
  approveCompany,
  rejectCompany,
  deleteCompanyAdmin,
  getCompanyDetailsAdmin,
  getAnalytics,
  getAllPayments,
  getAllShipments,
  getAllQuotes,
  getSystemSettings,
  updateSystemSettings,
  bulkApproveCompanies,
  exportCompaniesData,
} from '../../controllers/cargoInsurance/cargoAdminController.js';
import { protectAdmin } from '../../middleware/adminAuth.js';

const router = express.Router();

// Apply admin authentication middleware to all routes
router.use(protectAdmin);

// ========== DASHBOARD ==========
router.get('/dashboard/stats', getDashboardStats);

// ========== COMPANY MANAGEMENT ==========
router.get('/companies/pending', getPendingCompanies);
router.get('/companies', getAllCompaniesAdmin);
router.get('/companies/:id', getCompanyDetailsAdmin);
router.post('/companies/:id/approve', approveCompany);
router.post('/companies/:id/reject', rejectCompany);
router.delete('/companies/:id', deleteCompanyAdmin);
router.post('/companies/bulk/approve', bulkApproveCompanies);
router.get('/companies/export/data', exportCompaniesData);

// ========== SHIPMENTS ==========
router.get('/shipments', getAllShipments);

// ========== QUOTES ==========
router.get('/quotes', getAllQuotes);

// ========== PAYMENTS ==========
router.get('/payments', getAllPayments);

// ========== ANALYTICS ==========
router.get('/analytics/data', getAnalytics);

// ========== SYSTEM SETTINGS ==========
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

export default router;