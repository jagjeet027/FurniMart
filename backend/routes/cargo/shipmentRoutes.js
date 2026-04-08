import express from 'express';
import {
  searchShipments,
  createShipment,
  getShipmentById,
} from '../../controllers/cargoInsurance/shipmentController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.get('/search', searchShipments);
router.post('/', protect, createShipment);
router.get('/:id', protect, getShipmentById);

export default router;