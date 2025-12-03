// backend/routes/financeRoutes.js
import express from 'express';
import financeService from '../../services/financeService.js';
import { protect } from '../../middleware/authMiddleware.js';
import asyncHandler from '../../middleware/asyncHandler.js';

const router = express.Router();

// ===== PUBLIC LOAN ROUTES =====

// Get all loans with filters
router.get('/loans', asyncHandler(async (req, res) => {
  const {
    country,
    category,
    lenderType,
    minAmount,
    maxAmount,
    collateralRequired,
    search,
    limit
  } = req.query;

  let result;

  if (search) {
    result = await financeService.searchLoans(search, {
      country,
      category,
      lenderType,
      limit
    });
  } else {
    result = await financeService.getAllLoans({
      country,
      category,
      lenderType,
      minAmount: minAmount ? parseInt(minAmount) : undefined,
      maxAmount: maxAmount ? parseInt(maxAmount) : undefined,
      collateralRequired,
      limit: limit ? parseInt(limit) : 100
    });
  }

  res.status(result.success ? 200 : 400).json(result);
}));

// Get single loan by ID
router.get('/loans/:id', asyncHandler(async (req, res) => {
  const result = await financeService.getLoanById(req.params.id);
  res.status(result.success ? 200 : 404).json(result);
}));

// Get loans by country
router.get('/loans-by-country/:country', asyncHandler(async (req, res) => {
  const result = await financeService.getLoansbyCountry(req.params.country);
  res.status(200).json(result);
}));

// Get unique countries
router.get('/countries', asyncHandler(async (req, res) => {
  const result = await financeService.getUniqueCountries();
  res.status(200).json(result);
}));

// Track loan application
router.post('/track-application', asyncHandler(async (req, res) => {
  const {
    loanId,
    loanName,
    lender,
    country,
    category,
    lenderType,
    applicationUrl
  } = req.body;

  const result = await financeService.trackLoanApplication({
    loanId,
    loanName,
    lender,
    country,
    category,
    lenderType,
    applicationUrl,
    sessionId: req.headers['x-session-id'] || 'anonymous',
    userIp: req.ip,
    userAgent: req.headers['user-agent'],
    referrer: req.headers.referer
  });

  res.status(result.success ? 201 : 400).json(result);
}));

// ===== ANALYTICS ROUTES =====

// Get application statistics
router.get('/analytics/stats', asyncHandler(async (req, res) => {
  const result = await financeService.getApplicationStats();
  res.status(200).json(result);
}));

// Get popular loans
router.get('/analytics/popular-loans', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const result = await financeService.getPopularLoans(limit);
  res.status(200).json(result);
}));

// Get application analytics
router.get('/analytics/applications', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const skip = parseInt(req.query.skip) || 0;
  const result = await financeService.getApplicationAnalytics(limit, skip);
  res.status(200).json(result);
}));

// ===== ORGANIZATION ROUTES =====

// Submit organization
router.post('/organizations', asyncHandler(async (req, res) => {
  const result = await financeService.submitOrganization({
    ...req.body,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.status(result.success ? 201 : 400).json(result);
}));

// Get organizations (public for admin panel)
router.get('/organizations', asyncHandler(async (req, res) => {
  const {
    status,
    organizationType,
    limit,
    skip
  } = req.query;

  const result = await financeService.getOrganizations({
    status,
    organizationType,
    limit: limit ? parseInt(limit) : 100,
    skip: skip ? parseInt(skip) : 0
  });

  res.status(200).json(result);
}));

// Get single organization
router.get('/organizations/:id', asyncHandler(async (req, res) => {
  const result = await financeService.getOrganizationById(req.params.id);
  res.status(result.success ? 200 : 404).json(result);
}));

// Review organization (admin only)
router.put('/organizations/:id/review', protect, asyncHandler(async (req, res) => {
  const { status, reviewNotes, reviewerName } = req.body;

  const result = await financeService.reviewOrganization(req.params.id, {
    status,
    reviewNotes,
    reviewerName: reviewerName || req.user?.email || 'Admin'
  });

  res.status(result.success ? 200 : 400).json(result);
}));

// Get organization statistics
router.get('/organizations-stats', asyncHandler(async (req, res) => {
  const result = await financeService.getOrganizationStats();
  res.status(200).json(result);
}));

// ===== ADMIN LOAN MANAGEMENT ROUTES =====

// Add loan (admin only)
router.post('/admin/loans', protect, asyncHandler(async (req, res) => {
  // Add admin check if needed
  const result = await financeService.addLoan(req.body);
  res.status(result.success ? 201 : 400).json(result);
}));

// Update loan (admin only)
router.put('/admin/loans/:id', protect, asyncHandler(async (req, res) => {
  const result = await financeService.updateLoan(req.params.id, req.body);
  res.status(result.success ? 200 : 400).json(result);
}));

// Delete loan (admin only)
router.delete('/admin/loans/:id', protect, asyncHandler(async (req, res) => {
  const result = await financeService.deleteLoan(req.params.id);
  res.status(result.success ? 200 : 400).json(result);
}));

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Finance service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;