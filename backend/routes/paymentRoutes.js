// routes/payment.js
import express from 'express';
import { createOrder, verifyPayment, getPaymentDetails } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/details/:manufacturerId', getPaymentDetails);

export default router;