import express from 'express';
import {
  createListingOrder,
  verifyCargoPayment,
  getPaymentHistory,
  getPaymentByOrderId,
  refundPayment,
} from '../../controllers/cargoInsurance/cargoPaymentController.js';
import { protect } from '../../middleware/auth.js';
import { protectAdmin } from '../../middleware/adminAuth.js';

const router = express.Router();

// ========== PUBLIC ROUTES ==========
// Create payment order (no auth required for initial order creation)
router.post('/create-listing-order', createListingOrder);

// Verify payment (no auth required as it uses signature verification)
router.post('/verify-payment', verifyCargoPayment);

// ========== PROTECTED ROUTES (USER) ==========
// Get payment history for a companya
router.get('/company/:companyId', protect, getPaymentHistory);

// Get payment by order ID
router.get('/order/:orderId', protect, getPaymentByOrderId);

// ========== ADMIN ONLY ROUTES ==========
// Refund a payment
router.post('/refund', protectAdmin, refundPayment);

export default router;