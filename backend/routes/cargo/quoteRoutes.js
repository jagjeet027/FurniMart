import express from 'express';
import {
  getQuotesForShipment,
  createQuote,
  acceptQuote,
  rejectQuote,
} from '../../controllers/cargoInsurance/quoteController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.get('/shipment/:shipmentId', protect, getQuotesForShipment);
router.post('/', protect, createQuote);
router.put('/:id/accept', protect, acceptQuote);
router.put('/:id/reject', protect, rejectQuote);

export default router;