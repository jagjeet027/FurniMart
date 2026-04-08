import express from 'express';
import financeService from '../../services/financeService.js';
import { protect, optionalAuth } from '../../middleware/authMiddleware.js';
import asyncHandler from '../../middleware/asyncHandler.js';

const router = express.Router();

console.log('🚀 Finance Routes Initialized');

// ===== PUBLIC LOAN ROUTES =====

// Get all loans with filters
router.get('/loans', asyncHandler(async (req, res) => {
  console.log('📡 GET /loans - Query params:', req.query);
  
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

  console.log('✅ Loans fetched:', result.data?.length);
  res.status(result.success ? 200 : 400).json(result);
}));

// Get single loan by ID
router.get('/loans/:id', asyncHandler(async (req, res) => {
  console.log('📡 GET /loans/:id -', req.params.id);
  const result = await financeService.getLoanById(req.params.id);
  res.status(result.success ? 200 : 404).json(result);
}));

// Get loans by country
router.get('/loans-by-country/:country', asyncHandler(async (req, res) => {
  console.log('📡 GET /loans-by-country -', req.params.country);
  const result = await financeService.getLoansbyCountry(req.params.country);
  res.status(200).json(result);
}));

// Get unique countries
router.get('/countries', asyncHandler(async (req, res) => {
  console.log('📡 GET /countries');
  const result = await financeService.getUniqueCountries();
  res.status(200).json(result);
}));

// Track loan application
router.post('/track-application', asyncHandler(async (req, res) => {
  console.log('📤 POST /track-application');
  
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
  console.log('📡 GET /analytics/stats');
  const result = await financeService.getApplicationStats();
  res.status(200).json(result);
}));

// Get popular loans
router.get('/analytics/popular-loans', asyncHandler(async (req, res) => {
  console.log('📡 GET /analytics/popular-loans');
  const limit = parseInt(req.query.limit) || 10;
  const result = await financeService.getPopularLoans(limit);
  res.status(200).json(result);
}));

// Get application analytics
router.get('/analytics/applications', asyncHandler(async (req, res) => {
  console.log('📡 GET /analytics/applications');
  const limit = parseInt(req.query.limit) || 50;
  const skip = parseInt(req.query.skip) || 0;
  const result = await financeService.getApplicationAnalytics(limit, skip);
  res.status(200).json(result);
}));

// ===== ORGANIZATION ROUTES (PUBLIC SUBMISSION) =====

// ✅ FIXED: Submit organization - PUBLIC ENDPOINT
router.post('/organizations', asyncHandler(async (req, res) => {
  console.log('📤 POST /organizations - New organization submission');
  console.log('📋 Body received:', req.body);
  
  try {
    const result = await financeService.submitOrganization({
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    console.log('✅ Organization submitted successfully:', result.data?.id);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error('❌ Organization submission error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors
    });
  }
}));

// ✅ Get organizations (ADMIN & PUBLIC)
router.get('/organizations', asyncHandler(async (req, res) => {
  console.log('📡 GET /organizations');
  console.log('Query params:', req.query);
  
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

  console.log('✅ Organizations fetched:', result.data?.length);
  res.status(200).json(result);
}));

// Get single organization
router.get('/organizations/:id', asyncHandler(async (req, res) => {
  console.log('📡 GET /organizations/:id -', req.params.id);
  const result = await financeService.getOrganizationById(req.params.id);
  res.status(result.success ? 200 : 404).json(result);
}));

// ✅ FIXED: Review organization (ADMIN ONLY - requires authentication)
router.put('/organizations/:id/review', protect, asyncHandler(async (req, res) => {
  console.log('📝 PUT /organizations/:id/review');
  console.log('Authenticated user:', req.user?.email);
  console.log('Review data:', req.body);
  
  const { status, reviewNotes, reviewerName } = req.body;

  // Validate required fields
  if (!status || !reviewerName) {
    return res.status(400).json({
      success: false,
      message: 'Status and reviewer name are required'
    });
  }

  const result = await financeService.reviewOrganization(req.params.id, {
    status,
    reviewNotes,
    reviewerName: reviewerName || req.user?.email || 'Admin'
  });

  console.log('✅ Organization reviewed:', result.success);
  res.status(result.success ? 200 : 400).json(result);
}));

// Get organization statistics
router.get('/organizations-stats', asyncHandler(async (req, res) => {
  console.log('📡 GET /organizations-stats');
  const result = await financeService.getOrganizationStats();
  res.status(200).json(result);
}));

// ===== ADMIN LOAN MANAGEMENT ROUTES =====

// Add loan (admin only)
router.post('/admin/loans', protect, asyncHandler(async (req, res) => {
  console.log('📤 POST /admin/loans');
  const result = await financeService.addLoan(req.body);
  res.status(result.success ? 201 : 400).json(result);
}));

// Update loan (admin only)
router.put('/admin/loans/:id', protect, asyncHandler(async (req, res) => {
  console.log('📝 PUT /admin/loans/:id');
  const result = await financeService.updateLoan(req.params.id, req.body);
  res.status(result.success ? 200 : 400).json(result);
}));

// Delete loan (admin only)
router.delete('/admin/loans/:id', protect, asyncHandler(async (req, res) => {
  console.log('🗑️ DELETE /admin/loans/:id');
  const result = await financeService.deleteLoan(req.params.id);
  res.status(result.success ? 200 : 400).json(result);
}));

// Health check
router.get('/health', (req, res) => {
  console.log('🏥 Health check');
  res.status(200).json({
    status: 'ok',
    message: 'Finance service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;