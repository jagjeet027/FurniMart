// backend/routes/cargo/cargoPaymentRoutes.js

import express from 'express';
import {
  createListingOrder,
  verifyCargoPayment,
  getCompanyPaymentHistory,
  getAllCargoPayments,
  getPaymentByOrderId,
  refundCargoPayment, 
  getPaymentStatistics
} from '../../controllers/cargoInsurance/cargoPaymentController.js';

const router = express.Router();

// ========== PUBLIC ROUTES ==========
router.post('/create-listing-order', createListingOrder);
router.post('/verify-payment', verifyCargoPayment);

// ========== AUTHENTICATED COMPANY ROUTES ==========
router.get('/company/:companyId', getCompanyPaymentHistory);
router.get('/order/:orderId', getPaymentByOrderId);

// ========== ADMIN ROUTES ==========

router.get('/admin/all', getAllCargoPayments);
router.get('/admin/statistics',  getPaymentStatistics);
router.post('/admin/refund/:paymentId',refundCargoPayment);

export default router;