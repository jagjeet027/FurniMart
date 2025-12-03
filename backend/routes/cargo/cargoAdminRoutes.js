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
  // Loan Provider Admin Routes
  getPendingLoanProviders,
  getAllLoanProvidersAdmin,
  approveLoanProvider,
  rejectLoanProvider,
  deleteLoanProviderAdmin,
  getLoanProviderDetailsAdmin,
} from '../../controllers/cargoInsurance/cargoAdminController.js';
import { protectAdmin } from '../../middleware/adminAuth.js';

const router = express.Router();

router.use(protectAdmin);

// ========== INSURANCE COMPANY ROUTES ==========
router.get('/dashboard/stats', getDashboardStats);
router.get('/companies/pending', getPendingCompanies);
router.get('/companies', getAllCompaniesAdmin);
router.get('/companies/:id', getCompanyDetailsAdmin);
router.post('/companies/:id/approve', approveCompany);
router.post('/companies/:id/reject', rejectCompany);
router.delete('/companies/:id', deleteCompanyAdmin);
router.post('/companies/bulk/approve', bulkApproveCompanies);
router.get('/companies/export/data', exportCompaniesData);

// ========== LOAN PROVIDER ROUTES - NEW ==========
router.get('/loan-providers/pending', getPendingLoanProviders);
router.get('/loan-providers', getAllLoanProvidersAdmin);
router.get('/loan-providers/:id', getLoanProviderDetailsAdmin);
router.post('/loan-providers/:id/approve', approveLoanProvider);
router.post('/loan-providers/:id/reject', rejectLoanProvider);
router.delete('/loan-providers/:id', deleteLoanProviderAdmin);

// ========== SHIPMENTS, QUOTES, PAYMENTS ==========
router.get('/shipments', getAllShipments);
router.get('/quotes', getAllQuotes);
router.get('/payments', getAllPayments);

// ========== ANALYTICS & SETTINGS ==========
router.get('/analytics/data', getAnalytics);
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

export default router;
